const { sequelize } = require('../dbConfig'); // Import the sequelize instance from your configuration file
const Customer = require('../Models/customerModel');
const Roi = require('../Models/roiModel');
const Licence = require('../Models/licenceDetailsModel');
const log = require('../utils/logger');

const create = async (req, res) => {
    const {
        name, contactName, employees, eps, date, licenceTerm,
        licencePrice, addonPrice, impleandTraining, residentPs, roiName
    } = req.body;

    const transaction = await sequelize.transaction();
    try {
        let existingCustomer = await Customer.findOne({ where: { name }, transaction });
        if (existingCustomer) {
            await existingCustomer.update({ name, contactName }, { transaction });
            const existingRoi = await Roi.findOne({ where: { custId: existingCustomer.custId }, transaction });
            const roi = await existingRoi.update({ name: roiName, custId: existingCustomer.custId }, { transaction });
            await Licence.update({
                custId: existingCustomer.custId,
                roiId: roi.id,
                employees,
                eps: employees * eps,
                date,
                licenceTerm,
                licencePrice,
                addonPrice,
                impleandTraining,
                residentPs
            }, { where: { custId: existingCustomer.custId }, transaction });

            await transaction.commit();
            log.info('Customer info updated successfully.');
            return res.status(200).json({ message: 'Customer info Updated' });
        } else {
            const customer = await Customer.create({ name, contactName }, { transaction });
            const roi = await Roi.create({ name: roiName, custId: customer.custId }, { transaction });
            await Licence.create({
                custId: customer.custId,
                roiId: roi.id,
                employees,
                eps: employees * eps,
                date,
                licenceTerm,
                licencePrice,
                addonPrice,
                impleandTraining,
                residentPs
            }, { transaction });

            await transaction.commit();
            log.info('Customer information successfully saved.');
            return res.status(200).json({ message: 'Customer information successfully saved', roiId: roi.id });
        }
    } catch (error) {
        await transaction.rollback();
        log.error('Error creating/updating Customer:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    create
};
