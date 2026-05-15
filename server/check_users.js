const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/grievance_system';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const users = await User.find({}, { password: 0 });
    console.log('Departmental Users found:', users.length);
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection failed:', err.message);
    process.exit(1);
  });
