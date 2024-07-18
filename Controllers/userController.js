// controllers/userController.js

const User = require('../Models/userModel');
const {sequelize} = require('../dbConfig');
const bcrypt = require('bcrypt');
const log = require('../utils/logger');

const createUser = async (req, res) => {
  const { username, email,password } = req.body;
  const transaction = await sequelize.transaction();
  try {
    const existingUser = await User.findOne({ where: { email },transaction });
    if (existingUser) {
      await transaction.commit();
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ username, email,password:hashedPassword });
    await transaction.commit();

    return res.status(200).json({ message: 'User created successfully' });
  } catch (error) {
    log.error('Error creating user \n', error);
    await transaction.rollback();
    return res.status(500).json({ error: 'Error creating user' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    log.info(`User logged in successfully: ${email}`);
    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    log.error('Error logging in: \n ', error);
    return res.status(500).json({ error: 'Error logging in' });
  }
};

module.exports = {
  createUser,
  loginUser
};
