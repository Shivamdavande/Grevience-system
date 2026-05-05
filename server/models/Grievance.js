const mongoose = require('mongoose');

const GrievanceSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: 'Unclassified',
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Low',
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending',
  },
  department: {
    type: String,
    enum: [
      'Municipal Corporation',
      'Road Department',
      'Sewage Department',
      'Waste Department',
      'Water Department',
      'Electric Department'
    ],
    default: 'Municipal Corporation',
  },
  location: {
    type: String,
    default: 'Unknown',
  },
  lat: {
    type: Number,
  },
  lon: {
    type: Number,
  },
  confidence: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Grievance', GrievanceSchema);
