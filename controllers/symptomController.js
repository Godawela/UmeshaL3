const Symptom = require('../models/symptomModel');
const { upload } = require('../middlewares/multerConfig'); 


// Create a new symptom
exports.createSymptom = async (req, res) => {
    try {
        const symptomData = {
            ...req.body,
            image: req.file ? req.file.path : null
        };

        const symptom = new Symptom(symptomData);
        await symptom.save();
        res.status(201).json(symptom);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// Get all symptoms
exports.getSymptoms = async (req, res) => {
    try {
        const symptoms = await Symptom.find({});
        res.status(200).json(symptoms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a symptom by name
exports.getSymptomByName = async (req, res) => {
    try {
        const symptom = await Symptom.findOne({ name: req.params.name });
        if (!symptom) return res.status(404).json({ error: 'Symptom not found' });
        res.status(200).json(symptom);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a symptom by ID
exports.getSymptomById = async (req, res) => {
    try {
        const symptom = await Symptom.findById(req.params.id);
        if (!symptom) return res.status(404).json({ error: 'Symptom not found' });
        res.status(200).json(symptom);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a symptom by ID
exports.updateSymptom = async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      description: req.body.description,
      resourceLink: req.body.resourceLink,
    };

    // Handle image removal
    if (req.body.removeImage === 'true') {
      updates.image = null;
    }

    // Handle new image upload
    if (req.file) {
      updates.image = req.file.path; // multer-storage-cloudinary gives the URL in path
    }

const symptom = await symptomService.updateSymptomById(req.params.id, updates);
    if (!symptom) return res.status(404).json({ error: 'Symptom not found' });

    res.status(200).json(symptom);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



// Delete a symptom by ID
exports.deleteSymptom = async (req, res) => {
    try {
        const symptom = await Symptom.findByIdAndDelete(req.params.id);
        if (!symptom) return res.status(404).json({ error: 'Symptom not found' });
        res.status(200).json({ message: 'Symptom deleted successfully', symptom });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
