import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Department } from '../models/Department.js';
import { Location } from '../models/Location.js';
import { User } from '../models/User.js';
import { departmentsData } from './data/departments.js';
import { locationsData } from './data/locations.js';
import { usersData, DEMO_PASSWORD_HASH } from './data/users.js';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected.');

    console.log('Seeding departments...');
    for (const dep of departmentsData) {
      await Department.findOneAndUpdate(
        { code: dep.code },
        { $set: dep },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Seeded ${departmentsData.length} departments.`);

    console.log('Seeding locations...');
    for (const loc of locationsData) {
      await Location.findOneAndUpdate(
        { building: loc.building, floor: loc.floor, area: loc.area },
        { $set: loc },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Seeded ${locationsData.length} locations.`);

    console.log('Seeding users...');
    let estateDept = await Department.findOne({ code: 'ESTATE' });
    let elecDept = await Department.findOne({ code: 'ELEC' });

    for (const u of usersData) {
      const userData = { ...u, passwordHash: DEMO_PASSWORD_HASH };
      
      // Assign departments to authorities
      if (u.email === 'estate@campusfix.demo' && estateDept) {
        userData.department = estateDept._id;
      }
      if (u.email === 'maintenance@campusfix.demo' && elecDept) {
        userData.department = elecDept._id;
      }

      await User.findOneAndUpdate(
        { email: u.email },
        { $set: userData },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Seeded ${usersData.length} users.`);

    console.log('Seeding complete!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

seedDatabase();
