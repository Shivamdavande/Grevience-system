const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/grevienceDB');

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);

async function resetPasswords() {
  const users = await User.find({});
  for (let user of users) {
    console.log(`Resetting password for ${user.email} to "random"`);
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash("random", salt);
    await user.save();
  }
  console.log("Done resetting passwords.");
  process.exit(0);
}

resetPasswords();
