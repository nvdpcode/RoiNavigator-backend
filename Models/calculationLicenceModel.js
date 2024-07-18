// models/CalculationDesktopSupport.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../dbConfig'); // Adjust the path as per your configuration
const ROI = require('../Models/roiModel');

const CalculationLicence = sequelize.define('CalculationLicence', {
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
  noOfUsers: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  costOfSoftwareAlluvio: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  costOfSoftware: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  costPerAnnum: {
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
  },
}, {
  // Other options
  timestamps: true,
  tableName: 'calculationLicence',
  indexes: [
    {
      unique: true,
      fields: ['roiId', 'Date']
    }
  ]
});

CalculationLicence.belongsTo(ROI, { foreignKey: 'roiId' });

module.exports = CalculationLicence;
