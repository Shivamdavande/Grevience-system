const mongoose = require('mongoose');
const Grievance = require('./server/models/Grievance');

const MONGODB_URI = 'mongodb://localhost:27017/grievance_system';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const grievances = await Grievance.find().limit(5);
    console.log("Recent Grievances:");
    grievances.forEach(g => {
      console.log(`ID: ${g._id}, Image: ${g.imageUrl}, Text: ${g.text.substring(0, 20)}`);
    });
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
