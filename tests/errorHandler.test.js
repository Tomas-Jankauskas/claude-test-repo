import request from 'supertest';
import app from '../src/index.js';

describe('Error Handling Middleware', () => {
  describe('GET /api/v1/test-error', () => {
    test('should return proper error response', async () => {
      const response = await request(app)
        .get('/api/v1/test-error')
        .expect(500);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('This is a test error');
      expect(response.body.code).toBe('TEST_ERROR');
    });
  });

  describe('GET /api/v1/users/:id', () => {
    test('should return validation error for invalid ID', async () => {
      const response = await request(app)
        .get('/api/v1/users/invalid')
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User ID must be a number');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    test('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/v1/users/999')
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User not found');
      expect(response.body.code).toBe('USER_NOT_FOUND');
    });

    test('should return user data for valid ID', async () => {
      const response = await request(app)
        .get('/api/v1/users/1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
      expect(response.body.data.name).toBe('User 1');
    });
  });

  describe('GET /nonexistent-route', () => {
    test('should return 404 for nonexistent routes', async () => {
      const response = await request(app)
        .get('/nonexistent-route')
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('NOT_FOUND');
    });
  });
});