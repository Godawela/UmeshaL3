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


module.exports = {
  createUser,
  getAllUsers,
  updateUser,
  getUserByUid,
  getUserRoleByUid
};
