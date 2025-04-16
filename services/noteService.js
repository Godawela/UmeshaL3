// services/noteService.js
const Note = require('../models/noteModel');

const getAllNotes = () => Note.find();

const createNote = (text) => Note.create({ text });

const updateNote = (id, text) => Note.findByIdAndUpdate(id, { text }, { new: true });

const deleteNote = (id) => Note.findByIdAndDelete(id);

const deleteAllNotes = () => Note.deleteMany();

module.exports = {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
  deleteAllNotes,
};
