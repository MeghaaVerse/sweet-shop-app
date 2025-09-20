import request from 'supertest';
import app from '../src/app';
import { testPrisma } from './setup';

describe('Inventory Management', () => {
  let authToken: string;
  let userId: string;
  let sweetId: string;

  beforeEach(async () => {
    // Create and login a user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'inventory@example.com',
        password: 'password123',
        name: 'Inventory Manager'
      });

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;

    // Create a test sweet
    const sweetResponse = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Candy',
        price: 5.99,
        category: 'Candy',
        stock: 50
      });

    sweetId = sweetResponse.body.id;
  });

  describe('POST /api/inventory/log', () => {
    it('should log inventory restock successfully', async () => {
      const logData = {
        sweetId,
        type: 'RESTOCK',
        quantity: 25,
        reason: 'Weekly restock'
      };

      const response = await request(app)
        .post('/api/inventory/log')
        .set('Authorization', `Bearer ${authToken}`)
        .send(logData)
        .expect(201);

      expect(response.body.sweetId).toBe(sweetId);
      expect(response.body.type).toBe('RESTOCK');
      expect(response.body.quantity).toBe(25);
      expect(response.body.reason).toBe('Weekly restock');

      // Verify stock was updated
      const sweetResponse = await request(app)
        .get(`/api/sweets/${sweetId}`)
        .expect(200);

      expect(sweetResponse.body.stock).toBe(75); // 50 + 25
    });

    it('should log inventory sale successfully', async () => {
      const logData = {
        sweetId,
        type: 'SALE',
        quantity: 10,
        reason: 'Customer purchase'
      };

      const response = await request(app)
        .post('/api/inventory/log')
        .set('Authorization', `Bearer ${authToken}`)
        .send(logData)
        .expect(201);

      expect(response.body.type).toBe('SALE');
      expect(response.body.quantity).toBe(10);

      // Verify stock was reduced
      const sweetResponse = await request(app)
        .get(`/api/sweets/${sweetId}`)
        .expect(200);

      expect(sweetResponse.body.stock).toBe(40); // 50 - 10
    });

    it('should not allow sale more than available stock', async () => {
      const logData = {
        sweetId,
        type: 'SALE',
        quantity: 100, // More than available (50)
        reason: 'Large order'
      };

      const response = await request(app)
        .post('/api/inventory/log')
        .set('Authorization', `Bearer ${authToken}`)
        .send(logData)
        .expect(400);

       expect(response.body.message.toLowerCase()).toContain('insufficient stock');
    });

    it('should not log inventory without authentication', async () => {
      const logData = {
        sweetId,
        type: 'RESTOCK',
        quantity: 25
      };

      const response = await request(app)
        .post('/api/inventory/log')
        .send(logData)
        .expect(401);

      expect(response.body.message).toContain('Access token required');
    });

    it('should validate inventory log data', async () => {
      const logData = {
        sweetId,
        type: 'INVALID_TYPE', // Invalid type
        quantity: -5, // Invalid quantity
      };

      const response = await request(app)
        .post('/api/inventory/log')
        .set('Authorization', `Bearer ${authToken}`)
        .send(logData)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /api/inventory/logs', () => {
    beforeEach(async () => {
      // Create some inventory logs
      const logs = [
        { type: 'RESTOCK', quantity: 30, reason: 'Initial stock' },
        { type: 'SALE', quantity: 5, reason: 'Customer 1' },
        { type: 'SALE', quantity: 3, reason: 'Customer 2' },
        { type: 'DAMAGE', quantity: 2, reason: 'Dropped item' }
      ];

      for (const log of logs) {
        await request(app)
          .post('/api/inventory/log')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ sweetId, ...log });
      }
    });

    it('should get all inventory logs with pagination', async () => {
      const response = await request(app)
        .get('/api/inventory/logs')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.logs).toBeDefined();
      expect(response.body.pagination).toBeDefined();
      expect(Array.isArray(response.body.logs)).toBe(true);
      expect(response.body.logs.length).toBeGreaterThan(0);
    });

    it('should filter logs by sweet', async () => {
      const response = await request(app)
        .get(`/api/inventory/logs?sweetId=${sweetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.logs.length).toBeGreaterThan(0);
      response.body.logs.forEach((log: any) => {
        expect(log.sweetId).toBe(sweetId);
      });
    });

    it('should filter logs by type', async () => {
      const response = await request(app)
        .get('/api/inventory/logs?type=SALE')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.logs.forEach((log: any) => {
        expect(log.type).toBe('SALE');
      });
    });
  });

  describe('GET /api/inventory/report', () => {
    beforeEach(async () => {
      // Create additional sweets and inventory logs for report testing
      const sweet2Response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Chocolate Bar',
          price: 3.50,
          category: 'Chocolate',
          stock: 20
        });

      await request(app)
        .post('/api/inventory/log')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sweetId: sweet2Response.body.id,
          type: 'SALE',
          quantity: 15,
          reason: 'High demand'
        });
    });

    it('should generate inventory report', async () => {
      const response = await request(app)
        .get('/api/inventory/report')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.totalSweets).toBeDefined();
      expect(response.body.totalValue).toBeDefined();
      expect(response.body.lowStockItems).toBeDefined();
      expect(response.body.recentActivities).toBeDefined();
      expect(response.body.categoryBreakdown).toBeDefined();
      expect(Array.isArray(response.body.lowStockItems)).toBe(true);
      expect(Array.isArray(response.body.recentActivities)).toBe(true);
      expect(Array.isArray(response.body.categoryBreakdown)).toBe(true);
    });

    it('should identify low stock items', async () => {
      const response = await request(app)
        .get('/api/inventory/report?lowStockThreshold=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.lowStockItems).toBeDefined();
      // Should find items with stock <= 10
      response.body.lowStockItems.forEach((item: any) => {
        expect(item.currentStock).toBeLessThanOrEqual(10);
      });
    });
  });

  describe('GET /api/inventory/alerts', () => {
    it('should get stock alerts', async () => {
      // Reduce stock to trigger alert
      await request(app)
        .post('/api/inventory/log')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sweetId,
          type: 'SALE',
          quantity: 45, // Reduce from 50 to 5
          reason: 'Large order'
        });

      const response = await request(app)
        .get('/api/inventory/alerts?threshold=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.alerts).toBeDefined();
      expect(Array.isArray(response.body.alerts)).toBe(true);
      
      if (response.body.alerts.length > 0) {
        expect(response.body.alerts[0]).toHaveProperty('sweetId');
        expect(response.body.alerts[0]).toHaveProperty('sweetName');
        expect(response.body.alerts[0]).toHaveProperty('currentStock');
        expect(response.body.alerts[0]).toHaveProperty('severity');
      }
    });
  });
});