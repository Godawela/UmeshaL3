const userService = require("../services/userService");
const mailService = require("../services/mailService");
const crypto = require("crypto");

const createUser = async (req, res) => {
  try {
    const newUser = await userService.createUser({
      ...req.body,
      verified: false, // set as unverified by default
    });

    const admin_email = "medflowa@gmail.com";

    // Send admin email for all new registrations (not just students)
    console.log(`New user registered with role: ${newUser.role}`);

    // Create verification token 
    const token = crypto.randomBytes(32).toString("hex");
    const verifyLink = `https://medflow-phi.vercel.app/api/users/verify/${newUser.uid}/${token}`;

    // Save token to database
    await userService.saveVerificationToken(newUser.uid, token);

    // Send email to admin
    await mailService.sendEmail(
      admin_email,
      `New User Registration - ${newUser.role}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New User Registration</h2>
          <p>A new user has registered and requires admin approval:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Name:</strong> ${newUser.name}</p>
            <p><strong>Email:</strong> ${newUser.email}</p>
            <p><strong>Role:</strong> ${newUser.role}</p>
            <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>Please click the button below to approve this user:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyLink}" 
               style="background-color: #4CAF50; color: white; padding: 12px 25px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              ✓ Approve User
            </a>
          </div>
          
          <p style="color: #666; font-size: 12px;">
            This verification link will expire in 24 hours.
          </p>
        </div>
      `
    );

    console.log(`Verification email sent to admin for user: ${newUser.email}`);

    res.status(200).json({
      success: true,
      message: "User created successfully. Verification email sent to admin.",
      user: {
        uid: newUser.uid,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        verified: newUser.verified
      }
    });

  } catch (err) {
    console.error("Error in createUser:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to create user",
      details: err.message 
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { uid } = req.params;
    const updatedUser = await userService.updateUser(uid, req.body);
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

const getUserByUid = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await userService.getUserByUid(uid);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

const getUserRoleByUid = async (req, res) => {
  try {
    const { uid } = req.params;

    const user = await userService.getUserByUid(uid);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ role: user.role });
  } catch (err) {
    console.error("Error fetching user role:", err);
    res.status(500).json({ error: "Failed to fetch user role" });
  }
};

const verifyUser = async (req, res) => {
  try {
    const { uid, token } = req.params;

    const isValid = await userService.verifyUser(uid, token);
    if (!isValid) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #e74c3c;">❌ Verification Failed</h2>
            <p>Invalid or expired verification link.</p>
            <p>Please contact support if you believe this is an error.</p>
          </body>
        </html>
      `);
    }

    // Get user details for confirmation email
    const user = await userService.getUserByUid(uid);
    
    // Send confirmation email to the user
    if (user) {
      try {
        await mailService.sendEmail(
          user.email,
          "Account Approved - Welcome to MedFlow!",
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4CAF50;">🎉 Account Approved!</h2>
              <p>Hello ${user.name},</p>
              
              <p>Great news! Your account has been approved by our admin team.</p>
              
              <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>You can now log in to your account using:</strong></p>
                <p>Email: ${user.email}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://your-app-url.com/login" 
                   style="background-color: #4CAF50; color: white; padding: 12px 25px; 
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                  🚀 Login to Your Account
                </a>
              </div>
              
              <p>Welcome to MedFlow!</p>
              
              <p style="color: #666; font-size: 12px;">
                If you have any questions, please don't hesitate to contact our support team.
              </p>
            </div>
          `
        );
      } catch (emailError) {
        console.error("Error sending confirmation email to user:", emailError);
        // Continue even if email fails - user is still verified
      }
    }

    res.status(200).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #4CAF50;">✅ User Verified Successfully!</h2>
          <p>The user <strong>${user?.email}</strong> has been approved and can now log in.</p>
          <p style="color: #666;">A confirmation email has been sent to the user.</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("Error in verifyUser:", err);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #e74c3c;">❌ Server Error</h2>
          <p>Failed to verify user. Please try again later.</p>
        </body>
      </html>
    `);
  }
};

module.exports = {
  createUser,
  getAllUsers,
  updateUser,
  getUserByUid,
  getUserRoleByUid,
  verifyUser
};