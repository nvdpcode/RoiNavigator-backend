// models/User.js

const { DataTypes } = require('sequelize');
const {sequelize} = require('../dbConfig');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  // options
  // tableName: 'users', // optional: default is 'Users'
  // timestamps: true, // optional: default is true
  // underscored: true, // optional: converts camelCase to snake_case for column names
});

module.exports = User;
