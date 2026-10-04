import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Department } from '../models/Department.js';
import { Location } from '../models/Location.js';
import { User } from '../models/User.js';
import { Issue } from '../models/Issue.js';
import { Report } from '../models/Report.js';
import { Notification } from '../models/Notification.js';
import { Counter } from '../models/Counter.js';

import { departmentsData } from './data/departments.js';
import { locationsData } from './data/locations.js';
import { usersData } from './data/users.js';
import { computePriority } from '../services/priority.service.js';

const isReset = process.argv.includes('--reset');

const daysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

const issuesData = [
  { title: 'Fan making loud noise', desc: 'Ceiling fan is vibrating and making a loud noise.', cat: 'ELECTRICAL', loc: 'Room 207', reps: 1, status: 'REPORTED', age: 0, dept: null, staff: null },
  { title: 'Wi-Fi not connecting', desc: 'Cannot connect to Wi-Fi at all.', cat: 'NETWORK', loc: 'Wi-Fi Zone A', reps: 5, status: 'IN_PROGRESS', age: 1, dept: 'IT', staff: 'Nitin Rao' },
  { title: 'Water leakage from ceiling', desc: 'Water is dripping near the books.', cat: 'PLUMBING', loc: 'Reading Hall', reps: 3, status: 'ASSIGNED', age: 2, dept: 'PLUMB', staff: null },
  { title: 'Sparking switchboard', desc: 'Sparks coming out when turning on lights.', cat: 'ELECTRICAL', loc: 'Room 112', reps: 2, status: 'IN_PROGRESS', age: 0, dept: 'ELEC', staff: 'Ramesh Kumar' },
  { title: 'Washroom not cleaned, foul smell', desc: 'Very bad smell, no cleaning done.', cat: 'SANITATION', loc: 'Washroom', reps: 4, status: 'REPORTED', age: 4, dept: null, staff: null },
  { title: 'Broken bench', desc: 'Wooden bench is cracked.', cat: 'FURNITURE', loc: 'Dining Area', reps: 1, status: 'ASSIGNED', age: 3, dept: 'CIVIL', staff: null },
  { title: 'Projector not turning on', desc: 'Red light blinks but no projection.', cat: 'EQUIPMENT', loc: 'Room 101', reps: 2, status: 'IN_PROGRESS', age: 2, dept: 'IT', staff: 'Pooja Hazarika' },
  { title: 'Tube light not working', desc: 'Flickering and then stopped working.', cat: 'ELECTRICAL', loc: 'Computer Lab 1', reps: 2, status: 'RESOLVED', age: 9, resTime: 20, dept: 'ELEC', staff: null },
  { title: 'Tap leaking continuously', desc: 'Wasting a lot of water.', cat: 'PLUMBING', loc: 'Common Room', reps: 3, status: 'RESOLVED', age: 12, resTime: 26, dept: 'PLUMB', staff: 'Dilip Das' },
  { title: 'Wi-Fi dead zone', desc: 'No signal at the back tables.', cat: 'NETWORK', loc: 'Mess Hall', reps: 2, status: 'RESOLVED', age: 15, resTime: 30, dept: 'IT', staff: null },
  { title: 'Ceiling light flickering', desc: 'Giving people a headache.', cat: 'ELECTRICAL', loc: 'Seminar Hall', reps: 1, status: 'RESOLVED', age: 22, resTime: 18, dept: 'ELEC', staff: null },
  { title: 'Mess food hygiene complaint', desc: 'Found a bug.', cat: 'SANITATION', loc: 'Mess Hall', reps: 2, status: 'CLOSED', age: 18, resTime: 40, dept: 'HK', staff: 'Lakshmi Devi' },
  { title: 'Broken window glass', desc: 'Shattered pane.', cat: 'STRUCTURAL', loc: 'Seminar Hall', reps: 1, status: 'REJECTED', age: 6, dept: 'CIVIL', staff: null },
  { title: 'Seat damaged', desc: 'Reading chair is wobbly.', cat: 'FURNITURE', loc: 'Reading Hall', reps: 1, status: 'RESOLVED', age: 7, resTime: 24, dept: 'CIVIL', staff: null },
  { title: 'Gym treadmill not working', desc: 'Belt is stuck.', cat: 'EQUIPMENT', loc: 'Gym', reps: 1, status: 'REPORTED', age: 8, dept: null, staff: null }
];

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected.');

    if (isReset) {
      if (process.env.NODE_ENV === 'production' && !process.argv.includes('--force')) {
        console.error('Cannot run seed:reset in production without --force');
        process.exit(1);
      }
      console.log('Resetting collections...');
      await Issue.deleteMany({});
      await Report.deleteMany({});
      await Notification.deleteMany({});
      await Counter.deleteMany({});
      await Department.deleteMany({});
      await Location.deleteMany({});
      await User.deleteMany({});
      console.log('Collections cleared.');
    }

    console.log('Seeding departments...');
    for (const dep of departmentsData) {
      await Department.findOneAndUpdate({ code: dep.code }, { $set: dep }, { upsert: true, new: true });
    }

    console.log('Seeding locations...');
    for (const loc of locationsData) {
      loc.label = `${loc.building} — ${loc.floor} — ${loc.area}`;
      await Location.findOneAndUpdate({ building: loc.building, floor: loc.floor, area: loc.area }, { $set: loc }, { upsert: true, new: true, runValidators: true });
    }

    console.log('Seeding users...');
    for (const u of usersData) {
      const userData = { ...u };
      if (u.departmentCode) {
        const dept = await Department.findOne({ code: u.departmentCode });
        if (dept) userData.department = dept._id;
      }
      await User.findOneAndUpdate({ email: u.email }, { $set: userData }, { upsert: true, new: true });
    }

    if (isReset) {
      console.log('Seeding issues...');
      const students = await User.find({ role: 'STUDENT' });
      
      let issueCounter = 1;

      for (const iData of issuesData) {
        const loc = await Location.findOne({ area: iData.loc });
        const dept = iData.dept ? await Department.findOne({ code: iData.dept }) : null;
        
        const createdDate = daysAgo(iData.age);
        
        // Priority
        const priority = computePriority({
          description: iData.desc,
          category: iData.cat,
          location: loc,
          reportCount: iData.reps,
          createdAt: createdDate,
          status: iData.status,
          now: new Date()
        });

        // Create reports first to get primaryReport id
        const repIds = [];
        for (let j = 0; j < iData.reps; j++) {
          const student = students[j % students.length];
          const repDate = new Date(createdDate.getTime() + j * 3600000); // add 1 hr per rep
          
          // Using a manual ID so we can associate it before issue save, or just create it with issue undefined and then update
          const report = new Report({
            reporter: student._id,
            category: iData.cat,
            location: loc._id,
            description: iData.desc,
            isPrimary: j === 0,
            createdAt: repDate,
            updatedAt: repDate
          });
          repIds.push(report);
        }

        const estateDept = await Department.findOne({ code: 'ESTATE' });
        
        const code = `CF-${String(issueCounter++).padStart(4, '0')}`;
        
        const issue = new Issue({
          code,
          title: iData.title,
          description: iData.desc,
          category: iData.cat,
          location: loc._id,
          locationSnapshot: { building: loc.building, floor: loc.floor, label: loc.area, area: loc.area, type: loc.zoneType },
          status: iData.status,
          priority: { level: priority.level, score: priority.score, breakdown: priority.breakdown, overridden: false },
          reportCount: iData.reps,
          createdAt: createdDate,
          updatedAt: new Date(),
          department: dept?._id || null,
          suggestedDepartment: dept?._id || estateDept?._id,
          assignedStaff: iData.staff,
          primaryReport: repIds[0]._id,
          timeline: [{
            type: 'CREATED',
            status: 'REPORTED',
            note: 'Issue reported',
            actor: { id: students[0]._id, name: students[0].name, role: 'STUDENT' },
            createdAt: createdDate
          }]
        });

        if (iData.resTime && ['RESOLVED', 'CLOSED'].includes(iData.status)) {
          const resDate = new Date(createdDate.getTime() + iData.resTime * 60 * 60 * 1000);
          issue.resolvedAt = resDate;
          issue.timeline.push({
            type: 'STATUS',
            status: 'RESOLVED',
            note: 'Issue marked as resolved',
            createdAt: resDate
          });
        }
        
        if (iData.status === 'CLOSED') {
          const closeDate = new Date(createdDate.getTime() + (iData.resTime + 10) * 60 * 60 * 1000);
          issue.closedAt = closeDate;
        }

        await issue.save();

        for (const rep of repIds) {
          rep.issue = issue._id;
          await rep.save();
        }
      }
      
      await Counter.create({ _id: 'issue', seq: issueCounter });
      console.log(`o. Seeded ${issuesData.length} issues.`);
    }

    console.log('Seeding complete!');
  } catch (error) {
    console.error('?O Error during seeding:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

seedDatabase();
