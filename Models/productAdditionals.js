// models/productAdditionals.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../dbConfig'); 
const ROI = require('../Models/roiModel');

const ProductAdditionals = sequelize.define('productAdditionals', {
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
        type: DataTypes.JSON,
        allowNull: true,
        validate: {
            isValidJSON(value) {
                if (value && typeof value !== 'object') {
                    throw new Error('MTTR must be a valid JSON object');
                }
            }
        }
    },
    desktopSupportTickets: {
        type: DataTypes.JSON,
        allowNull: true,
        validate: {
            isValidJSON(value) {
                if (value && typeof value !== 'object') {
                    throw new Error('Desktop Support Tickets must be a valid JSON object');
                }
            }
        }
    },
    refresh: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: { 
            min: 0
        }
    },
    software: {
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
}, {
    tableName: 'productAdditionals', // Optional: Define the table name explicitly
    timestamps: true // Optional: Disable timestamps if you're managing created_at in the model
});

// Define the association with ROI
ProductAdditionals.belongsTo(ROI, { foreignKey: 'roiId', onDelete: 'CASCADE' });

module.exports = ProductAdditionals;
