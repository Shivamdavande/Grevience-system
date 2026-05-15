const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/grievance_system';

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const adminExists = await User.findOne({ email: 'admin@jansahayak.gov.in' });
    if (adminExists) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = new User({
      fullName: 'Chief Administrator',
      email: 'admin@jansahayak.gov.in',
      employeeId: 'ADMIN001',
      department: 'Municipal Corporation',
      designation: 'Nodal Officer',
      mobile: '9999999999',
      password: hashedPassword,
      officeLocation: 'Bhopal HQ',
      ward: 'Ward 1',
      zone: 'Zone A'
    });

    await admin.save();
    console.log('✅ Default Admin Created Successfully!');
    console.log('Email: admin@jansahayak.gov.in');
    console.log('Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createAdmin();
