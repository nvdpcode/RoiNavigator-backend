const { sequelize } = require('../dbConfig'); // Import the sequelize instance from your configuration file
const Customer = require('../Models/customerModel');
const Roi = require('../Models/roiModel');
const Licence = require('../Models/licenceDetailsModel');
const log = require('../utils/logger');
const CalculationDesktopSupport = require("../Models/calculationDeskSupportModel");
const CalculationDeviceRefresh = require("../Models/calculationDeviceRefreshModel");
const LicenceCalculations = require("../Models/calculationLicenceModel");
const UserProductivityCalculations = require("../Models/calculationUserProductivityModel");
const Timeline = require("../Models/timelineModel");
const RoiBenefits = require("../Models/roiBenefitsModel");

const create = async (req, res) => {
    const {
        name, contactName, employees, eps, date, licenceTerm,
        licencePrice, addonPrice, impleandTraining, residentPs, roiName
    } = req.body;

    // Validate incoming data
    if (!name || !contactName || !roiName) {
        return res.status(400).json({ error: 'Name, contactName, and roiName are required' });
    }

    const numericFields = [employees, eps, licenceTerm, licencePrice, addonPrice, impleandTraining, residentPs];
    for (const field of numericFields) {
        if (field === undefined || isNaN(field) || field < 0 || field ==="" ) {
            return res.status(400).json({ error: 'All numeric fields must be non-negative numbers' });
        }
    }

    const transaction = await sequelize.transaction();
    try {
        const values = {
            employees,
            eps: employees * eps,
            date,
            licenceTerm,
            licencePrice,
            addonPrice,
            impleandTraining,
            residentPs
        };

        const existingCustomer = await Customer.findOne({ where: { name }, transaction });
        let roiId;

        if (existingCustomer) {
            await existingCustomer.update({ name, contactName }, { transaction });
            const existingRoi = await Roi.findOne({ where: { custId: existingCustomer.custId }, transaction });
            const roi = await existingRoi.update({ name: roiName, custId: existingCustomer.custId }, { transaction });
            roiId = roi.id;

            await Licence.update({ ...values, custId: existingCustomer.custId, roiId: roi.id }, { where: { custId: existingCustomer.custId }, transaction });

            await Promise.all([
                CalculationDesktopSupport.destroy({ where: { roiId }, transaction }),
                CalculationDeviceRefresh.destroy({ where: { roiId }, transaction }),
                LicenceCalculations.destroy({ where: { roiId }, transaction }),
                UserProductivityCalculations.destroy({ where: { roiId }, transaction }),
                Timeline.destroy({ where: { roiId }, transaction }),
                RoiBenefits.destroy({ where: { roiId }, transaction })
            ]);

            log.info('Customer info updated successfully.');
        } else {
            const customer = await Customer.create({ name, contactName }, { transaction });
            const roi = await Roi.create({ name: roiName, custId: customer.custId }, { transaction });
            roiId = roi.id;
            await Licence.create({ ...values, custId: customer.custId, roiId: roi.id }, { transaction });

            log.info('Customer information successfully saved.');
        }
        await transaction.commit();
        return res.status(200).json({ message: 'Customer information saved successfully', roiId });
    } catch (error) {
        await transaction.rollback();
        log.error('Error creating/updating Customer:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    create
};
