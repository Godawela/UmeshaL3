const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

router.get('/notes/:uid', noteController.getNotes);
router.post('/notes/:uid', noteController.createNote);
router.put('/notes/:uid/:id', noteController.updateNote);
router.delete('/notes/:uid/:id', noteController.deleteNote);
router.delete('/notes/:uid', noteController.deleteAll);


module.exports = router;
