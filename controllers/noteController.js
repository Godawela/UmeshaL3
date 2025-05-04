const noteService = require('../services/noteService');
const Note = require('../models/noteModel'); 
// GET /api/notes/:uid
const getNotes = async (req, res) => {
  try {
    const { uid } = req.params;
    console.log("UID received:", uid);  // 🔍 Debug

    if (!uid) return res.status(400).json({ message: 'UID is required' });

    const notes = await noteService.getAllNotes(uid);
    res.json(notes);
  } catch (err) {
    console.error("GET notes error:", err);  // 🔍 See backend logs
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// POST /api/notes/:uid
const createNote = async (req, res) => {
  const { uid } = req.params;  // Get the user ID from the URL parameter
  const { text } = req.body;   // Get the note text from the request body

  // Check if the text field is provided
  if (!text) return res.status(400).json({ message: 'Text is required' });

  // Create a new note
  const newNote = new Note({
    userId: uid,
    text: text
  });

  try {
    // Save the new note in the database
    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });  // Handle validation errors
    }
    res.status(500).json({ message: 'Server error' });
  }
};



// PUT /api/notes/:uid/:id
const updateNote = async (req, res) => {
  const { uid, id } = req.params;
  const { text } = req.body;

  const updated = await noteService.updateNote(uid, id, text);
  if (!updated) return res.status(404).json({ message: 'Note not found' });

  res.json(updated);
};

// DELETE /api/notes/:uid/:id
const deleteNote = async (req, res) => {
  const { uid, id } = req.params;

  const deleted = await noteService.deleteNote(uid, id);
  if (!deleted) return res.status(404).json({ message: 'Note not found' });

  res.status(204).end();
};

// DELETE /api/notes/:uid
const deleteAll = async (req, res) => {
  const { uid } = req.params;
  await noteService.deleteAllNotes(uid);
  res.status(204).end();
};

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  deleteAll,
};
