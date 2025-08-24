const mongoose = require('mongoose');

const symptomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    resourceLink: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
     image: {
        type: String, // Store file path or URL
        required: false,
        default: null
    },
}, { timestamps: true });

const Symptom = mongoose.model('Symptom', symptomSchema);

module.exports = Symptom;
