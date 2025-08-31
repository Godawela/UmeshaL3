const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// Test the configuration
console.log('=== CLOUDINARY CONFIG TEST ===');
console.log('Cloud Name:', process.env.CLOUD_NAME);
console.log('API Key:', process.env.CLOUD_API_KEY ? 'SET' : 'NOT SET');
console.log('API Secret:', process.env.CLOUD_API_SECRET ? 'SET' : 'NOT SET');

// Test Cloudinary connection
cloudinary.api.ping()
    .then((result) => {
        console.log('Cloudinary connection successful:', result);
    })
    .catch((error) => {
        console.error('Cloudinary connection failed:', error);
    });

module.exports = cloudinary;