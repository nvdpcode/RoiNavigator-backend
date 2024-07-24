// models/CalculationDesktopSupport.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../dbConfig');
const ROI = require('../Models/roiModel');

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
    allowNull: false,
    references: {
      model: 'roi',
      key: 'id'
    }
  },
  Date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  noOfDevices: {
    type: DataTypes.FLOAT,
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
    type: DataTypes.FLOAT,
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
  timestamps: true, // Disable timestamps (createdAt, updatedAt)
  tableName: 'calculationDeviceRefresh', // Specify table name if different from model name
  indexes: [
    {
      unique: true,
      fields: ['roiId', 'Date']
    }
  ]
});
CalculationDeviceRefresh.belongsTo(ROI, { foreignKey: 'roiId' });

module.exports = CalculationDeviceRefresh;
