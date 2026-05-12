const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  department: {
    type: String,
    required: true,
    enum: [
      'Municipal Corporation',
      'Road Department',
      'Sewage Department',
      'Waste Department',
      'Water Department',
      'Electric Department',
      'Public Works Department'
    ],
  },
  designation: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  officeLocation: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'dept-admin',
  },
  ward: {
    type: String,
    default: null,
  },
  zone: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
