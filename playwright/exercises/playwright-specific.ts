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

// 1. Build strict data-testid selectors
function byTestId(testId: string): string {
  // CSS attribute selectors need quotes around values with spaces or special characters.
  // JSON.stringify gives us safe double-quoted text.
  return `[data-testid=${JSON.stringify(testId)}]`;
}

// 2. Convert UI text into a stable test id
function toTestId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// 3. Parse money text from UI into a number
function parsePrice(text: string): number {
  // Examples this handles: "299.99 PLN", "1 299,50 zl", "$25.00".
  const normalized = text
    .replace(/[^\d,.-]/g, '')
    .replace(/\s/g, '')
    .replace(',', '.');

  const price = Number(normalized);

  if (Number.isNaN(price)) {
    throw new Error(`Cannot parse price from "${text}"`);
  }

  return price;
}

// 4. Build unique test data for API tests
function createUniqueEmail(prefix: string, domain = 'test.com'): string {
  // Date.now gives a timestamp. Math.random lowers collision risk if tests run quickly.
  const uniquePart = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  return `${toTestId(prefix)}-${uniquePart}@${domain}`;
}

function createProductPayload(overrides: Partial<ProductPayload> = {}): ProductPayload {
  const uniquePart = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  return {
    name: `API Skate ${uniquePart}`,
    sku: `API-SKATE-${uniquePart}`,
    price: 299,
    stock: 5,
    category: 'SKATES',
    type: 'FREESKATE',
    active: true,
    ...overrides
  };
}

type ProductPayload = {
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: 'SKATES' | 'ACCESSORIES';
  type: 'FREESKATE' | 'SPEEDSKATE' | 'LINERS' | 'WHEELS' | 'CRASHPADS';
  active: boolean;
};

// 5. Assert API response shape without Playwright's expect
type ApiResponse<TBody> = {
  status: number;
  body: TBody;
};

type ProductResponse = ProductPayload & {
  id: number;
  createdOn: string;
};

function assertProductCreated(response: ApiResponse<ProductResponse>, expected: Partial<ProductPayload>) {
  assertEquals({ name: 'product create status', actual: response.status, expected: 200 });
  assertEquals({ name: 'product id is numeric', actual: typeof response.body.id, expected: 'number' });
  assertEquals({ name: 'product createdOn is string', actual: typeof response.body.createdOn, expected: 'string' });

  for (const [key, value] of Object.entries(expected)) {
    assertEquals({
      name: `product ${key}`,
      actual: response.body[key as keyof ProductPayload],
      expected: value as ProductPayload[keyof ProductPayload]
    });
  }
}

// 6. Extract an auth token from a response
function extractBearerToken(header: string): string {
  const prefix = 'Bearer ';

  if (!header.startsWith(prefix)) {
    throw new Error('Authorization header must start with Bearer');
  }

  const token = header.slice(prefix.length).trim();

  if (!token) {
    throw new Error('Bearer token is empty');
  }

  return token;
}

// 7. Redact secrets before logging request/response details
function redactSecrets<T extends Record<string, unknown>>(value: T): T {
  const secretKeys = new Set(['password', 'token', 'authorization', 'apiKey']);
  const result: Record<string, unknown> = {};

  for (const [key, nestedValue] of Object.entries(value)) {
    if (secretKeys.has(key)) {
      result[key] = '<redacted>';
    } else if (isPlainObject(nestedValue)) {
      result[key] = redactSecrets(nestedValue);
    } else {
      result[key] = nestedValue;
    }
  }

  return result as T;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// 8. Wait for a mocked response matching URL and method
type CapturedResponse = {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: number;
};

function findResponse(
  responses: CapturedResponse[],
  matcher: { urlIncludes: string; method: CapturedResponse['method'] }
): CapturedResponse | undefined {
  return responses.find(response =>
    response.url.includes(matcher.urlIncludes) &&
    response.method === matcher.method
  );
}

// 9. Compare cart and order items
type CartResponse = {
  items: Array<{
    productId: number;
    productName: string;
    productPrice: number;
    quantity: number;
  }>;
};

type OrderResponse = {
  items: Array<{
    product: {
      id: number;
      name: string;
      price: number;
    };
    quantity: number;
  }>;
};

function orderMatchesCart(cart: CartResponse, order: OrderResponse): boolean {
  if (cart.items.length !== order.items.length) {
    return false;
  }

  return cart.items.every(cartItem => {
    const orderItem = order.items.find(item => item.product.id === cartItem.productId);

    return Boolean(orderItem) &&
      orderItem?.product.name === cartItem.productName &&
      orderItem?.product.price === cartItem.productPrice &&
      orderItem?.quantity === cartItem.quantity;
  });
}

// 10. Retry a flaky action, similar to retrying a custom API helper
async function retryAction<T>(action: () => Promise<T>, attempts: number): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

export async function runPlaywrightSpecificExercises() {
  section('1. Build strict data-testid selectors');
  assertEquals({
    name: 'wraps test id as CSS attribute selector',
    actual: byTestId('checkout-button'),
    expected: '[data-testid="checkout-button"]'
  });

  section('2. Convert UI text into stable test id');
  assertEquals({
    name: 'normalizes UI label',
    actual: toTestId('Add Guest Items To Account Cart!'),
    expected: 'add-guest-items-to-account-cart'
  });

  section('3. Parse money text from UI');
  assertEquals({
    name: 'parses Polish-style price',
    actual: parsePrice('1 299,50 PLN'),
    expected: 1299.5
  });

  section('4. Build unique test data');
  const productPayload = createProductPayload({
    name: 'Interview Skate',
    sku: 'INTERVIEW-SKATE-1'
  });
  assertEquals({ name: 'uses override name', actual: productPayload.name, expected: 'Interview Skate' });
  assertEquals({ name: 'uses override sku', actual: productPayload.sku, expected: 'INTERVIEW-SKATE-1' });
  assertEquals({
    name: 'creates email domain',
    actual: createUniqueEmail('Fresh Client').endsWith('@test.com'),
    expected: true
  });

  section('5. Assert API response shape');
  assertProductCreated(
    {
      status: 200,
      body: {
        id: 10,
        createdOn: '2026-09-21T12:00:00Z',
        ...productPayload
      }
    },
    {
      name: 'Interview Skate',
      sku: 'INTERVIEW-SKATE-1'
    }
  );

  section('6. Extract auth token');
  assertEquals({
    name: 'removes Bearer prefix',
    actual: extractBearerToken('Bearer abc.def.ghi'),
    expected: 'abc.def.ghi'
  });

  section('7. Redact secrets');
  assertDeepEquals({
    name: 'redacts nested secrets',
    actual: redactSecrets({
      email: 'client@test.com',
      password: '1234',
      nested: {
        token: 'secret-token'
      }
    }),
    expected: {
      email: 'client@test.com',
      password: '<redacted>',
      nested: {
        token: '<redacted>'
      }
    }
  });

  section('8. Find captured response');
  assertDeepEquals({
    name: 'finds response by url fragment and method',
    actual: findResponse(
      [
        { url: '/api/cart', method: 'GET', status: 200 },
        { url: '/api/orders/10/pay', method: 'POST', status: 200 }
      ],
      { urlIncludes: '/api/orders/10/pay', method: 'POST' }
    ),
    expected: { url: '/api/orders/10/pay', method: 'POST', status: 200 }
  });

  section('9. Compare cart and order items');
  assertEquals({
    name: 'detects matching cart and order',
    actual: orderMatchesCart(
      {
        items: [
          { productId: 1, productName: 'Skate', productPrice: 300, quantity: 1 }
        ]
      },
      {
        items: [
          { product: { id: 1, name: 'Skate', price: 300 }, quantity: 1 }
        ]
      }
    ),
    expected: true
  });

  section('10. Retry flaky action');
  let attempts = 0;
  const result = await retryAction(async () => {
    attempts += 1;

    if (attempts < 2) {
      throw new Error('Temporary failure');
    }

    return 'success';
  }, 2);
  assertEquals({ name: 'eventually returns result', actual: result, expected: 'success' });
  assertEquals({ name: 'used two attempts', actual: attempts, expected: 2 });

  console.log('\nPlaywright-specific exercises passed.');
}

if (require.main === module) {
  runPlaywrightSpecificExercises().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
