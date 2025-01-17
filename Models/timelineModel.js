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
    allowNull: false,
    references: {
      model: 'roi',
      key: 'id'
    }
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
    allowNull: true
  },
  Year2: {
    type: DataTypes.JSON,
    allowNull: true
  },
  Year3: {
    type: DataTypes.JSON,
    allowNull: true
  },
  Year4: {
    type: DataTypes.JSON,
    allowNull: true
  },
  Year5: {
    type: DataTypes.JSON,
    allowNull: true
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  value: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue:null
  },
}, {
  // Other options
  timestamps: true, // Disable timestamps (createdAt, updatedAt)
  tableName: 'calculationTimeline' // Specify table name if different from model name
});

module.exports = CalculationTimeline;
