export function expect(
  condition: boolean,
  message?: string
): asserts condition {
  if (!condition) {
    throw new Error(message ?? "Assertion failed");
  }
}

export function expectDefined<T>(
  t: T | undefined,
  message?: string
): asserts t is T {
  expect(t !== undefined, message ?? "Unexpected undefined value");
}

export function expectNotNull<T>(
  t: T | null,
  message?: string
): asserts t is T {
  expect(t !== null, message ?? "Unexpected null value");
}

export function unwrap<T>(t: T | null | undefined, message?: string): T {
  const msg = message ?? "unwrapped none value";
  expectDefined(t, msg);
  expectNotNull(t, msg);
  return t;
}

export interface SearchResult {
  found: boolean;
  index: number;
}

export function binarySearch<T>(needle: T, haystack: T[]): SearchResult {
  function search(a: number, b: number): SearchResult {
    const len = b - a;
    switch (len) {
      case 0: {
        return { found: false, index: a - 1 };
      }

      case 1: {
        const el = haystack[a];
        expectDefined(el);
        return needle < el
          ? { found: false, index: a }
          : needle > el
          ? { found: false, index: a + 1 }
          : { found: true, index: a };
      }

      default: {
        const mid = Math.floor(a + len / 2);
        const el = haystack[mid];
        expectDefined(el);
        return needle < el
          ? search(a, mid)
          : needle > el
          ? search(mid + 1, b)
          : { found: true, index: mid };
      }
    }
  }

  return search(0, haystack.length);
}
