const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grievance_system';

const DepartmentSchema = new mongoose.Schema({
  name: String,
  tokens: { type: Number, default: 0 }
});

const Department = mongoose.model('Department', DepartmentSchema);

async function resetTokens() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const result = await Department.updateMany({}, { $set: { tokens: 0 } });
    console.log(`Reset tokens for ${result.modifiedCount} departments.`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error resetting tokens:', err);
    process.exit(1);
  }
}

resetTokens();
