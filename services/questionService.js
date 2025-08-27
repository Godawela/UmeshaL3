const Question = require('../models/questionModel');

const questionService = {
  async getAllQuestions() {
    return await Question.find().sort({ timestamp: -1 });
  },

  async getQuestionsByStudent(studentId) {
    return await Question.find({ studentId }).sort({ timestamp: -1 });
  },

  async createQuestion(questionData) {
    const question = new Question(questionData);
    return await question.save();
  },

  async updateQuestion(questionId, updateData) {
    if (updateData.status === 'answered') {
      updateData.repliedAt = new Date();
    }
    
    return await Question.findByIdAndUpdate(
      questionId,
      updateData,
      { new: true, runValidators: true }
    );
  },

  async deleteQuestion(questionId) {
    return await Question.findByIdAndDelete(questionId);
  }
};

module.exports = questionService;