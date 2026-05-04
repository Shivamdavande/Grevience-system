const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const Grievance = require('./models/Grievance');

const app = express();
const PORT = process.env.PORT || 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grievance_system';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Routes

// 1. Submit a complaint
app.post('/api/complaints', async (req, res) => {
  const { text, location } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Complaint text is required' });
  }

  try {
    // 1. Call AI Service for classification
    console.log(`Sending text to AI service: "${text}"`);
    let aiResponse;
    try {
        aiResponse = await axios.post(`${AI_SERVICE_URL}/classify`, { text });
    } catch (aiErr) {
        console.error("AI Service Error:", aiErr.message);
        // Fallback if AI service is down
        aiResponse = { data: { category: 'Others', priority: 'Low', confidence: 0 } };
    }

    const { category, priority, confidence } = aiResponse.data;

    // 2. Map Category to Department
    let department = 'Municipal Corporation';
    if (category === 'Road Issues') department = 'Public Works Department';
    else if (category === 'Electricity') department = 'Electric Department';
    else if (category === 'Water Supply') department = 'Water Supply Department';

    // 3. Save to Database
    const newGrievance = new Grievance({
      text,
      location: location || 'Location not provided',
      category,
      priority,
      confidence,
      department
    });

    const savedGrievance = await newGrievance.save();
    res.status(201).json(savedGrievance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 2. Get all complaints
app.get('/api/complaints', async (req, res) => {
  try {
    const grievances = await Grievance.find().sort({ createdAt: -1 });
    res.json(grievances);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// 3. Update status
app.patch('/api/complaints/:id', async (req, res) => {
  const { status } = req.body;
  try {
    const updated = await Grievance.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// 4. Get Statistics (for Dashboard)
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await Grievance.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);
        const statusStats = await Grievance.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        res.json({ categories: stats, statuses: statusStats });
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
