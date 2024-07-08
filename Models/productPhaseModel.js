// models/productPhaseDetails.js

const { DataTypes } = require('sequelize');
const {sequelize} = require('../dbConfig'); // Adjust the path as per your configuration
const ROI = require('./roiModel'); // Adjust path as per your project structure

const productPhaseDetails = sequelize.define('productPhaseDetails', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
        type: DataTypes.FLOAT
    },
    deviceRefresh: {
        type: DataTypes.FLOAT
    },
    softwareLicence: {
        type: DataTypes.FLOAT
    },
    userProductivity: {
        type: DataTypes.FLOAT
    }
}, {
    tableName: 'productPhaseDetails', // Optional: Define the table name explicitly
    timestamps: false // Optional: Disable timestamps if you're managing created_at in the model
});

// Define associations
productPhaseDetails.belongsTo(ROI, { foreignKey: 'roiId', onDelete: 'CASCADE' });

module.exports = productPhaseDetails;
