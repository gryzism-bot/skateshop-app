import { test as base, request as playwrightRequest } from '@playwright/test';

type WorkerFixtures = {
  getToken: (role: 'admin' | 'client') => Promise<string>;
};

export const test = base.extend<{}, WorkerFixtures>({
  getToken: [
    async ({}, use) => {

      const baseURL = process.env.API_URL || 'http://localhost:8080';

      const request = await playwrightRequest.newContext({baseURL});

      const cache = new Map<string, string>();

      const getToken = async (role: 'admin' | 'client') => {

        if (cache.has(role)) {
          return cache.get(role)!;
        }

        const credentials = {
          admin: { email: 'admin@test.com', password: 'admin123' },
          client: { email: 'user@test.com', password: '1234' }
        };

        const res = await request.post('/api/auth/login', {
          data: credentials[role]
        });

        const token = await res.text();
        cache.set(role, token);

        return token;
      };

      await use(getToken);

      await request.dispose();
    },
    { scope: 'worker' }
  ]
});