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

    // Send simple email to admin
    await mailService.sendEmail(
      admin_email,
      `New User Registration - Approval Required`,
      `
        New User Registration:
        
        Name: ${newUser.name}
        Email: ${newUser.email}
        Role: ${newUser.role}
        Registration Date: ${new Date().toLocaleDateString()}
        
        Click to approve: ${verifyLink}
        
        This verification link will expire in 24 hours.
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
            Hello ${user.name},
            
            Great news! Your account has been approved by our admin team.
            
            You can now log in to your account using:
            Email: ${user.email}
            
            Welcome to MedFlow!
            
            If you have any questions, please contact our support team.
          `
        );
      } catch (emailError) {
        console.error("Error sending confirmation email to user:", emailError);
        // Continue even if email fails - user is still verified
      }
    }

    res.status(200).send(`
      <html>
        <head>
          <title>User Verified</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .success { color: #4CAF50; font-size: 24px; margin-bottom: 20px; }
            .email { color: #333; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✅ User Verified Successfully!</div>
            <p>The user <span class="email">${user?.email}</span> has been approved and can now log in.</p>
            <p style="color: #666;">A confirmation email has been sent to the user.</p>
          </div>
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

const deleteUser = async (req, res) => {
  try {
    const { uid } = req.params;
    const deletedUser = await userService.deleteUser(uid);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  updateUser,
  getUserByUid,
  getUserRoleByUid,
  verifyUser,
  deleteUser
};