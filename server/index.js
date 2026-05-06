const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const twilio = require('twilio');
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

// Auth store (In-memory for OTPs)
const otpStore = {};

// Optional Twilio Setup (if env vars are provided)
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC') && process.env.TWILIO_AUTH_TOKEN)
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;
console.log('Twilio client initialized:', !!twilioClient, 'Service SID present:', !!process.env.TWILIO_SERVICE_SID);

// Auth Routes
app.post('/api/auth/send-otp', async (req, res) => {
  const { aadhar } = req.body;
  if (!aadhar || aadhar.length !== 12) {
    return res.status(400).json({ error: 'Valid 12-digit Aadhar is required' });
  }

  try {
    const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'users.json')));
    const user = usersData.find(u => u.aadhar === aadhar);

    if (!user) {
      return res.status(404).json({ error: 'Aadhar not linked to any account' });
    }

    let phone = user.phone;
    if (!phone.startsWith('+91')) {
      phone = '+91' + phone;
    }

    if (twilioClient && process.env.TWILIO_SERVICE_SID) {
      // Use Twilio Verify API
      try {
        await twilioClient.verify.v2.services(process.env.TWILIO_SERVICE_SID)
          .verifications
          .create({to: phone, channel: 'sms'});
        console.log(`Twilio Verify requested for ${phone}`);
      } catch (twilioErr) {
        console.error('Twilio Verify API Error:', twilioErr.message);
        // Fallback to manual OTP if Twilio fails
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[aadhar] = { otp, phone, expiresAt: Date.now() + 5 * 60 * 1000 };
        console.log(`\n=== TWILIO FAILED - FALLBACK SIMULATED SMS ===\nTo: ${phone}\nOTP: ${otp}\n============================================\n`);
      }
    } else {
      // Fallback: Generate 6-digit OTP manually
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore[aadhar] = { otp, phone, expiresAt: Date.now() + 5 * 60 * 1000 };
      console.log(`\n=== SIMULATED SMS ===\nTo: ${phone}\nOTP: ${otp}\n=====================\n`);
    }

    res.json({ message: 'OTP sent successfully', phone: phone });
  } catch (err) {
    console.error('Send OTP Error:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  const { aadhar, otp } = req.body;

  try {
    const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'users.json')));
    const user = usersData.find(u => u.aadhar === aadhar);
    if (!user) return res.status(404).json({ error: 'Aadhar not linked to any account' });

    let phone = user.phone;
    if (!phone.startsWith('+91')) {
      phone = '+91' + phone;
    }

    // Check manual fallback store first
    const record = otpStore[aadhar];
    if (record) {
      if (Date.now() > record.expiresAt) {
        delete otpStore[aadhar];
        return res.status(400).json({ error: 'OTP has expired' });
      }
      if (record.otp === otp) {
        delete otpStore[aadhar];
        return res.json({ message: 'Login successful', token: 'mock-jwt-token' });
      }
      // If it exists but doesn't match, we still return error (don't fall through to Twilio to avoid confusion)
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // If not in manual store, try Twilio if configured
    if (twilioClient && process.env.TWILIO_SERVICE_SID) {
      try {
        const verificationCheck = await twilioClient.verify.v2.services(process.env.TWILIO_SERVICE_SID)
          .verificationChecks
          .create({to: phone, code: otp});
        
        if (verificationCheck.status !== 'approved') {
          return res.status(400).json({ error: 'Invalid or expired OTP' });
        }
      } catch (twilioErr) {
        console.error('Twilio Verification Check Error:', twilioErr.message);
        return res.status(400).json({ error: 'Verification failed. Please try again.' });
      }
    } else {
      // If no Twilio and no record in store
      return res.status(400).json({ error: 'No OTP requested or expired' });
    }

    // Success
    res.json({ message: 'Login successful', token: 'mock-jwt-token' });
  } catch (err) {
    console.error('Verify OTP Error:', err);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// 1. Submit a complaint (Supports Text + Image)
app.post('/api/complaints', upload.single('image'), async (req, res) => {
  const { text, location, lat, lon, department: userSelectedDepartment } = req.body;
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

    // 2. Map Category to Department (only if not provided by user)
    let finalDepartment = userSelectedDepartment || 'Municipal Corporation';

    // If frontend didn't send a department, fallback to AI logic
    if (!userSelectedDepartment || userSelectedDepartment === 'Municipal Corporation') {
      const cat = category.toLowerCase();
      const textLower = text.toLowerCase();

      if (cat.includes('road') || textLower.includes('road') || textLower.includes('sadak')) {
        finalDepartment = 'Road Department';
      } else if (cat.includes('sewage') || cat.includes('sanitation') || textLower.includes('sewage') || textLower.includes('gutter')) {
        finalDepartment = 'Sewage Department';
      } else if (cat.includes('waste') || cat.includes('garbage') || textLower.includes('kachra') || textLower.includes('waste')) {
        finalDepartment = 'Waste Department';
      } else if (cat.includes('water') || textLower.includes('water') || textLower.includes('pani') || textLower.includes('paani')) {
        finalDepartment = 'Water Department';
      } else if (cat.includes('electric') || cat.includes('light') || textLower.includes('light') || textLower.includes('bijli')) {
        finalDepartment = 'Electric Department';
      }
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
      department: finalDepartment,
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
  const { status, resolutionImage, isAiGenerated, aiDetectionConfidence, similarityScore, isMatch } = req.body;
  try {
    const updateData = { status };
    if (resolutionImage) updateData.resolutionImage = resolutionImage;
    if (typeof isAiGenerated === 'boolean') updateData.isAiGenerated = isAiGenerated;
    if (typeof aiDetectionConfidence === 'number') updateData.aiDetectionConfidence = aiDetectionConfidence;
    if (typeof similarityScore === 'number') updateData.similarityScore = similarityScore;
    if (typeof isMatch === 'boolean') updateData.isMatch = isMatch;

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

    res.json(aiResponse.data);
  } catch (err) {
    console.error("AI Analysis failed", err.message);
    res.status(500).json({ error: 'AI analysis failed' });
  }
});

// 6. Detect AI-generated image
app.post('/api/detect-ai-image', upload.single('image'), async (req, res) => {
  const imageFile = req.file;
  if (!imageFile) return res.status(400).json({ error: 'Image is required' });

  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imageFile.path));

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/detect-ai-image`, formData, {
      headers: formData.getHeaders()
    });

    // Clean up temp file
    fs.unlinkSync(imageFile.path);

    res.json(aiResponse.data);
  } catch (err) {
    console.error("AI Detection failed", err.message);
    res.status(500).json({ error: 'AI detection failed', is_ai_generated: false, confidence: 0 });
  }
});

// 7. Compare Resolution Image with Original
app.post('/api/compare-images', upload.single('image'), async (req, res) => {
  const { complaintId } = req.body;
  const resolutionFile = req.file;

  if (!complaintId || !resolutionFile) {
    return res.status(400).json({ error: 'Complaint ID and resolution image are required' });
  }

  try {
    const complaint = await Grievance.findById(complaintId);
    if (!complaint || !complaint.imageUrl) {
      return res.status(404).json({ error: 'Original complaint image not found' });
    }

    // Path to original image - remove leading slash if present to avoid absolute path issues on Windows
    const cleanImageUrl = complaint.imageUrl.startsWith('/') ? complaint.imageUrl.substring(1) : complaint.imageUrl;
    const originalImagePath = path.join(__dirname, cleanImageUrl);

    console.log(`Original Image Path: ${originalImagePath}`);
    if (!fs.existsSync(originalImagePath)) {
      console.error(`File not found: ${originalImagePath}`);
      return res.status(404).json({ error: 'Original image file not found on server' });
    }

    const formData = new FormData();
    formData.append('file1', fs.createReadStream(originalImagePath));
    formData.append('file2', fs.createReadStream(resolutionFile.path));

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/compare-images`, formData, {
      headers: formData.getHeaders()
    });

    // Clean up temp file
    fs.unlinkSync(resolutionFile.path);

    res.json(aiResponse.data);
  } catch (err) {
    console.error("Image Comparison failed:", err.message);
    if (err.response) {
      console.error("AI Service Response Error:", err.response.data);
    }
    if (resolutionFile && fs.existsSync(resolutionFile.path)) fs.unlinkSync(resolutionFile.path);
    res.status(500).json({ 
      error: 'Image comparison failed', 
      details: err.message,
      aiError: err.response ? err.response.data : null,
      similarity_score: 0, 
      is_match: false 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
