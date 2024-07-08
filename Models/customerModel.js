// models/Customer.js

const { DataTypes } = require('sequelize');
const {sequelize} = require('../dbConfig'); // Adjust the path as per your configuration
//const ROI = require('../Models/roiModel')

const Customer = sequelize.define('customer', {
  custId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contactName: {
    type: DataTypes.STRING
  },
}, {
  // Other options
  timestamps: true, // Disable timestamps (createdAt, updatedAt)
  tableName: 'customer' // Specify table name if different from model name
});

module.exports = Customer;
