mod bits_acc;
mod bitvec;
mod bitvec_mip;
mod bitvec_rect;
mod country_lut;
mod space_filling;
mod vec2;

use bencode_rs::Value;
use bits_acc::BitsAcc;
use bitvec::BitVec;
use bitvec_mip::BitVecMip;
use bitvec_rect::{BitVecRect, Mode, SpaceFillingCache};
use country_lut::{lut, LUT_H, LUT_W};
use rayon::iter::{IntoParallelIterator, IntoParallelRefIterator, ParallelIterator};
use std::{
    env::args,
    fs::File,
    io::{self, BufWriter, Read},
    num::TryFromIntError,
    path::Path,
    string::FromUtf8Error,
    sync::atomic::{AtomicU32, Ordering},
};
use zstd::stream::read::Decoder;

// This is the closest to a square factoring of two billion possible
pub const W: u32 = 50_000;
pub const H: u32 = 40_000;
pub const MIPMAP_SIZE: u32 = 1024;

fn main() -> Result<(), AppError> {
    let (filepath, output_directory) = {
        let mut args = args();
        let mut filepath = None;
        let mut output_directory = None;
        while let Some(arg) = args.next() {
            match arg.as_str() {
                "--input-filepath" => filepath = args.next(),
                "--output-directory" => output_directory = args.next(),
                _ => {}
            }
        }
        let Some(filepath) = filepath else {
            return Err(AppError::ArgInput);
        };
        let Some(output_directory) = output_directory else {
            return Err(AppError::ArgOutput);
        };
        (filepath, output_directory)
    };

    let records = {
        let file = File::open(filepath)?;
        let mut zstd_stream = Decoder::new(file)?;
        let mut bytes = vec![];
        zstd_stream.read_to_end(&mut bytes)?;
        bencode_rs::parse_all(bytes.as_slice())?
    };

    let Ok([Value::Dictionary(records)]) = TryInto::<[_; 1]>::try_into(records) else {
        return Err(AppError::StructureDictionary);
    };
    let records = records
        .into_iter()
        .map(|(key, value)| {
            let (Value::ByteString(key), Value::ByteString(value)) = (key, value) else {
                return Err(AppError::StructureKeyValue);
            };
            let key = String::from_utf8(key)?;
            let value_iter = value.chunks_exact(4);
            if !value_iter.remainder().is_empty() {
                return Err(AppError::StructureStreaksRemainder);
            }
            let streaks: Vec<_> = value_iter
                .map(|value| {
                    let [a, b, c, d] = value else {
                        unreachable!();
                    };
                    u32::from_le_bytes([*a, *b, *c, *d])
                })
                .collect();
            Ok((key, streaks))
        })
        .collect::<Result<Vec<(_, _)>, _>>()?;

    let records: Vec<_> = records
        .into_iter()
        .map(|(key, value)| {
            let iter = value.chunks(2);
            let mut bits = BitVec::new();
            for pair in iter {
                let (streak, gap) = match pair {
                    [streak] => (*streak, 0),
                    [streak, gap] => (*streak, *gap),
                    _ => unreachable!(),
                };
                bits.extend_range(streak as usize, true);
                bits.extend_range(gap as usize, false);
            }
            (key, bits)
        })
        .collect();

    let output_directory = Path::new(output_directory.as_str());

    let total_images = records.len() as u32
        * 2
        * (0..7)
            .map(|level| {
                let cell_size = 2u32.pow(level);
                let count_x = (W / MIPMAP_SIZE).div_ceil(cell_size);
                let count_y = (H / MIPMAP_SIZE).div_ceil(cell_size);
                count_x * count_y
            })
            .sum::<u32>();
    let count = AtomicU32::new(0);

    println!("Creating cache");
    let space_filling_cache = SpaceFillingCache::new();
    let space_filling_cache = &space_filling_cache;
    println!("Created cache");
    println!();

    println!("Creating country LUT");
    let data = lut();
    let data = data.as_slice();
    let path = output_directory.join("country_lut_scanline.png");
    write_lut(&path, data)?;

    let data: Vec<_> = (0..LUT_H)
        .flat_map(|y| {
            (0..LUT_W).map(move |x| {
                let i = space_filling_cache.get(x * W / LUT_W, y * H / LUT_H);
                let i = (i as u64) * LUT_W as u64 * LUT_H as u64 / W as u64 / H as u64;
                if i >= 200000 {
                    println!("{i}");
                }
                data[i.min(200000 - 1) as usize]
            })
        })
        .collect();
    let path = output_directory.join("country_lut_spacefilling.png");
    write_lut(&path, data.as_slice())?;

    return Ok(());

    records
        .par_iter()
        .map(|(key, record)| {
            [Mode::Scanline, Mode::SpaceFilling(&space_filling_cache)]
                .par_iter()
                .map(|mode| {
                    let rect = BitVecRect::new(record, *mode);
                    (0..7)
                        .into_par_iter()
                        .map(|level| -> Result<(), AppError> {
                            let rect = BitVecMip::new(&rect, level);
                            let cell_size = 2u32.pow(level);
                            let count_x = (W / MIPMAP_SIZE).div_ceil(cell_size);
                            let count_y = (H / MIPMAP_SIZE).div_ceil(cell_size);
                            for y_mip in 0..count_y {
                                for x_mip in 0..count_x {
                                    let mut data = vec![];
                                    let mut acc = BitsAcc::new(cell_size);
                                    for y in 0..MIPMAP_SIZE {
                                        for x in 0..MIPMAP_SIZE {
                                            if let Some(byte) = acc.add(rect.sum_at(
                                                x_mip * MIPMAP_SIZE + x,
                                                y_mip * MIPMAP_SIZE + y,
                                            )) {
                                                data.push(byte)
                                            }
                                        }
                                    }

                                    let filename =
                                        format!("mip_{level}_{x_mip}_{y_mip}_{key}_{mode}.png");
                                    let path = output_directory.join(filename.as_str());
                                    let file = File::create(path)?;
                                    let w = BufWriter::new(file);

                                    let mut encoder =
                                        png::Encoder::new(w, MIPMAP_SIZE, MIPMAP_SIZE);
                                    encoder.set_color(png::ColorType::Grayscale);
                                    encoder.set_depth(match level {
                                        0 => png::BitDepth::One,
                                        1 => png::BitDepth::Two,
                                        2 => png::BitDepth::Four,
                                        _ => png::BitDepth::Eight,
                                    });
                                    encoder.set_filter(png::FilterType::NoFilter);
                                    encoder.set_compression(png::Compression::Best);
                                    encoder.set_source_srgb(
                                        png::SrgbRenderingIntent::RelativeColorimetric,
                                    );

                                    let mut w = encoder.write_header()?;
                                    w.write_image_data(&data)?;

                                    let count = count.fetch_add(1, Ordering::Relaxed);
                                    let percent = (count as f32) / (total_images as f32) * 100.0;
                                    println!(
                                        "\x1b[1F\x1b[KFinished {percent:.2}% {count} {filename}"
                                    );
                                }
                            }

                            Ok(())
                        })
                        .collect()
                })
                .collect()
        })
        .collect()
}

#[allow(dead_code)]
fn print_kind(value: &Value) {
    let s = match value {
        Value::Integer(_) => "Integer",
        Value::ByteString(_) => "ByteString",
        Value::List(_) => "List",
        Value::Dictionary(_) => "Dictionary",
    };
    println!("{s}");
}

#[derive(Debug, thiserror::Error)]
enum AppError {
    #[error("Missing --input-filepath argument")]
    ArgInput,
    #[error("Missing --output-directory argument")]
    ArgOutput,
    #[error("IO error: {0}")]
    Io(#[from] io::Error),
    #[error("Bencode: {0}")]
    Bencode(#[from] bencode_rs::ParseError),
    #[error("UTF-8: {0}")]
    Utf8(#[from] FromUtf8Error),
    #[error("Integer conversion: {0}")]
    Int(#[from] TryFromIntError),
    #[error("Expected dictionary")]
    StructureDictionary,
    #[error("Expected key and value of byte string")]
    StructureKeyValue,
    #[error("Expected value byte string length divisible by four")]
    StructureStreaksRemainder,
    #[error("PNG encoding error: {0}")]
    Png(#[from] png::EncodingError),
}

fn write_lut(path: &Path, data: &[u8]) -> Result<(), png::EncodingError> {
    let file = File::create(path)?;
    let w = BufWriter::new(file);

    let mut encoder = png::Encoder::new(w, LUT_W, LUT_H);
    encoder.set_color(png::ColorType::Grayscale);
    encoder.set_depth(png::BitDepth::Eight);
    encoder.set_filter(png::FilterType::NoFilter);
    encoder.set_compression(png::Compression::Best);
    encoder.set_source_srgb(png::SrgbRenderingIntent::AbsoluteColorimetric);

    let mut w = encoder.write_header()?;
    w.write_image_data(data)?;
    Ok(())
}
