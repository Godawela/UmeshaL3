const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'answered'],
    default: 'pending'
  },
  reply: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  repliedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Question', questionSchema);