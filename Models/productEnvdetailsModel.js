// models/ProductEnvDetails.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../dbConfig');
const ROI = require('../Models/roiModel');

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
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  l2TicketCost: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  l3TicketCost: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  noOfL1Tickets: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  noOfL2Tickets: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  noOfL3Tickets: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  percentDeskSupportTicket: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  cost: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  hardwareRefresh: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  costPerUser: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  waitTime: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  avgTimeSpent: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  hourlyPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'productEnvDetails',
  timestamps: true
});

// Define associations
ProductEnvDetails.belongsTo(ROI, { foreignKey: 'roiId', onDelete: 'CASCADE' });

module.exports = ProductEnvDetails;
