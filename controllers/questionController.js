const questionService = require('../services/questionService');

const questionController = {
  async getAllQuestions(req, res) {
    try {
      const questions = await questionService.getAllQuestions();
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getQuestionsByStudent(req, res) {
    try {
      const { uid } = req.params;
      const questions = await questionService.getQuestionsByStudent(uid);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async createQuestion(req, res) {
    try {
      const questionData = req.body;
      const question = await questionService.createQuestion(questionData);
      res.status(201).json(question);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async updateQuestion(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const question = await questionService.updateQuestion(id, updateData);
      
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }
      
      res.json(question);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

module.exports = questionController;