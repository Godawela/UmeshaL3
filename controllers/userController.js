const userService = require("../services/userService");
const mailService = require("../services/mailService");

const createUser = async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body); // Create the user first
    const admin_email = "medflowa@gmail.com"; // Get the admin email from environment variables
    if (newUser.role === "student") {
      console.log("User role is student");
      await mailService.sendEmail(
        admin_email,
        `A new student has registered with the name ${newUser.name}`
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

module.exports = {
  createUser,
  getAllUsers,
  updateUser,
  getUserByUid,
  getUserRoleByUid,
};
