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
  ward: {
    type: String,
    default: null,
  },
  zone: {
    type: String,
    default: null,
  },
  confidence: {
    type: Number,
    default: 0,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  imageDescription: {
    type: String,
    default: null,
  },
  resolutionImage: {
    type: String,
    default: null,
  },
  isAiGenerated: {
    type: Boolean,
    default: false,
  },
  resolutionLat: {
    type: Number,
  },
  resolutionLon: {
    type: Number,
  },
  aiDetectionConfidence: {
    type: Number,
    default: 0,
  },
  similarityScore: {
    type: Number,
    default: 0,
  },
  isMatch: {
    type: Boolean,
    default: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  tokensAwarded: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Grievance', GrievanceSchema);
