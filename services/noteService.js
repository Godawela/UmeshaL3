// services/noteService.js
const Note = require('../models/noteModel');

const getAllNotes = async (uid) => {
  return await Note.find({ userId: uid });
};

async function createNote(uid, text) {
  return await Note.create({ uid, text }); 
}


async function updateNote(uid, id, text) {
  return Note.findOneAndUpdate({ _id: id, userId: uid }, { text }, { new: true });
}

async function deleteNote(uid, id) {
  const result = await Note.deleteOne({ _id: id, userId: uid });
  return result.deletedCount > 0;
}

async function deleteAllNotes(uid) {
  await Note.deleteMany({ userId: uid });
}

module.exports = {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
  deleteAllNotes,
};
