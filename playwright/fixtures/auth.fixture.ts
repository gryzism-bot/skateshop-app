import { test as base, request as playwrightRequest } from '@playwright/test';

type WorkerFixtures = {
  getTokenWorkerFixture: (role: 'admin') => Promise<string>;
};

export const test = base.extend<{}, WorkerFixtures>({
  // Worker-scoped: cached JWT lookup for seeded users shared by tests in one worker.
  getTokenWorkerFixture: [
    async ({}, use) => {

      const baseURL = process.env.API_URL || 'http://localhost:8080';

      const request = await playwrightRequest.newContext({baseURL});

      const cache = new Map<string, string>();

      const getTokenWorkerFixture = async (role: 'admin') => {

        if (cache.has(role)) {
          return cache.get(role)!;
        }

        const credentials = {
          admin: { email: 'admin@test.com', password: 'admin123' }
        };

        const res = await request.post('/api/auth/login', {
          data: credentials[role]
        });

        const token = await res.text();
        cache.set(role, token);

        return token;
      };

      await use(getTokenWorkerFixture);

      await request.dispose();
    },
    { scope: 'worker' }
  ]
});
