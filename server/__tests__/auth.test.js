import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { ROLES } from '../src/utils/constants.js';
import { DEMO_PASSWORD_HASH } from '../src/seed/data/users.js';

let mongoServer;
jest.setTimeout(300000); // Allow 5 minutes for first-time MongoDB binary download


beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a student and return token without passwordHash', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Student',
          email: 'test@student.com',
          password: 'password123',
          rollNo: 'TEST001'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe(ROLES.STUDENT);
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('should fail on duplicate email', async () => {
      await User.create({
        name: 'Existing',
        email: 'test@student.com',
        passwordHash: 'hash',
        role: ROLES.STUDENT
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Student',
          email: 'test@student.com',
          password: 'password123'
        });

      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Login User',
        email: 'login@test.com',
        passwordHash: DEMO_PASSWORD_HASH, // matches 'Demo@123'
        role: ROLES.STUDENT
      });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'Demo@123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should return same generic error for wrong email or password', async () => {
      const res1 = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@test.com', password: 'Demo@123' });
      expect(res1.status).toBe(401);
      expect(res1.body.error.message).toBe('Invalid credentials');

      const res2 = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@test.com', password: 'WrongPassword' });
      expect(res2.status).toBe(401);
      expect(res2.body.error.message).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/demo', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Demo Auth',
        email: 'auth@test.com',
        passwordHash: 'hash',
        role: ROLES.AUTHORITY
      });
    });

    it('should demo login successfully', async () => {
      const res = await request(app)
        .post('/api/auth/demo')
        .send({ role: ROLES.AUTHORITY });
        
      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe(ROLES.AUTHORITY);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should fail with no token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
