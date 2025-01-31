use crate::vec2::Vec2;
use std::fmt::Display;
use Dir::*;

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
enum Dir {
    /// Top
    Tp,
    /// Diagonal
    Dg,
}

impl Display for Dir {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            Tp => "top",
            Dg => "diagonal",
        };
        write!(f, "{s}")
    }
}

pub fn space_filling(xy: Vec2, wh: Vec2) -> u32 {
    let (xy, wh) = if wh.is_wide() {
        (xy, wh)
    } else {
        (xy.flip(), wh.flip())
    };
    match wh.even() {
        (true, _) => sf(xy, wh, Tp),
        _ => sf(xy, wh, Dg),
    }
}

fn sf(xy: Vec2, wh: Vec2, dir: Dir) -> u32 {
    let (xy, wh) = if wh.is_wide() || dir == Tp {
        (xy, wh)
    } else {
        (xy.flip(), wh.flip())
    };

    match (xy, wh) {
        (_, Vec2(0, _)) | (_, Vec2(_, 0)) => return 0,
        (Vec2(x, 0), Vec2(_, 1)) => return x,
        _ => {}
    }

    let Vec2(x, y) = xy;
    let Vec2(w, h) = wh;
    assert!(x < w && y < h, "x {x}, w {w}, y {y}, h {h}");

    let w0 = w.div_ceil(2);
    let w1 = w - w0;
    let ew0 = w0 % 2 == 0;
    let ew1 = w1 % 2 == 0;
    let eh = h % 2 == 0;

    let sz0 = Vec2(w0, h);
    let sz1 = Vec2(w1, h);

    match (dir, eh, ew0, ew1, x < w0) {
        // 🭶🭶
        (Tp, true, true, true, true) => sf(xy, sz0, Tp),
        (Tp, true, true, true, false) => w * h - sf(Vec2(w - x - 1, y), sz1, Tp) - 1,

        // \/
        (Tp, true, false, false, true) => sf(xy, sz0, Dg),
        (Tp, true, false, false, false) => w * h - sf(Vec2(w - x - 1, y), sz1, Dg) - 1,

        // 🭶\
        (Dg, true, true, false, true) => sf(xy, sz0, Tp),
        (Dg, true, true, false, false) => w0 * h + sf(Vec2(x - w0, y), sz1, Dg),

        // \🭻
        (Dg, true, false, true, true) => sf(xy, sz0, Dg),
        (Dg, true, false, true, false) => w0 * h + sf(Vec2(x - w0, h - y - 1), sz1, Tp),

        // \/
        (Tp, false, true, true, true)
        | (Tp, false, false, false, true)
        | (Tp, false, true, false, true)
        | (Tp, false, false, true, true) => sf(xy, sz0, Dg),
        (Tp, false, true, true, false)
        | (Tp, false, false, false, false)
        | (Tp, false, true, false, false)
        | (Tp, false, false, true, false) => w * h - sf(Vec2(w - x - 1, y), sz1, Dg) - 1,

        // 🭶\
        (Dg, false, true, true, true)
        | (Dg, false, true, false, true)
        | (Dg, false, false, true, true)
        | (Dg, false, false, false, true) => sf(xy, sz0, Tp),
        (Dg, false, true, true, false)
        | (Dg, false, true, false, false)
        | (Dg, false, false, true, false)
        | (Dg, false, false, false, false) => w0 * h + sf(Vec2(x - w0, y), sz1, Dg),

        _ => panic!("{dir:?}, {w0}, {w1}, {h}"),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_space_filling() {
        for h in 2..=6u32 {
            for w in 2..=6u32 {
                let wh = Vec2(w, h);
                let zeroes = (w * h).ilog10() as usize + 1;
                for y in 0..h {
                    for x in 0..w {
                        let i = space_filling(Vec2(x, y), wh);
                        print!("{i:0zeroes$} ", zeroes = zeroes);
                    }
                    println!();
                }
                println!();
            }
        }
    }
}
