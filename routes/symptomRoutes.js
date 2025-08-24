const express = require('express');
const symptomController = require('../controllers/symptomController');

const router = express.Router();

// CRUD routes for symptoms
router.post('/', upload.single('image'), symptomController.createSymptom, handleMulterError);
router.patch('/:id', upload.single('image'), symptomController.updateSymptom, handleMulterError);
router.delete('/:id', symptomController.deleteSymptom);
router.get('/symptoms', symptomController.getSymptoms);
router.get('/symptoms/name/:name', symptomController.getSymptomByName);
router.get('/symptoms/:id', symptomController.getSymptomById);


module.exports = router;
