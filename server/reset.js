const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/grievance_system').then(async () => {
  const salt = await bcrypt.genSalt(10);
  const pwd = await bcrypt.hash('admin123', salt);
  await mongoose.connection.collection('users').updateOne(
    { email: 'admin@jansahayak.gov.in' },
    { $set: { password: pwd } }
  );
  console.log('Password reset successfully to admin123');
  process.exit(0);
}).catch(console.error);
