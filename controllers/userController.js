const userService = require("../services/userService");
const mailService = require("../services/mailService");

const createUser = async (req, res) => {
  try {
    const newUser = await userService.createUser({
      ...req.body,
      verified: false, // set as unverified by default
    });

    const admin_email = "medflowa@gmail.com";

    if (newUser.role === "student") {
      console.log("User role is student");

      // Create verification token (can also save in DB if needed)
      const token = crypto.randomBytes(32).toString("hex");
      const verifyLink = `https://medflow-phi.vercel.app/api/users/verify/${newUser.uid}/${token}`;

      // Save token temporarily in DB or Redis (simplest way: add token field in user doc)
      await userService.saveVerificationToken(newUser.uid, token);

      await mailService.sendEmail(
        admin_email,
        `A new student has registered.`,
        `
          A new student has registered with:
          <br>Name: ${newUser.name} 
          <br>Email: ${newUser.email} 
          <br><br>
          Please click the link below to verify:
          <br><a href="${verifyLink}">Verify User</a>
        `
      );
    }

    res.status(200).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
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

//get user by uid
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

// Get user role by UID
const getUserRoleByUid = async (req, res) => {
  try {
    const { uid } = req.params;

    const user = await userService.getUserByUid(uid);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return role in a JSON object
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
      return res.status(400).json({ error: "Invalid or expired verification link" });
    }

    res.status(200).send("User verified successfully. They can now log in.");
  } catch (err) {
    res.status(500).json({ error: "Failed to verify user" });
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
