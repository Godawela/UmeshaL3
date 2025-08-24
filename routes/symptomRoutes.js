const express = require('express');
const symptomController = require('../controllers/symptomController');

const router = express.Router();

// CRUD routes for symptoms
router.post('/symptoms', symptomController.createSymptom);
router.get('/symptoms', symptomController.getSymptoms);
router.get('/symptoms/name/:name', symptomController.getSymptomByName);
router.get('/symptoms/:id', symptomController.getSymptomById);
router.patch('/symptoms/:id', symptomController.updateSymptom);
router.delete('/symptoms/:id', symptomController.deleteSymptom);

module.exports = router;
