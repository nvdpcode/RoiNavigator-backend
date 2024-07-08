// models/CalculationDesktopSupport.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../dbConfig'); // Adjust the path as per your configuration

const CalculationDeviceRefresh = sequelize.define('CalculationDeviceRefresh', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  roiId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  noOfDevices: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cost: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  costPerAnnum: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  noOfDevicesAlluvino: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  costAlluvino: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  costPerAnnumAlluvino: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  savingsPerAnnum: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  // Other options
  timestamps: false, // Disable timestamps (createdAt, updatedAt)
  tableName: 'calculationDeviceRefresh' // Specify table name if different from model name
});

module.exports = CalculationDeviceRefresh;
