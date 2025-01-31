pub struct BitsAcc {
    byte: u8,
    i: usize,
    kind: Kind,
}

impl BitsAcc {
    pub const fn new(cell_size: u32) -> Self {
        Self {
            kind: Kind::new(cell_size),
            byte: 0,
            i: 0,
        }
    }

    pub fn add(&mut self, sum: u32) -> Option<u8> {
        match self.kind {
            Kind::One | Kind::Two | Kind::Four => {
                self.byte |= (sum as u8).min(self.kind.max_value()) << self.kind.shift(self.i);
            }
            Kind::Eight { cell_size } => {
                self.byte = (sum * 255 / cell_size / cell_size) as u8;
            }
        }

        self.i = (self.i + 1) % self.kind.passes();
        if self.i == 0 {
            let out = self.byte;
            self.byte = 0;
            Some(out)
        } else {
            None
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
enum Kind {
    One,
    Two,
    Four,
    Eight { cell_size: u32 },
}

impl Kind {
    pub const fn new(cell_size: u32) -> Self {
        match cell_size {
            1 => Self::One,
            2 => Self::Two,
            4 => Self::Four,
            _ => {
                assert!(cell_size.is_power_of_two());
                Self::Eight { cell_size }
            }
        }
    }

    pub const fn max_value(self) -> u8 {
        match self {
            Kind::One => 1,
            Kind::Two => 3,
            Kind::Four => 15,
            Kind::Eight { cell_size: _ } => 255,
        }
    }

    pub const fn passes(self) -> usize {
        match self {
            Kind::One => 8,
            Kind::Two => 4,
            Kind::Four => 2,
            Kind::Eight { cell_size: _ } => 1,
        }
    }

    pub const fn bits(self) -> usize {
        match self {
            Kind::One => 1,
            Kind::Two => 2,
            Kind::Four => 4,
            Kind::Eight { cell_size: _ } => 8,
        }
    }

    pub const fn shift(self, i: usize) -> usize {
        8 - (i + 1) * self.bits()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bits_2() {
        let mut bits = BitsAcc::new(2);
        assert_eq!(bits.add(1), None);
        assert_eq!(bits.add(1), None);
        assert_eq!(bits.add(1), None);
        assert_eq!(bits.add(1), Some(0b01010101));
        assert_eq!(bits.add(2), None);
        assert_eq!(bits.add(2), None);
        assert_eq!(bits.add(2), None);
        assert_eq!(bits.add(2), Some(0b10101010));
    }
}
