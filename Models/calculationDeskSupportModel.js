// models/CalculationDesktopSupport.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../dbConfig');
const ROI = require('../Models/roiModel');

const CalculationDesktopSupport = sequelize.define('CalculationDesktopSupport', {
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
  level: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  noOfTickets: {
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
  noOfTicketsAlluvino: {
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
  timestamps: true,
  tableName: 'calculationDesktopSupport',
  indexes: [
    {
      unique: true,
      fields: ['Date', 'level']
    }
  ]
  // Specify table name if different from model name
});

CalculationDesktopSupport.belongsTo(ROI, { foreignKey: 'roiId' });

module.exports = CalculationDesktopSupport;
