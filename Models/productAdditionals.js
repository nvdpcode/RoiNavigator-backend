// models/productAdditionals.js

const { DataTypes } = require('sequelize');
const {sequelize} = require('../dbConfig'); // Adjust the path as per your configuration
const ROI = require('../Models/roiModel'); // Adjust path as per your project structure

const productAdditionals = sequelize.define('productAdditionals', {
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
        unique: true,
        references: {
          model: ROI,
          key: 'id'
        }
    },
    mttr: {
        type: DataTypes.JSON
    },
    desktopSupportTickets: {
        type: DataTypes.JSON
    },
    refresh: {
        type: DataTypes.FLOAT
    },
    software: {
        type: DataTypes.FLOAT
    },
    waitTime: {
        type: DataTypes.FLOAT
    },
}, {
    tableName: 'productAdditionals', // Optional: Define the table name explicitly
    timestamps: true // Optional: Disable timestamps if you're managing created_at in the model
});

// Define the association with ROI
productAdditionals.belongsTo(ROI, { foreignKey: 'roiId', onDelete: 'CASCADE' });

module.exports = productAdditionals;
