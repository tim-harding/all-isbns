use crate::bitvec_rect::BitVecRect;

pub struct BitVecMip<'a> {
    bits: &'a BitVecRect<'a>,
    cell_size: u32,
}

impl<'a> BitVecMip<'a> {
    pub const fn new(bits: &'a BitVecRect<'a>, level: u32) -> Self {
        Self {
            bits,
            cell_size: 2u32.pow(level),
        }
    }

    pub fn sum_at(&self, x: u32, y: u32) -> u32 {
        let c = self.cell_size;
        let x_off = x * c;
        let y_off = y * c;
        (y_off..(y_off + c))
            .flat_map(|y| (x_off..(x_off + c)).map(move |x| self.bits.get(x, y) as u32))
            .sum()
    }
}
