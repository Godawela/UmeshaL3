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
    try {
        console.log('Service: Updating symptom with ID:', id, 'Updates:', updates);
        const result = await Symptom.findByIdAndUpdate(id, updates, { 
            new: true, 
            runValidators: true 
        });
        console.log('Service: Update result:', result);
        return result;
    } catch (error) {
        console.error('Service: Update error:', error);
        throw error;
    }
}
}

module.exports = new SymptomService();
