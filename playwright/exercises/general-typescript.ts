// <T> means this helper is generic.
// The same TestCase type can hold strings, numbers, arrays, objects, etc.
type TestCase<T> = {
  name: string;
  actual: T;
  expected: T;
};

function assertEquals<T>({ name, actual, expected }: TestCase<T>) {
  if (actual !== expected) {
    throw new Error(`${name}: expected ${String(expected)}, got ${String(actual)}`);
  }

  console.log(`${name}: ok`);
}

function assertDeepEquals<T>({ name, actual, expected }: TestCase<T>) {
  // JSON.stringify is a simple way to compare arrays/objects in a practice file.
  // In production code, a real test framework's deep equality is safer.
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${name}: expected ${expectedJson}, got ${actualJson}`);
  }

  console.log(`${name}: ok`);
}

function section(name: string) {
  console.log(`\n${name}`);
}

// 1. Palindrome
function isPalindrome(text: string): boolean {
  // /[^a-z0-9]/g means: find every character that is NOT a letter or digit.
  // The g flag means "global", so replace all matches, not just the first one.
  const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '');

  // split('') turns the string into characters, reverse() reverses them,
  // join('') turns the characters back into a string.
  return normalized === normalized.split('').reverse().join('');
}

// 2. Word frequency
function countWords(text: string): Record<string, number> {
  // match(...) returns RegExpMatchArray | null.
  // If there are no words, it returns null.
  // "?? []" means: if the left side is null or undefined, use [] instead.
  // So words is always an array and reduce below is safe.
  const words = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];

  // Record<string, number> means an object with string keys and number values:
  // { skate: 2, wheels: 1 }
  return words.reduce<Record<string, number>>((counts, word) => {
    // counts[word] may be undefined the first time we see a word.
    // "?? 0" means: if counts[word] is null or undefined, start from 0.
    counts[word] = (counts[word] ?? 0) + 1;
    return counts;
  }, {});
}

// 3. Duplicates
function findDuplicates<T>(items: T[]): T[] {
  // Set stores unique values. It is useful when you need fast "have I seen this?" checks.
  const seen = new Set<T>();
  const duplicates = new Set<T>();

  for (const item of items) {
    if (seen.has(item)) {
      duplicates.add(item);
    }

    seen.add(item);
  }

  // [...duplicates] converts the Set back into an array.
  return [...duplicates];
}

// 4. Chunk
function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) {
    throw new Error('Chunk size must be positive');
  }

  const result: T[][] = [];

  // index += size jumps through the array by chunk size: 0, 2, 4, ...
  for (let index = 0; index < items.length; index += size) {
    // slice(start, end) returns a copy of that part of the array.
    // It does not mutate the original array.
    result.push(items.slice(index, index + size));
  }

  return result;
}

// 5. Group by
function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  // keyFn is a function passed by the caller.
  // It decides which group each item belongs to.
  return items.reduce<Record<string, T[]>>((groups, item) => {
    const key = keyFn(item);

    // "??=" is nullish assignment.
    // groups[key] ??= [] means:
    // if groups[key] is null or undefined, assign [] to it.
    // If it already exists, keep the existing array.
    groups[key] ??= [];
    groups[key].push(item);
    return groups;
  }, {});
}

// 6. Merge intervals
function mergeIntervals(intervals: Array<[number, number]>): Array<[number, number]> {
  // [...intervals] copies the array before sorting.
  // sort mutates arrays, so copying protects the input.
  const sorted = [...intervals].sort((left, right) => left[0] - right[0]);
  const merged: Array<[number, number]> = [];

  for (const interval of sorted) {
    const last = merged[merged.length - 1];

    if (!last || interval[0] > last[1]) {
      // [...interval] copies the tuple so later changes do not mutate input intervals.
      merged.push([...interval]);
      continue;
    }

    // If intervals overlap, keep the same start and extend the end if needed.
    last[1] = Math.max(last[1], interval[1]);
  }

  return merged;
}

// 7. Debounce
function debounce<TArgs extends unknown[]>(fn: (...args: TArgs) => void, delayMs: number) {
  // ReturnType<typeof setTimeout> works in both browser and Node typings.
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: TArgs) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // The function runs only after delayMs passes without a newer call.
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
}

// 8. Flatten object
function flattenObject(
  value: Record<string, unknown>,
  parentKey = '',
  result: Record<string, unknown> = {}
): Record<string, unknown> {
  // Object.entries gives [key, value] pairs from an object.
  for (const [key, nestedValue] of Object.entries(value)) {
    const path = parentKey ? `${parentKey}.${key}` : key;

    // Arrays are objects in JavaScript, so we explicitly exclude arrays.
    // This version treats arrays as final values, not as objects to flatten.
    const shouldRecurse =
      nestedValue !== null &&
      typeof nestedValue === 'object' &&
      !Array.isArray(nestedValue);

    if (shouldRecurse) {
      // "as Record<string, unknown>" is a type assertion.
      // We already checked nestedValue is a non-null object and not an array,
      // so we tell TypeScript it is safe to treat it like an object.
      flattenObject(nestedValue as Record<string, unknown>, path, result);
    } else {
      result[path] = nestedValue;
    }
  }

  return result;
}

// 9. Query string
function buildQueryString(params: Record<string, string | number | boolean | null | undefined>): string {
  const pairs = Object.entries(params)
    // [, value] ignores the key in this callback.
    // We skip null and undefined because they usually mean "not provided".
    .filter(([, value]) => value !== null && value !== undefined)
    // encodeURIComponent makes values safe for URLs:
    // "inline skates" becomes "inline%20skates".
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);

  // Ternary operator:
  // condition ? valueIfTrue : valueIfFalse
  return pairs.length ? `?${pairs.join('&')}` : '';
}

// 10. Retry
async function retry<T>(fn: () => Promise<T>, attempts: number, delayMs: number): Promise<T> {
  // unknown is safer than any: TypeScript forces us to be careful before using it.
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      // If fn succeeds, return immediately and stop retrying.
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < attempts) {
        // Wait only between attempts, not after the last failed attempt.
        await sleep(delayMs);
      }
    }
  }

  throw lastError;
}

// 11. Poll
async function poll<T>(
  fn: () => Promise<T>,
  predicate: (result: T) => boolean,
  timeoutMs: number,
  intervalMs: number
): Promise<T> {
  const startedAt = Date.now();

  // Keep trying until predicate(result) says "this is the value I wanted"
  // or until timeoutMs is exceeded.
  while (Date.now() - startedAt <= timeoutMs) {
    const result = await fn();

    if (predicate(result)) {
      return result;
    }

    await sleep(intervalMs);
  }

  throw new Error(`Polling timed out after ${timeoutMs} ms`);
}

function sleep(ms: number) {
  // setTimeout uses callbacks; Promise lets us await it.
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 12. Compare JSON
type JsonDifference = {
  path: string;
  actual?: unknown;
  expected?: unknown;
};

type JsonComparison = {
  missingKeys: JsonDifference[];
  extraKeys: JsonDifference[];
  mismatchedValues: JsonDifference[];
};

function compareJson(actual: unknown, expected: unknown, path = '$'): JsonComparison {
  // "$" is a common symbol for "root of the JSON document".
  const result: JsonComparison = {
    missingKeys: [],
    extraKeys: [],
    mismatchedValues: []
  };

  compareJsonInto(actual, expected, path, result);
  return result;
}

function compareJsonInto(actual: unknown, expected: unknown, path: string, result: JsonComparison) {
  // Arrays need special handling because we compare item by item.
  if (Array.isArray(actual) || Array.isArray(expected)) {
    compareArrays(actual, expected, path, result);
    return;
  }

  // Plain objects need recursive key comparison.
  if (isPlainObject(actual) && isPlainObject(expected)) {
    compareObjects(actual, expected, path, result);
    return;
  }

  // Primitive values like strings, numbers, booleans can be compared directly.
  if (actual !== expected) {
    result.mismatchedValues.push({ path, actual, expected });
  }
}

function compareArrays(actual: unknown, expected: unknown, path: string, result: JsonComparison) {
  if (!Array.isArray(actual) || !Array.isArray(expected)) {
    result.mismatchedValues.push({ path, actual, expected });
    return;
  }

  const maxLength = Math.max(actual.length, expected.length);

  // Use max length so we can detect both missing and extra array items.
  for (let index = 0; index < maxLength; index += 1) {
    const itemPath = `${path}[${index}]`;

    if (index >= actual.length) {
      result.missingKeys.push({ path: itemPath, expected: expected[index] });
    } else if (index >= expected.length) {
      result.extraKeys.push({ path: itemPath, actual: actual[index] });
    } else {
      compareJsonInto(actual[index], expected[index], itemPath, result);
    }
  }
}

function compareObjects(
  actual: Record<string, unknown>,
  expected: Record<string, unknown>,
  path: string,
  result: JsonComparison
) {
  // Sets make key existence checks straightforward.
  const actualKeys = new Set(Object.keys(actual));
  const expectedKeys = new Set(Object.keys(expected));

  for (const key of expectedKeys) {
    const keyPath = `${path}.${key}`;

    if (!actualKeys.has(key)) {
      result.missingKeys.push({ path: keyPath, expected: expected[key] });
    } else {
      compareJsonInto(actual[key], expected[key], keyPath, result);
    }
  }

  for (const key of actualKeys) {
    if (!expectedKeys.has(key)) {
      result.extraKeys.push({ path: `${path}.${key}`, actual: actual[key] });
    }
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  // "value is Record<string, unknown>" is a type predicate.
  // It teaches TypeScript that after this function returns true,
  // value can be treated as an object with string keys.
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// 13. LRU cache
class LRUCache<K, V> {
  private values = new Map<K, V>();

  constructor(private capacity: number) {
    if (capacity <= 0) {
      throw new Error('Capacity must be positive');
    }
  }

  get(key: K): V | undefined {
    if (!this.values.has(key)) {
      return undefined;
    }

    // Map remembers insertion order.
    // To mark an item as recently used, remove it and add it again at the end.
    const value = this.values.get(key)!;
    this.values.delete(key);
    this.values.set(key, value);
    return value;
  }

  set(key: K, value: V) {
    if (this.values.has(key)) {
      this.values.delete(key);
    }

    this.values.set(key, value);

    if (this.values.size > this.capacity) {
      // The first Map key is the least recently used key.
      // "as K" tells TypeScript this key has the same type as our cache keys.
      const leastRecentlyUsedKey = this.values.keys().next().value as K;
      this.values.delete(leastRecentlyUsedKey);
    }
  }

  keys() {
    return [...this.values.keys()];
  }
}

// 14. Event emitter
type Handler<TPayload> = (payload: TPayload) => void;

// TEvents describes which event names exist and what payload each event uses.
// Example: { paid: { orderId: number } }
class EventEmitter<TEvents extends Record<string, unknown>> {
  private handlers: {
    [K in keyof TEvents]?: Set<Handler<TEvents[K]>>;
  } = {};

  on<K extends keyof TEvents>(event: K, handler: Handler<TEvents[K]>) {
    // The event name controls the payload type.
    // If event is "paid", handler must accept the "paid" payload shape.
    this.handlers[event] ??= new Set();

    // The ! is a non-null assertion.
    // We know handlers[event] exists because the line above creates it if missing.
    this.handlers[event]!.add(handler);
  }

  off<K extends keyof TEvents>(event: K, handler: Handler<TEvents[K]>) {
    // ?. is optional chaining.
    // If handlers[event] is undefined, do nothing instead of throwing.
    this.handlers[event]?.delete(handler);
  }

  once<K extends keyof TEvents>(event: K, handler: Handler<TEvents[K]>) {
    // once is built by wrapping the original handler.
    // The wrapper removes itself before calling the original handler.
    const wrappedHandler: Handler<TEvents[K]> = payload => {
      this.off(event, wrappedHandler);
      handler(payload);
    };

    this.on(event, wrappedHandler);
  }

  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]) {
    // "?? []" lets emit safely loop even if no handlers exist for this event.
    for (const handler of this.handlers[event] ?? []) {
      handler(payload);
    }
  }
}

// 15. Cart total calculator
type CartProduct = {
  id: string;
  name: string;
  price: number;
};

type CartLine = {
  product: CartProduct;
  quantity: number;
};

type DeliveryMethod = 'COURIER' | 'PACZKOMAT' | 'PICKUP';
type PromoCode = 'ROLL10' | 'FREESHIP' | undefined;

function calculateCartTotal(lines: CartLine[], promoCode: PromoCode, deliveryMethod: DeliveryMethod) {
  // subtotal is the sum of every line: product price * quantity.
  const subtotal = lines.reduce((total, line) => total + line.product.price * line.quantity, 0);

  // Business rules are intentionally explicit.
  // That makes the function easier to discuss in interviews.
  const discount = promoCode === 'ROLL10' ? roundMoney(subtotal * 0.1) : 0;
  const deliveryFeeBeforePromo = getDeliveryFee(deliveryMethod);
  const deliveryFee = promoCode === 'FREESHIP' ? 0 : deliveryFeeBeforePromo;
  const total = roundMoney(subtotal - discount + deliveryFee);

  return {
    subtotal,
    discount,
    deliveryFee,
    total
  };
}

function getDeliveryFee(deliveryMethod: DeliveryMethod) {
  // switch is a readable choice when a value maps to fixed outcomes.
  switch (deliveryMethod) {
    case 'COURIER':
      return 20;
    case 'PACZKOMAT':
      return 12;
    case 'PICKUP':
      return 0;
  }
}

function roundMoney(value: number) {
  // Floating point math can produce values like 10.999999999.
  // This keeps money-like values to two decimals.
  return Math.round(value * 100) / 100;
}

export async function runGeneralTypescriptExercises() {
  section('1. Palindrome');
  assertEquals({ name: 'ignores punctuation and casing', actual: isPalindrome('A man, a plan, a canal: Panama'), expected: true });
  assertEquals({ name: 'detects non-palindrome', actual: isPalindrome('skates'), expected: false });

  section('2. Word frequency');
  assertDeepEquals({
    name: 'counts words case-insensitively',
    actual: countWords('Skate skate wheels!'),
    expected: { skate: 2, wheels: 1 }
  });

  section('3. Duplicates');
  assertDeepEquals({ name: 'returns each duplicate once', actual: findDuplicates([1, 2, 2, 3, 3, 3]), expected: [2, 3] });

  section('4. Chunk');
  assertDeepEquals({ name: 'splits into fixed-size arrays', actual: chunk([1, 2, 3, 4, 5], 2), expected: [[1, 2], [3, 4], [5]] });

  section('5. Group by');
  const people = [
    { name: 'Alice', department: 'QA' },
    { name: 'Bob', department: 'DEV' },
    { name: 'Charlie', department: 'QA' }
  ];
  assertDeepEquals({
    name: 'groups objects by key function',
    actual: groupBy(people, person => person.department),
    expected: {
      QA: [people[0], people[2]],
      DEV: [people[1]]
    }
  });

  section('6. Merge intervals');
  assertDeepEquals({
    name: 'merges overlapping ranges',
    actual: mergeIntervals([[1, 3], [2, 6], [8, 10], [10, 12]]),
    expected: [[1, 6], [8, 12]]
  });

  section('7. Debounce');
  let debouncedValue = '';
  const debouncedSet = debounce((value: string) => {
    debouncedValue = value;
  }, 20);
  debouncedSet('first');
  debouncedSet('second');
  await sleep(30);
  assertEquals({ name: 'runs only latest call after delay', actual: debouncedValue, expected: 'second' });

  section('8. Flatten object');
  assertDeepEquals({
    name: 'flattens nested object keys',
    actual: flattenObject({ user: { name: 'Ana', address: { city: 'Warsaw' } }, active: true }),
    expected: {
      'user.name': 'Ana',
      'user.address.city': 'Warsaw',
      active: true
    }
  });

  section('9. Query string');
  assertEquals({
    name: 'skips nullish values and encodes keys and values',
    actual: buildQueryString({ search: 'inline skates', page: 2, active: true, empty: null }),
    expected: '?search=inline%20skates&page=2&active=true'
  });

  section('10. Retry');
  let retryAttempts = 0;
  const retryResult = await retry(async () => {
    retryAttempts += 1;

    if (retryAttempts < 3) {
      throw new Error('Not yet');
    }

    return 'done';
  }, 3, 1);
  assertEquals({ name: 'retries until success', actual: retryResult, expected: 'done' });
  assertEquals({ name: 'uses three attempts', actual: retryAttempts, expected: 3 });

  section('11. Poll');
  let pollCounter = 0;
  const pollResult = await poll(
    async () => {
      pollCounter += 1;
      return pollCounter;
    },
    value => value >= 3,
    100,
    1
  );
  assertEquals({ name: 'polls until predicate passes', actual: pollResult, expected: 3 });

  section('12. Compare JSON');
  assertDeepEquals({
    name: 'finds missing, extra and mismatched values',
    actual: compareJson(
      { id: 1, name: 'Skate', extra: true, tags: ['new', 'blue'] },
      { id: 1, name: 'Wheel', stock: 4, tags: ['new', 'red'] }
    ),
    expected: {
      missingKeys: [{ path: '$.stock', expected: 4 }],
      extraKeys: [{ path: '$.extra', actual: true }],
      mismatchedValues: [
        { path: '$.name', actual: 'Skate', expected: 'Wheel' },
        { path: '$.tags[1]', actual: 'blue', expected: 'red' }
      ]
    }
  });

  section('13. LRU cache');
  const cache = new LRUCache<string, number>(2);
  cache.set('a', 1);
  cache.set('b', 2);
  cache.get('a');
  cache.set('c', 3);
  assertDeepEquals({ name: 'evicts least recently used item', actual: cache.keys(), expected: ['a', 'c'] });
  assertEquals({ name: 'returns cached value', actual: cache.get('a'), expected: 1 });

  section('14. Event emitter');
  type ShopEvents = {
    paid: { orderId: number };
  };
  const emitter = new EventEmitter<ShopEvents>();
  const paidOrderIds: number[] = [];
  const handler = (payload: { orderId: number }) => paidOrderIds.push(payload.orderId);
  emitter.on('paid', handler);
  emitter.once('paid', payload => paidOrderIds.push(payload.orderId * 10));
  emitter.emit('paid', { orderId: 7 });
  emitter.emit('paid', { orderId: 8 });
  emitter.off('paid', handler);
  emitter.emit('paid', { orderId: 9 });
  assertDeepEquals({ name: 'supports on, once, off and emit', actual: paidOrderIds, expected: [7, 70, 8] });

  section('15. Cart total calculator');
  const total = calculateCartTotal(
    [
      { product: { id: 'skate-1', name: 'Skate', price: 300 }, quantity: 1 },
      { product: { id: 'wheel-1', name: 'Wheels', price: 100 }, quantity: 2 }
    ],
    'ROLL10',
    'PACZKOMAT'
  );
  assertDeepEquals({
    name: 'calculates subtotal, discount, delivery and total',
    actual: total,
    expected: {
      subtotal: 500,
      discount: 50,
      deliveryFee: 12,
      total: 462
    }
  });

  console.log('\nGeneral TypeScript exercises passed.');
}

if (require.main === module) {
  runGeneralTypescriptExercises().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
