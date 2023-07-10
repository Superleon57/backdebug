import { describe, it, expect, beforeAll } from '@jest/globals';
import { getTestServerAuth, init } from 'src/tests/factory';

beforeAll(async () => {
  await init();
});

const user = {
  email: 'trsaid34@gmail.com',
  password: 'password',
};

describe('Order flow', () => {
  describe('POST /addToCart', function () {
    it('should add to cart', async function () {
      const server = await getTestServerAuth(user);
      const res = await server.post('/api/v1/protected/cart/addToCart').send({
        payload: {
          productId: 'wOD3JviCF2HzMhDMBJO1',
        },
      });
      expect(res.status).toBe(200);
    });
  });

  describe('GET /confirm-test', function () {
    it('should confirm order', async function () {
      const server = await getTestServerAuth(user);
      const res = await server.get('/api/v1/payment/confirm-test');
      expect(res.status).toBe(200);
    });
  });
});
