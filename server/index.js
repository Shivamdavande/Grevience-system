const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');

const Grievance = require('./models/Grievance');

const app = express();
const PORT = process.env.PORT || 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Multer Setup
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grievance_system';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Routes

// 1. Submit a complaint (Supports Text + Image)
app.post('/api/complaints', upload.single('image'), async (req, res) => {
  const { text, location, lat, lon } = req.body;
  const imageFile = req.file;

  if (!text && !imageFile) {
    return res.status(400).json({ error: 'Complaint text or image is required' });
  }

  try {
    let category, priority, confidence, imageDescription;
    let imageUrl = imageFile ? `/uploads/${imageFile.filename}` : null;

    if (imageFile) {
        // Analyze image if provided
        console.log("Image received, sending to AI service for analysis...");
        const formData = new FormData();
        formData.append('file', fs.createReadStream(imageFile.path));

        try {
            const aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze-image`, formData, {
                headers: formData.getHeaders()
            });
            ({ category, priority, confidence, description: imageDescription } = aiResponse.data);
            console.log(`AI Analysis: ${category} (${priority}) - ${imageDescription}`);
        } catch (aiErr) {
            console.error("AI Service Image Analysis Error:", aiErr.message);
            // Fallback
            category = 'Others';
            priority = 'Low';
            confidence = 0;
            imageDescription = "Image analysis failed";
        }
    } else {
        // Analyze text only
        console.log(`Sending text to AI service: "${text}"`);
        try {
            const aiResponse = await axios.post(`${AI_SERVICE_URL}/classify`, { text });
            ({ category, priority, confidence } = aiResponse.data);
        } catch (aiErr) {
            console.error("AI Service Text Error:", aiErr.message);
            category = 'Others';
            priority = 'Low';
            confidence = 0;
        }
    }

    // 2. Map Category to Department
    let department = 'Municipal Corporation';
    const cat = category.toLowerCase();
    const textLower = text.toLowerCase();
    
    if (cat.includes('road') || textLower.includes('road') || textLower.includes('sadak')) {
      department = 'Road Department';
    } else if (cat.includes('sewage') || cat.includes('sanitation') || textLower.includes('sewage') || textLower.includes('gutter')) {
      department = 'Sewage Department';
    } else if (cat.includes('waste') || cat.includes('garbage') || textLower.includes('kachra') || textLower.includes('waste')) {
      department = 'Waste Department';
    } else if (cat.includes('water') || textLower.includes('water') || textLower.includes('pani') || textLower.includes('paani')) {
      department = 'Water Department';
    } else if (cat.includes('electric') || cat.includes('light') || textLower.includes('light') || textLower.includes('bijli')) {
      department = 'Electric Department';
    }

    // 3. Save to Database
    const newGrievance = new Grievance({
      text: text || imageDescription || 'No description provided',
      location: location || 'Location not provided',
      lat,
      lon,
      category,
      priority,
      confidence,
      department,
      imageUrl,
      imageDescription
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

// 2.5 Get a specific complaint by ID
app.get('/api/complaints/:id', async (req, res) => {
  try {
    const complaint = await Grievance.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// 3. Update status
app.patch('/api/complaints/:id', async (req, res) => {
  const { status, resolutionImage } = req.body;
  try {
    const updateData = { status };
    if (resolutionImage) updateData.resolutionImage = resolutionImage;

    const updated = await Grievance.findByIdAndUpdate(
      req.params.id,
      updateData,
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

// 5. Analyze image only (for immediate feedback)
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
    const imageFile = req.file;
    if (!imageFile) return res.status(400).json({ error: 'Image is required' });

    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(imageFile.path));

        const aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze-image`, formData, {
            headers: formData.getHeaders()
        });
        
        // Clean up temp file
        // fs.unlinkSync(imageFile.path); 
        
        res.json(aiResponse.data);
    } catch (err) {
        console.error("AI Analysis failed", err.message);
        res.status(500).json({ error: 'AI analysis failed' });
    }
});

app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
