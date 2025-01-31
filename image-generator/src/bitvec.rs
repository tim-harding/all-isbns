#![allow(dead_code)]

pub struct BitVec {
    bits: Vec<u64>,
    len: usize,
}

impl BitVec {
    pub const fn new() -> Self {
        Self {
            bits: vec![],
            len: 0,
        }
    }

    pub fn with_capacity(capacity: usize) -> Self {
        Self {
            bits: Vec::with_capacity(capacity_for_len(capacity)),
            len: 0,
        }
    }

    pub const fn len(&self) -> usize {
        self.len
    }

    pub fn push(&mut self, value: bool) {
        let bit_index = self.len % 64;
        if bit_index == 0 {
            self.bits.push(value as u64)
        } else if let Some(last) = self.bits.last_mut() {
            *last |= (value as u64) << bit_index;
        }
        self.len += 1;
    }

    pub fn get(&self, index: usize) -> Option<bool> {
        (index < self.len).then(|| {
            let (index_n, index_bit) = split_index(index);
            let n = self.bits[index_n];
            (n >> index_bit) & 1 == 1
        })
    }

    pub fn set(&mut self, index: usize, value: bool) {
        assert!(index < self.len, "index out of bounds");
        let (index_n, index_bit) = split_index(index);
        let n = &mut self.bits[index_n];
        set_bit(n, index_bit, value);
    }

    pub fn extend_range(&mut self, mut count: usize, value: bool) {
        let leading_start = self.len % 64;
        self.len += count;
        let leading_bits = (64 - leading_start).min(count);
        count -= leading_bits;
        let trailing_bits = count % 64;
        count -= trailing_bits;
        let chunk_value = if value { u64::MAX } else { u64::MIN };

        if leading_start == 0 && leading_bits > 0 {
            let mask = bits_mask(leading_bits);
            self.bits.push(mask & chunk_value);
        } else if let Some(last_n) = self.bits.last_mut() {
            let leading_mask = (bits_mask(leading_bits) << leading_start) & chunk_value;
            *last_n |= leading_mask;
        } else if leading_bits > 0 {
            self.bits.push(bits_mask(leading_bits) & chunk_value);
        }

        let chunk_count = count / 64;
        self.bits
            .extend(std::iter::repeat_n(chunk_value, chunk_count));

        if trailing_bits > 0 {
            self.bits.push(bits_mask(trailing_bits) & chunk_value);
        }
    }
}

impl std::fmt::Debug for BitVec {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        for i in 0..self.len() {
            write!(
                f,
                "{}",
                if self.get(i).unwrap_or(false) {
                    '1'
                } else {
                    '0'
                }
            )?;
        }
        Ok(())
    }
}

impl FromIterator<bool> for BitVec {
    fn from_iter<T: IntoIterator<Item = bool>>(iter: T) -> Self {
        let mut iter = iter.into_iter();
        let tentative_len = match iter.size_hint() {
            (lower, None) => lower,
            (_, Some(upper)) => upper,
        };
        let mut bits = Vec::with_capacity(capacity_for_len(tentative_len));
        let final_len = loop {
            let (n, last_index) = iter
                .by_ref()
                .take(64)
                .enumerate()
                .fold((0, 0), |(n, _), (i, value)| (n | (value as u64) << i, i));
            bits.push(n);
            if last_index < 63 {
                break last_index + 1;
            }
        };
        Self {
            len: (bits.len() - 1) * 64 + final_len,
            bits,
        }
    }
}

impl Default for BitVec {
    fn default() -> Self {
        Self::new()
    }
}

const fn bits_mask(bits: usize) -> u64 {
    let (shift, did_exceed) = u64::MAX.overflowing_shl(bits as u32);
    if did_exceed {
        u64::MAX
    } else {
        !shift
    }
}

const fn split_index(index: usize) -> (usize, usize) {
    (index / 64, index % 64)
}

fn set_bit(n: &mut u64, index: usize, value: bool) {
    *n &= !(1 << index);
    *n |= (value as u64) << index;
}

const fn capacity_for_len(len: usize) -> usize {
    (len + 63) / 64
}

#[cfg(test)]
mod tests {
    use super::*;

    fn powers_of_two() -> impl Iterator<Item = bool> {
        let mut i = 0u16;
        std::iter::from_fn(move || {
            let n = i;
            i += 1;
            (n < 100).then(|| n.is_power_of_two())
        })
    }

    fn alternating() -> impl Iterator<Item = bool> {
        std::iter::repeat_n([true, false], 50).flat_map(|v| v.into_iter())
    }

    #[test]
    fn basic() {
        let mut bits = BitVec::new();
        for bit in powers_of_two() {
            bits.push(bit);
        }
        for (i, expected) in powers_of_two().enumerate() {
            let actual = bits.get(i).unwrap();
            assert_eq!(actual, expected);
        }
        for (i, bit) in alternating().enumerate() {
            bits.set(i, bit);
        }
        for (i, expected) in alternating().enumerate() {
            let actual = bits.get(i).unwrap();
            assert_eq!(actual, expected);
        }
    }

    #[test]
    fn collects() {
        let bits: BitVec = powers_of_two().collect();
        assert_eq!(bits.len(), 100);
        for (i, expected) in powers_of_two().enumerate() {
            let actual = bits.get(i).unwrap();
            assert_eq!(actual, expected);
        }
    }

    #[test]
    fn extend_range() {
        let mut bits = BitVec::new();
        bits.extend_range(0, true);
        bits.extend_range(10, true); // 10
        bits.extend_range(0, true);
        bits.extend_range(10, false); // 20
        bits.extend_range(60, true); // 80
        bits.extend_range(48, false); // 128
        bits.extend_range(0, true);
        bits.extend_range(64, true); // 192
        bits.extend_range(10, false); // 202
        bits.extend_range(256, true); // 458
        bits.extend_range(256, false); // 714

        assert_eq!(bits.len(), 714);
        assert_eq!(bits.bits.len(), 12);

        assert_eq!(bits.get(0), Some(true));
        assert_eq!(bits.get(9), Some(true));
        assert_eq!(bits.get(10), Some(false));
        assert_eq!(bits.get(19), Some(false));
        assert_eq!(bits.get(20), Some(true));
        assert_eq!(bits.get(79), Some(true));
        assert_eq!(bits.get(80), Some(false));
        assert_eq!(bits.get(127), Some(false));
        assert_eq!(bits.get(128), Some(true));
        assert_eq!(bits.get(191), Some(true));
        assert_eq!(bits.get(192), Some(false));
        assert_eq!(bits.get(201), Some(false));
        assert_eq!(bits.get(202), Some(true));
        assert_eq!(bits.get(457), Some(true));
        assert_eq!(bits.get(458), Some(false));
        assert_eq!(bits.get(713), Some(false));
        assert_eq!(bits.get(714), None);
    }
}
