// models/productPhaseDetails.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../dbConfig'); // Adjust the path as per your configuration
const ROI = require('./roiModel'); // Adjust path as per your project structure

const ProductPhaseDetails = sequelize.define('productPhaseDetails', {
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
            model: ROI, // Reference to the ROI model
            key: 'id'   // Primary key of the ROI model
        }
    },
    deskSupport: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    deviceRefresh: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    softwareLicence: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    userProductivity: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0
        }
    }
}, {
    tableName: 'productPhaseDetails', // Optional: Define the table name explicitly
    timestamps: true // Optional: Disable timestamps if you're managing created_at in the model
});

// Define associations
ProductPhaseDetails.belongsTo(ROI, { foreignKey: 'roiId', onDelete: 'CASCADE' });

module.exports = ProductPhaseDetails;
