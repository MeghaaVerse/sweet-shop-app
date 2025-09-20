import request from 'supertest';
import app from '../src/app';
import { testPrisma } from './setup';

describe('Sweet Management', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create and login a user to get auth token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'sweetmaker@example.com',
        password: 'password123',
        name: 'Sweet Maker'
      });

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  describe('POST /api/sweets', () => {
    it('should create a new sweet successfully', async () => {
      const sweetData = {
        name: 'Chocolate Cake',
        description: 'Delicious chocolate cake',
        price: 15.99,
        category: 'Cakes',
        imageUrl: 'https://example.com/chocolate-cake.jpg',
        stock: 10
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sweetData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(sweetData.name);
      expect(response.body.description).toBe(sweetData.description);
      expect(response.body.price).toBe(sweetData.price);
      expect(response.body.category).toBe(sweetData.category);
      expect(response.body.stock).toBe(sweetData.stock);
      expect(response.body.isActive).toBe(true);
      expect(response.body.createdBy.id).toBe(userId);
    });

    it('should not create sweet without authentication', async () => {
      const sweetData = {
        name: 'Chocolate Cake',
        price: 15.99,
        category: 'Cakes'
      };

      const response = await request(app)
        .post('/api/sweets')
        .send(sweetData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Access token required');
    });

    it('should not create sweet with invalid data', async () => {
      const sweetData = {
        name: '', // Invalid: empty name
        price: -5, // Invalid: negative price
        category: ''
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sweetData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should create sweet with minimum required fields', async () => {
      const sweetData = {
        name: 'Simple Candy',
        price: 2.50,
        category: 'Candy'
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sweetData)
        .expect(201);

      expect(response.body.name).toBe(sweetData.name);
      expect(response.body.price).toBe(sweetData.price);
      expect(response.body.category).toBe(sweetData.category);
      expect(response.body.stock).toBe(0); // Default value
      expect(response.body.description).toBeNull();
    });
  });

  describe('GET /api/sweets', () => {
    beforeEach(async () => {
      // Create test sweets
      const sweets = [
        { name: 'Chocolate Cake', price: 15.99, category: 'Cakes', stock: 5 },
        { name: 'Vanilla Cupcake', price: 3.50, category: 'Cupcakes', stock: 20 },
        { name: 'Strawberry Tart', price: 8.75, category: 'Tarts', stock: 0 }
      ];

      for (const sweet of sweets) {
        await request(app)
          .post('/api/sweets')
          .set('Authorization', `Bearer ${authToken}`)
          .send(sweet);
      }
    });

    it('should get all sweets', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .expect(200);

      expect(response.body).toHaveProperty('sweets');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.sweets)).toBe(true);
      expect(response.body.sweets.length).toBe(3);
    });

    it('should filter sweets by category', async () => {
      const response = await request(app)
        .get('/api/sweets?category=Cakes')
        .expect(200);

      expect(response.body.sweets.length).toBe(1);
      expect(response.body.sweets[0].category).toBe('Cakes');
    });

    it('should search sweets by name', async () => {
      const response = await request(app)
        .get('/api/sweets?search=Chocolate')
        .expect(200);

      expect(response.body.sweets.length).toBe(1);
      expect(response.body.sweets[0].name).toContain('Chocolate');
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/sweets?page=1&limit=2')
        .expect(200);

      expect(response.body.sweets.length).toBe(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.total).toBe(3);
    });
  });

  describe('GET /api/sweets/:id', () => {
    let sweetId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Sweet',
          price: 5.99,
          category: 'Test'
        });
      sweetId = response.body.id;
    });

    it('should get sweet by id', async () => {
      const response = await request(app)
        .get(`/api/sweets/${sweetId}`)
        .expect(200);

      expect(response.body.id).toBe(sweetId);
      expect(response.body.name).toBe('Test Sweet');
    });

    it('should return 404 for non-existent sweet', async () => {
      const response = await request(app)
        .get('/api/sweets/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/sweets/:id', () => {
    let sweetId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Original Sweet',
          price: 5.99,
          category: 'Test'
        });
      sweetId = response.body.id;
    });

    it('should update sweet successfully', async () => {
      const updateData = {
        name: 'Updated Sweet',
        price: 7.99,
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.price).toBe(updateData.price);
      expect(response.body.description).toBe(updateData.description);
    });

    it('should not update sweet without authentication', async () => {
      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .send({ name: 'Hacked Sweet' })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    let sweetId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Sweet to Delete',
          price: 5.99,
          category: 'Test'
        });
      sweetId = response.body.id;
    });

    it('should soft delete sweet successfully', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');

      // Verify sweet is soft deleted (isActive = false)
      const getResponse = await request(app)
        .get(`/api/sweets/${sweetId}`)
        .expect(200);

      expect(getResponse.body.isActive).toBe(false);
    });
  });
});