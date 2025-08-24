const Symptom = require('../models/symptomModel');

class SymptomService {
    async addSymptom(symptomData) {
        const symptom = new Symptom(symptomData);
        return await symptom.save();
    }

    async getAllSymptoms() {
        return await Symptom.find({});
    }

    async findSymptomByName(name) {
        return await Symptom.findOne({ name });
    }

    async findSymptomById(id) {
        return await Symptom.findById(id);
    }

    async removeSymptomById(id) {
        return await Symptom.findByIdAndDelete(id);
    }

    async updateSymptomById(id, updates) {
        return await Symptom.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    }
}

module.exports = new SymptomService();
