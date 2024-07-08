// controllers/userController.js

const User = require('../Models/userModel');

const createUser = async (req, res) => {
  const { username, email,password } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    await User.create({ username, email,password });
    return res.status(200).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Error creating user' });
  }
};

module.exports = {
  createUser
};
