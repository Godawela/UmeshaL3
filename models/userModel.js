const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'student' },
    verified: { type: Boolean, default: false }, 
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
