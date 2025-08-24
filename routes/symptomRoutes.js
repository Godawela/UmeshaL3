const express = require('express');
const symptomController = require('../controllers/symptomController');
const { upload, handleMulterError } = require('../config/multer');

const router = express.Router();

router.post('/symptoms', upload.single('image'), symptomController.createSymptom, handleMulterError);
router.get('/symptoms', symptomController.getSymptoms);
router.get('/symptoms/name/:name', symptomController.getSymptomByName);
router.get('/symptoms/:id', symptomController.getSymptomById);
router.patch('/symptoms/:id', upload.single('image'), symptomController.updateSymptom, handleMulterError);
router.delete('/symptoms/:id', symptomController.deleteSymptom);

module.exports = router;
