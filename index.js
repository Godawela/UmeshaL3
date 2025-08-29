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
    console.log('=== FCM Token Storage Request ===');
    console.log('Request body:', req.body);
    
    const { token, userId } = req.body;
    
    if (!token || !userId) {
      console.log('Missing token or userId');
      return res.status(400).json({ error: 'Token and userId required' });
    }
    
    const User = require('./models/userModel');
    
    // Find user by uid (not _id)
    console.log('Looking for user with uid:', userId);
    const user = await User.findOne({ uid: userId });
    
    if (!user) {
      console.log('User not found with uid:', userId);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('Found user:', user.email, 'Role:', user.role);
    
    // Update using the MongoDB _id, not the Firebase uid
    const updated = await User.findByIdAndUpdate(user._id, {
      fcmToken: token,
      tokenUpdatedAt: new Date()
    }, { new: true });
    
    console.log('Updated user FCM token:', updated.fcmToken ? 'Success' : 'Failed');
    console.log('=== End FCM Token Storage ===');
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error storing FCM token:', error);
    res.status(500).json({ error: 'Failed to store FCM token', details: error.message });
  }
});

// Test FCM token endpoint
app.post('/api/test-fcm', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }
    
    const message = {
      notification: {
        title: 'Test Notification',
        body: 'This is a test notification to verify FCM setup'
      },
      data: {
        type: 'test',
        timestamp: new Date().toISOString()
      },
      // Add platform-specific options
      android: {
        notification: {
          channelId: 'high_importance_channel',
          priority: 'high',
          defaultSound: true,
          defaultVibrateTimings: true
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      },
      token: token
    };
    
    const response = await admin.messaging().send(message);
    console.log('Test notification sent successfully:', response);
    
    res.status(200).json({ 
      success: true, 
      messageId: response,
      message: 'Test notification sent successfully'
    });
    
  } catch (error) {
    console.error('Test notification failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.code || error.message,
      details: error
    });
  }
});

// Enhanced admin notification endpoint
app.post('/api/notify-admins', async (req, res) => {
  try {
    const { studentName, questionPreview, type } = req.body;
    
    // Get all admin users with FCM tokens
    const User = require('./models/userModel'); 
    const admins = await User.find({ 
      role: { $regex: /^Admin$/i }, 
      fcmToken: { $exists: true, $ne: null } 
    });

    const adminTokens = admins.map(a => a.fcmToken).filter(Boolean);
    console.log('Admin tokens found:', adminTokens.length);
    
    if (adminTokens.length === 0) {
      return res.status(200).json({ message: 'No admin tokens found' });
    }
    
    // Prepare the notification with better structure
    const message = {
      notification: {
        title: `New Question from ${studentName}`,
        body: questionPreview.length > 100 
          ? `${questionPreview.substring(0, 100)}...`
          : questionPreview,
      },
      data: {
        type: 'new_question',
        payload: 'view_questions',
        timestamp: new Date().toISOString(),
        studentName: studentName
      },
      // Add Android-specific options
      android: {
        notification: {
          channelId: 'high_importance_channel',
          priority: 'high',
          defaultSound: true,
          defaultVibrateTimings: true,
          icon: 'ic_notification'
        }
      },
      // Add iOS-specific options
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            alert: {
              title: `New Question from ${studentName}`,
              body: questionPreview.length > 100 
                ? `${questionPreview.substring(0, 100)}...`
                : questionPreview,
            }
          }
        }
      },
      tokens: adminTokens
    };
    
    console.log('Sending notification to tokens:', adminTokens.map(t => t.substring(0, 20) + '...'));
    
    // Send to all admin devices
    const response = await admin.messaging().sendEachForMulticast(message);
    
    console.log(`Notification results:`, {
      successCount: response.successCount,
      failureCount: response.failureCount
    });
    
    // Log detailed results
    response.responses.forEach((resp, index) => {
      const tokenPreview = adminTokens[index].substring(0, 20) + '...';
      if (resp.success) {
        console.log(`✅ Success to ${tokenPreview}: ${resp.messageId}`);
      } else {
        console.log(`❌ Failed to ${tokenPreview}: ${resp.error?.code} - ${resp.error?.message}`);
      }
    });
    
    // Handle failed tokens - remove invalid ones
    const failedTokens = [];
    response.responses.forEach((resp, index) => {
      if (!resp.success && resp.error) {
        const errorCode = resp.error.code;
        // These error codes indicate invalid tokens that should be removed
        if (['messaging/invalid-registration-token', 
             'messaging/registration-token-not-registered',
             'messaging/invalid-argument'].includes(errorCode)) {
          failedTokens.push({
            token: adminTokens[index],
            adminId: admins[index]._id
          });
        }
      }
    });
    
    // Remove invalid tokens from database
    if (failedTokens.length > 0) {
      console.log('Removing invalid tokens:', failedTokens.length);
      for (const failed of failedTokens) {
        await User.findByIdAndUpdate(failed.adminId, {
          $unset: { fcmToken: 1, tokenUpdatedAt: 1 }
        });
      }
    }
    
    res.status(200).json({ 
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      invalidTokensRemoved: failedTokens.length
    });
    
  } catch (error) {
    console.error('Error sending admin notifications:', error);
    res.status(500).json({ 
      error: 'Failed to send notifications',
      details: error.message 
    });
  }
});

// Enhanced student notification endpoint
app.post('/api/notify-student', async (req, res) => {
  try {
    const { studentId, replyPreview, type } = req.body;
    
    const User = require('./models/userModel');
    const student = await User.findById(studentId);
    
    if (!student || !student.fcmToken) {
      return res.status(200).json({ message: 'Student token not found' });
    }
    
    const message = {
      notification: {
        title: 'New Reply from Admin',
        body: replyPreview,
      },
      data: {
        type: 'admin_reply',
        payload: 'view_replies',
        timestamp: new Date().toISOString()
      },
      // Add Android-specific options
      android: {
        notification: {
          channelId: 'high_importance_channel',
          priority: 'high',
          defaultSound: true,
          defaultVibrateTimings: true
        }
      },
      // Add iOS-specific options
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      },
      token: student.fcmToken
    };
    
    try {
      const response = await admin.messaging().send(message);
      console.log('✅ Successfully sent to student:', response);
      
      res.status(200).json({ success: true, messageId: response });
    } catch (error) {
      console.error('❌ Failed to send to student:', error);
      
      // If token is invalid, remove it
      if (['messaging/invalid-registration-token', 
           'messaging/registration-token-not-registered'].includes(error.code)) {
        await User.findByIdAndUpdate(studentId, {
          $unset: { fcmToken: 1, tokenUpdatedAt: 1 }
        });
        console.log('Removed invalid student token');
      }
      
      res.status(500).json({ 
        error: 'Failed to send notification',
        code: error.code 
      });
    }
  } catch (error) {
    console.error('Error in notify-student endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all FCM tokens for debugging
app.get('/api/fcm-tokens/debug', async (req, res) => {
  try {
    const User = require('./models/userModel');
    const users = await User.find({
      fcmToken: { $exists: true, $ne: null }
    }).select('email role fcmToken tokenUpdatedAt');
    
    const tokenInfo = users.map(user => ({
      email: user.email,
      role: user.role,
      tokenPreview: user.fcmToken ? user.fcmToken.substring(0, 20) + '...' : 'none',
      updatedAt: user.tokenUpdatedAt
    }));
    
    res.status(200).json({
      totalTokens: users.length,
      tokens: tokenInfo
    });
  } catch (error) {
    console.error('Error fetching token info:', error);
    res.status(500).json({ error: 'Failed to fetch token info' });
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