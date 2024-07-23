// models/licenceDetailsModel.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../dbConfig'); // Adjust the path as per your configuration
const ROI = require('../Models/roiModel'); 
const Customer = require('../Models/customerModel'); 

const Licence = sequelize.define('licence', {
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
            model: ROI, // Reference to the ROI model
            key: 'id'   // Primary key of the ROI model
        }
    },
    custId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: Customer, // Reference to the ROI model
            key: 'custId' // Primary key of the ROI model
        }
    },
    employees: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 0
        }
    },
    eps: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 0
        }
    },
    date: {
        type: DataTypes.DATEONLY, // Use DATEONLY for date without time
        allowNull: false
    },
    licenceTerm: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 0
        }
    },
    licencePrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    addonPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    impleandTraining: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    residentPs: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0
        }
    }
}, {
    // Other options
    timestamps: true, // Disable timestamps (createdAt, updatedAt)
    tableName: 'licenceDetails' // Specify table name if different from model name
});

Licence.belongsTo(ROI, { foreignKey: 'roiId', onDelete: 'CASCADE' });
Licence.belongsTo(Customer, { foreignKey: 'custId', onDelete: 'CASCADE' });

module.exports = Licence;
