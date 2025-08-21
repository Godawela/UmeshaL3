const User = require('../models/userModel');

const createUser = async (userData) => {
  const existingUser = await User.findOne({ uid: userData.uid });
  if (existingUser) {
    return existingUser;
  }
  const newUser = new User(userData);
  return await newUser.save();
};

const getAllUsers = async () => {
  return await User.find();
};

const updateUser = async (uid, updateData) => {
  return await User.findOneAndUpdate({ uid }, updateData, { new: true });
};

//get user by uid
const getUserByUid = async (uid) => {
  return await User.findOne({ uid });
}

//get user role by uid
const getUserRoleByUid = async (uid) => {
  return await User.findOne({ uid }, { role: 1, _id: 0 });
};

const saveVerificationToken = async (uid, token) => {
  return await User.findOneAndUpdate({ uid }, { verificationToken: token });
};

const verifyUser = async (uid, token) => {
  const user = await User.findOne({ uid, verificationToken: token });
  if (!user) return false;

  user.verified = true;
  user.verificationToken = undefined; // clear token
  await user.save();
  return true;
};

const deleteUser = async (uid) => {
  try {
    return await User.findOneAndDelete({ uid: uid });
  } catch (error) {
    throw new Error(`Error deleting user: ${error.message}`);
  }
};

module.exports = {
  createUser,
  getAllUsers,
  updateUser,
  getUserByUid,
  getUserRoleByUid,
  saveVerificationToken,
  verifyUser,
  deleteUser
};
