import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User.js';
import { Department } from '../src/models/Department.js';
import { Location } from '../src/models/Location.js';
import { Report } from '../src/models/Report.js';
import { Issue } from '../src/models/Issue.js';

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
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Model Validation and Indexes', () => {
  describe('User Model', () => {
    it('should require required fields', async () => {
      const user = new User({});
      let err;
      try {
        await user.save();
      } catch (error) {
        err = error;
      }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.name).toBeDefined();
      expect(err.errors.email).toBeDefined();
      expect(err.errors.passwordHash).toBeDefined();
      expect(err.errors.role).toBeDefined();
    });

    it('should reject invalid role enum', async () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hash',
        role: 'INVALID_ROLE'
      });
      let err;
      try {
        await user.save();
      } catch (error) {
        err = error;
      }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.role).toBeDefined();
    });

    it('should enforce unique email', async () => {
      const user1 = new User({ name: 'User1', email: 'test@example.com', passwordHash: 'pwd', role: 'STUDENT' });
      await user1.save();

      const user2 = new User({ name: 'User2', email: 'test@example.com', passwordHash: 'pwd', role: 'STUDENT' });
      let err;
      try {
        await user2.save();
      } catch (error) {
        err = error;
      }
      expect(err).toBeDefined();
      expect(err.code).toBe(11000); // duplicate key error
    });
  });

  describe('Report Model', () => {
    it('should enforce unique {issue, reporter}', async () => {
      // Need dummy ObjectIds for ref
      const issueId = new mongoose.Types.ObjectId();
      const reporterId = new mongoose.Types.ObjectId();
      const locationId = new mongoose.Types.ObjectId();

      const report1 = new Report({
        issue: issueId,
        reporter: reporterId,
        description: 'Testing description min 10 chars',
        category: 'ELECTRICAL',
        location: locationId,
        isPrimary: true
      });
      await report1.save();

      const report2 = new Report({
        issue: issueId,
        reporter: reporterId,
        description: 'Another description min 10 chars',
        category: 'ELECTRICAL',
        location: locationId,
        isPrimary: false
      });

      let err;
      try {
        await report2.save();
      } catch (error) {
        err = error;
      }
      expect(err).toBeDefined();
      expect(err.code).toBe(11000);
    });
  });

  describe('Location Model', () => {
    it('should auto-generate label on save', async () => {
      const loc = new Location({
        building: 'CS Block',
        floor: 'Floor 1',
        area: 'Room 101',
        zoneType: 'CLASSROOM',
        criticality: 3
      });
      await loc.save();
      expect(loc.label).toBe('CS Block • Floor 1 • Room 101');
    });
  });
});
