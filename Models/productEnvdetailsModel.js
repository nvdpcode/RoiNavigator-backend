// models/ProductEnvDetails.js

const { DataTypes } = require('sequelize');
const {sequelize} = require('../dbConfig'); // Adjust path as per your project structure
const ROI = require('../Models/roiModel'); // Import the ROI model

const ProductEnvDetails = sequelize.define('ProductEnvDetails', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  roiId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: ROI,
      key: 'id'
    }
  },
  l1TicketCost: {
    type: DataTypes.FLOAT
  },
  l2TicketCost: {
    type: DataTypes.FLOAT
  },
  l3TicketCost: {
    type: DataTypes.FLOAT
  },
  noOfL1Tickets: {
    type: DataTypes.FLOAT
  },
  noOfL2Tickets: {
    type: DataTypes.FLOAT
  },
  noOfL3Tickets: {
    type: DataTypes.FLOAT
  },
  percentDeskSupportTicket: {
    type: DataTypes.FLOAT
  },
  cost: {
    type: DataTypes.FLOAT
  },
  hardwareRefresh: {
    type: DataTypes.FLOAT
  },
  costPerUser: {
    type: DataTypes.FLOAT
  },
  waitTime: {
    type: DataTypes.FLOAT
  },
  avgTimeSpent: {
    type: DataTypes.FLOAT
  },
  hourlyPrice: {
    type: DataTypes.FLOAT
  }
}, {
  tableName: 'productEnvDetails', 
  timestamps: false
});

// Define associations
ProductEnvDetails.belongsTo(ROI, { foreignKey: 'roiId', onDelete: 'CASCADE' });


module.exports = ProductEnvDetails;
