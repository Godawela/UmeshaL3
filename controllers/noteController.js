const noteService = require('../services/noteService');

// GET /api/notes
const getNotes = async (req, res) => {
  const notes = await noteService.getAllNotes();
  res.json(notes);
};

// POST /api/notes
const createNote = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'Text is required' });

  const newNote = await noteService.createNote(text);
  res.status(201).json(newNote);
};

// PUT /api/notes/:id
const updateNote = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  const updated = await noteService.updateNote(id, text);
  if (!updated) return res.status(404).json({ message: 'Note not found' });

  res.json(updated);
};

// DELETE /api/notes/:id
const deleteNote = async (req, res) => {
  const { id } = req.params;

  const deleted = await noteService.deleteNote(id);
  if (!deleted) return res.status(404).json({ message: 'Note not found' });

  res.status(204).end();
};

// DELETE /api/notes
const deleteAll = async (req, res) => {
  await noteService.deleteAllNotes();
  res.status(204).end();
};

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  deleteAll,
};
