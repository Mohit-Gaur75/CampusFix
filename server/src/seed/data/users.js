import bcrypt from 'bcryptjs';

// Password for all demo users: Demo@123
export const DEMO_PASSWORD_HASH = bcrypt.hashSync('Demo@123', 10);

export const usersData = [
  { name: 'Aarav Sharma', email: 'aarav@campusfix.demo', role: 'STUDENT', studentId: 'CS24B012', phone: '9876543210', passwordHash: DEMO_PASSWORD_HASH },
  { name: 'Priya Das', email: 'priya@campusfix.demo', role: 'STUDENT', studentId: 'CS24B027', phone: '9876543211', passwordHash: DEMO_PASSWORD_HASH },
  { name: 'Rohan Singh', email: 'rohan@campusfix.demo', role: 'STUDENT', studentId: 'CE24B015', phone: '9876543212', passwordHash: DEMO_PASSWORD_HASH },
  { name: 'Ananya Gogoi', email: 'ananya@campusfix.demo', role: 'STUDENT', studentId: 'EE24B008', phone: '9876543213', passwordHash: DEMO_PASSWORD_HASH },
  { name: 'Kabir Yadav', email: 'kabir@campusfix.demo', role: 'STUDENT', studentId: 'ME24B041', phone: '9876543214', passwordHash: DEMO_PASSWORD_HASH },
  { name: 'Meera Nair', email: 'meera@campusfix.demo', role: 'STUDENT', studentId: 'CS23B019', phone: '9876543215', passwordHash: DEMO_PASSWORD_HASH },
  { name: 'Dr. R. K. Bora', email: 'estate@campusfix.demo', role: 'AUTHORITY', departmentCode: 'ESTATE', phone: '9876543216', passwordHash: DEMO_PASSWORD_HASH },
  { name: 'Sunita Devi', email: 'maintenance@campusfix.demo', role: 'AUTHORITY', departmentCode: 'ELEC', phone: '9876543217', passwordHash: DEMO_PASSWORD_HASH },
  { name: 'Campus Admin', email: 'admin@campusfix.demo', role: 'ADMIN', phone: '9876543218', passwordHash: DEMO_PASSWORD_HASH }
];
