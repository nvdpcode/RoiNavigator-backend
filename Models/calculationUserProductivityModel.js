// models/CalculationDesktopSupport.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../dbConfig'); // Adjust the path as per your configuration

const CalcUserProductivity = sequelize.define('CalcUserProductivity', {
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
  waitTimeHrs: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  waitTimeHrsAlluvio: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  costPerHour: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  costPerHourAlluvio: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  costPerAnnum: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  costPerAnnumAlluvio: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  savingsPerAnnum: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
}, {
  // Other options
  timestamps: false, // Disable timestamps (createdAt, updatedAt)
  tableName: 'calcUserProductivity' // Specify table name if different from model name
});

module.exports = CalcUserProductivity;
