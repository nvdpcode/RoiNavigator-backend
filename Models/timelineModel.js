const { DataTypes } = require('sequelize');
const { sequelize } = require('../dbConfig'); // Adjust the path as per your configuration

const CalculationTimeline = sequelize.define('CalculationTimeline', {
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
  parameter:{
    type: DataTypes.STRING,
    allowNull: false
  },
  Year0: {
    type: DataTypes.JSON,
    allowNull: false
  },
  Year1: {
    type: DataTypes.JSON,
    allowNull: false
  },
  Year2: {
    type: DataTypes.JSON,
    allowNull: false
  },
  Year3: {
    type: DataTypes.JSON,
    allowNull: false
  },
  Year4: {
    type: DataTypes.JSON,
    allowNull: false
  },
  Year5: {
    type: DataTypes.JSON,
    allowNull: false
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  value: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
}, {
  // Other options
  timestamps: false, // Disable timestamps (createdAt, updatedAt)
  tableName: 'calculationTimeline' // Specify table name if different from model name
});

module.exports = CalculationTimeline;
