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

// Initialize Firebase Admin with better error handling
const admin = require('firebase-admin');

// Check if Firebase is already initialized
if (!admin.apps.length) {
  try {
    // Method 1: Try using service account key file if available
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('Using service account key file...');
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    } 
    // Method 2: Use environment variables with proper key formatting
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      console.log('Using environment variables...');
      
      // Fix the private key formatting
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      // Handle different private key formats
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }
      
      // Ensure proper BEGIN/END format
      if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        throw new Error('Invalid private key format - missing BEGIN marker');
      }
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    }
    // Method 3: Parse JSON string if provided as single env var
    else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.log('Using service account JSON string...');
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    else {
      throw new Error('No Firebase credentials found in environment variables');
    }
    
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    process.exit(1); // Exit if Firebase can't be initialized
  }
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
// app.post('/api/test-fcm', async (req, res) => {
//   try {
//     const { token } = req.body;
    
//     if (!token) {
//       return res.status(400).json({ error: 'Token required' });
//     }
    
//     // Validate token format
//     if (typeof token !== 'string' || token.length < 50) {
//       return res.status(400).json({ error: 'Invalid token format' });
//     }
    
//     const message = {
//       notification: {
//         title: 'Test Notification',
//         body: 'This is a test notification to verify FCM setup'
//       },
//       data: {
//         type: 'test',
//         timestamp: new Date().toISOString()
//       },
//       // Add platform-specific options
//       android: {
//         notification: {
//           channelId: 'high_importance_channel',
//           priority: 'high',
//           defaultSound: true,
//           defaultVibrateTimings: true
//         }
//       },
//       apns: {
//         payload: {
//           aps: {
//             sound: 'default',
//             badge: 1
//           }
//         }
//       },
//       token: token
//     };
    
//     console.log('Sending test notification to token:', token.substring(0, 20) + '...');
//     const response = await admin.messaging().send(message);
//     console.log('Test notification sent successfully:', response);
    
//     res.status(200).json({ 
//       success: true, 
//       messageId: response,
//       message: 'Test notification sent successfully'
//     });
    
//   } catch (error) {
//     console.error('Test notification failed:', error);
    
//     // Handle specific FCM errors
//     let errorMessage = error.message;
//     if (error.code === 'messaging/invalid-registration-token') {
//       errorMessage = 'Invalid FCM token - token may be expired or malformed';
//     } else if (error.code === 'messaging/registration-token-not-registered') {
//       errorMessage = 'FCM token not registered - app may have been uninstalled';
//     } else if (error.code === 'app/invalid-credential') {
//       errorMessage = 'Firebase credentials are invalid - check service account setup';
//     }
    
//     res.status(500).json({ 
//       success: false, 
//       error: error.code || 'unknown-error',
//       message: errorMessage,
//       details: error.message
//     });
//   }
// });

// Enhanced admin notification endpoint
app.post('/api/notify-admins', async (req, res) => {
  try {
    const { studentName, questionPreview, type } = req.body;
    
    if (!studentName || !questionPreview) {
      return res.status(400).json({ error: 'studentName and questionPreview are required' });
    }
    
    // Get all admin users with FCM tokens
    const User = require('./models/userModel'); 
    const admins = await User.find({ 
      role: { $regex: /^Admin$/i }, 
      fcmToken: { $exists: true, $ne: null } 
    });

    const adminTokens = admins.map(a => a.fcmToken).filter(Boolean);
    console.log('Admin tokens found:', adminTokens.length);
    
    if (adminTokens.length === 0) {
      return res.status(200).json({ 
        success: true,
        message: 'No admin tokens found',
        successCount: 0,
        failureCount: 0 
      });
    }
    
    // Validate tokens
    const validTokens = adminTokens.filter(token => 
      typeof token === 'string' && token.length > 50
    );
    
    if (validTokens.length === 0) {
      return res.status(200).json({ 
        success: true,
        message: 'No valid admin tokens found',
        successCount: 0,
        failureCount: adminTokens.length 
      });
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
      tokens: validTokens
    };
    
    console.log('Sending notification to tokens:', validTokens.map(t => t.substring(0, 20) + '...'));
    
    // Send to all admin devices
    const response = await admin.messaging().sendEachForMulticast(message);
    
    console.log(`Notification results:`, {
      successCount: response.successCount,
      failureCount: response.failureCount
    });
    
    // Log detailed results
    response.responses.forEach((resp, index) => {
      const tokenPreview = validTokens[index].substring(0, 20) + '...';
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
          
          // Find the admin with this token
          const tokenToRemove = validTokens[index];
          const adminToUpdate = admins.find(admin => admin.fcmToken === tokenToRemove);
          
          if (adminToUpdate) {
            failedTokens.push({
              token: tokenToRemove,
              adminId: adminToUpdate._id
            });
          }
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
      invalidTokensRemoved: failedTokens.length,
      totalTokensProcessed: validTokens.length
    });
    
  } catch (error) {
    console.error('Error sending admin notifications:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to send notifications',
      message: error.message,
      code: error.code || 'unknown-error'
    });
  }
});

// Enhanced student notification endpoint
// Enhanced student notification endpoint - CORRECTED VERSION
app.post('/api/notify-student', async (req, res) => {
  try {
    const { studentId, replyPreview, type } = req.body;
    
    if (!studentId || !replyPreview) {
      return res.status(400).json({ error: 'studentId and replyPreview are required' });
    }
    
    const User = require('./models/userModel');
    
    // IMPORTANT: Find by Firebase UID, not MongoDB _id
    // Your studentId from questions table is the Firebase UID
    const student = await User.findOne({ uid: studentId }); // Changed from findById to findOne with uid
    
    if (!student) {
      console.log(`Student not found with Firebase UID: ${studentId}`);
      return res.status(404).json({ error: 'Student not found' });
    }
    
    if (!student.fcmToken) {
      console.log(`No FCM token found for student: ${student.email}`);
      return res.status(200).json({ 
        success: true,
        message: 'Student token not found' 
      });
    }
    
    // Validate token
    if (typeof student.fcmToken !== 'string' || student.fcmToken.length < 50) {
      console.log(`Invalid token format for student: ${student.email}`);
      return res.status(200).json({ 
        success: true,
        message: 'Invalid student token format' 
      });
    }
    
    const message = {
      notification: {
        title: 'New Reply from Admin',
        body: replyPreview.length > 100 
          ? `${replyPreview.substring(0, 100)}...`
          : replyPreview,
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
      console.log('Sending notification to student:', student.email);
      const response = await admin.messaging().send(message);
      console.log('Successfully sent to student:', response);
      
      res.status(200).json({ 
        success: true, 
        messageId: response,
        message: 'Notification sent successfully'
      });
    } catch (error) {
      console.error('Failed to send to student:', error);
      
      // If token is invalid, remove it
      if (['messaging/invalid-registration-token', 
           'messaging/registration-token-not-registered'].includes(error.code)) {
        await User.findOneAndUpdate(
          { uid: studentId }, // Changed to use uid instead of _id
          { $unset: { fcmToken: 1, tokenUpdatedAt: 1 } }
        );
        console.log('Removed invalid student token');
      }
      
      res.status(500).json({ 
        success: false,
        error: 'Failed to send notification',
        code: error.code,
        message: error.message
      });
    }
  } catch (error) {
    console.error('Error in notify-student endpoint:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
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
      tokenValid: user.fcmToken && typeof user.fcmToken === 'string' && user.fcmToken.length > 50,
      updatedAt: user.tokenUpdatedAt
    }));
    
    res.status(200).json({
      totalTokens: users.length,
      validTokens: tokenInfo.filter(t => t.tokenValid).length,
      tokens: tokenInfo
    });
  } catch (error) {
    console.error('Error fetching token info:', error);
    res.status(500).json({ error: 'Failed to fetch token info' });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test Firebase connection
    const testMessage = {
      data: { test: 'health-check' },
      topic: 'health-check-topic'
    };
    
    await admin.messaging().send({
      ...testMessage,
      dryRun: true
    });
    
    res.status(200).json({
      status: 'healthy',
      firebase: 'connected',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      firebase: 'error',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
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

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});

module.exports = app;