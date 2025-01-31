use crate::{bitvec::BitVec, space_filling::space_filling, vec2::Vec2, H, W};
use rayon::iter::{IntoParallelIterator, ParallelIterator};
use std::fmt::Display;

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct SpaceFillingCache(Vec<u32>);

impl SpaceFillingCache {
    pub fn new() -> Self {
        Self(
            (0..H)
                .into_par_iter()
                .flat_map(|y| {
                    (0..W)
                        .into_par_iter()
                        .map(move |x| space_filling(Vec2(x, y), Vec2(W, H)))
                })
                .collect(),
        )
    }

    pub fn get(&self, x: u32, y: u32) -> u32 {
        let i = y * W + x;
        self.0[i as usize]
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum Mode<'a> {
    Scanline,
    SpaceFilling(&'a SpaceFillingCache),
}

impl Mode<'_> {
    pub fn get(self, x: u32, y: u32) -> (u32, u32) {
        match self {
            Mode::Scanline => (x, y),
            Mode::SpaceFilling(cache) => {
                let i = cache.get(x, y);
                let x = i % W;
                let y = i / W;
                (x, y)
            }
        }
    }
}

impl Display for Mode<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            Mode::Scanline => "scanline",
            Mode::SpaceFilling(_) => "spacefilling",
        };
        write!(f, "{s}")
    }
}

pub struct BitVecRect<'a> {
    bits: &'a BitVec,
    mode: Mode<'a>,
}

impl<'a> BitVecRect<'a> {
    pub const fn new(bits: &'a BitVec, mode: Mode<'a>) -> Self {
        Self { bits, mode }
    }

    pub fn get(&self, x: u32, y: u32) -> bool {
        x < W && y < H && {
            let (x, y) = self.mode.get(x, y);
            let i = y * W + x;
            self.bits.get(i as usize).unwrap_or(false)
        }
    }
}
