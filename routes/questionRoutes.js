const express = require('express');
const questionController = require('../controllers/questionController');
const router = express.Router();

// Get all questions (for admin)
router.get('/questions', questionController.getAllQuestions);

// Get questions by student ID
router.get('/questions/student/:uid', questionController.getQuestionsByStudent);

// Create new question
router.post('/questions', questionController.createQuestion);

// Update question (reply)
router.put('/questions/:id', questionController.updateQuestion);

module.exports = router;