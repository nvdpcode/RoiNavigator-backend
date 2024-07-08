const { DataTypes } = require('sequelize');
const {sequelize} = require('../dbConfig'); // Adjust the path as per your configuration
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
        type: DataTypes.INTEGER
      },
      eps: {
        type: DataTypes.INTEGER
      },
      date: {
        type: DataTypes.DATEONLY // Use DATEONLY for date without time
      },
      licenceTerm: {
        type: DataTypes.INTEGER
      },
      licencePrice: {
        type: DataTypes.FLOAT
      },
      addonPrice: {
        type: DataTypes.FLOAT
      },
      impleandTraining: {
        type: DataTypes.FLOAT
      },
      residentPs: {
        type: DataTypes.FLOAT
      }
}, {
  // Other options
  timestamps: true, // Disable timestamps (createdAt, updatedAt)
  tableName: 'licenceDetails' // Specify table name if different from model name
});

Licence.belongsTo(ROI, { foreignKey: 'roiId', onDelete: 'CASCADE' });
Licence.belongsTo(Customer, { foreignKey: 'custId', onDelete: 'CASCADE' });

module.exports = Licence;