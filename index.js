const mongoose = require('mongoose');
const path = require('path');
const express = require('express');
require('dotenv').config();

console.log('=== ALL ENV VARIABLES ===');
Object.keys(process.env).forEach(key => {
  if (key.includes('FIREBASE') || key.includes('CLOUD')) {
    console.log(`${key}:`, process.env[key] ? 'EXISTS' : 'MISSING');
  }
});
console.log('========================');

// Initialize Express App FIRST
const app = express();
const port = process.env.PORT || "8000";

// Express middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Initialize Firebase Admin
const admin = require('firebase-admin');

// Check if Firebase is already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
  console.log('✅ Firebase initialized successfully');
} else {
  console.log('✅ Firebase already initialized - using existing app');
}

// Database connection
const dbURI = process.env.DB_URI;
mongoose
    .connect(dbURI)
    .then(() => console.log("Database Connected"))
    .catch((err) => console.log(err));

mongoose.Promise = global.Promise;

// Import routes
const deviceRoutes = require('./routes/deviceRoutes');
const symptomRoutes = require('./routes/symptomRoutes');
const userRoutes = require('./routes/userRoutes');
const noteRoutes = require('./routes/noteRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const quickTipRoutes = require('./routes/quickTipRoutes');
const questionRoutes = require('./routes/questionRoutes');

// Store FCM tokens endpoint
app.post('/api/fcm-tokens', async (req, res) => {
  try {
    const { token, userId } = req.body;
    
    // Update your User model to include FCM token
    const User = require('./models/User'); // Adjust path to your User model
    await User.findByIdAndUpdate(userId, {
      fcmToken: token,
      tokenUpdatedAt: new Date()
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error storing FCM token:', error);
    res.status(500).json({ error: 'Failed to store FCM token' });
  }
});

// Notify all admins of new question
app.post('/api/notify-admins', async (req, res) => {
  try {
    const { studentName, questionPreview, type } = req.body;
    
    // Get all admin users with FCM tokens
    const User = require('./models/userModel'); // Adjust path
    const admins = await User.find({ 
      role: 'Admin', 
      fcmToken: { $exists: true, $ne: null } 
    });
    
    const adminTokens = admins.map(admin => admin.fcmToken).filter(token => token);
    
    if (adminTokens.length === 0) {
      return res.status(200).json({ message: 'No admin tokens found' });
    }
    
    // Prepare the notification
    const message = {
      notification: {
        title: `New Question from ${studentName}`,
        body: questionPreview.length > 100 
          ? `${questionPreview.substring(0, 100)}...`
          : questionPreview,
      },
      data: {
        type: 'new_question',
        payload: 'view_questions'
      },
      tokens: adminTokens
    };
    
    // Send to all admin devices
    const response = await admin.messaging().sendEachForMulticast(message);
    
    console.log(`Successfully sent to ${response.successCount} devices`);
    
    res.status(200).json({ 
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    });
    
  } catch (error) {
    console.error('Error sending admin notifications:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});

// Use the routes
app.use('/api', deviceRoutes);
app.use('/api', symptomRoutes);
app.use('/api', userRoutes); 
app.use('/api', noteRoutes); 
app.use('/api', categoryRoutes);
app.use('/api/quicktips', quickTipRoutes);
app.use('/api', questionRoutes);

// Default route
app.get('/', (req, res) => {
    res.send('Hello from Express!!');
});

// Start server
app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});

module.exports = app;