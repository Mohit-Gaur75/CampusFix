import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Department } from '../models/Department.js';
import { Location } from '../models/Location.js';
import { departmentsData } from './data/departments.js';
import { locationsData } from './data/locations.js';

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
