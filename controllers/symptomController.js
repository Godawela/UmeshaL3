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
// In your existing symptomController.js - just add logging
exports.updateSymptom = async (req, res) => {
  try {
    // ADD ONLY THIS LOGGING
    console.log('=== UPDATE DEBUG ===');
    console.log('Request ID:', req.params.id);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file ? 'File present' : 'No file');
    
    const updates = {
      name: req.body.name,
      description: req.body.description,
      resourceLink: req.body.resourceLink,
    };

    // Handle image removal
    if (req.body.removeImage === 'true') {
      updates.image = null;
      console.log('Setting image to null');
    }

    // Handle new image upload
    if (req.file) {
      updates.image = req.file.path;
      console.log('New image path:', req.file.path);
    }

    console.log('Final updates:', updates);

    const symptom = await Symptom.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    
    if (!symptom) {
      console.log('Symptom not found with ID:', req.params.id);
      return res.status(404).json({ error: 'Symptom not found' });
    }

    console.log('Update successful:', symptom);
    res.status(200).json(symptom);
  } catch (error) {
    console.error('Update error:', error.message);
    console.error('Stack trace:', error.stack);
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
