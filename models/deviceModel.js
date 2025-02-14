const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    reference: {
        type: String,
        required: true
    },
    linkOfResource: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
