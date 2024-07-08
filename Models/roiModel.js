// models/ROI.js

const { DataTypes } = require('sequelize');
const {sequelize} = require('../dbConfig'); // Adjust the path as per your configuration
const Customer = require('../Models/customerModel'); // Import Customer model for association

const ROI = sequelize.define('roi', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  custId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'customer',
      key: 'custId'
    }
  }
}, {
  timestamps: false, // Disable timestamps (createdAt, updatedAt)
  tableName: 'roi' // Specify table name if different from model name
});

ROI.belongsTo(Customer, { foreignKey: 'custId' });

module.exports = ROI;
