const ProductEnvDetails = require('../Models/productEnvdetailsModel')
const ProductAdditionals = require('../Models/productAdditionals')
const ProductPhaseDetails = require('../Models/productPhaseModel')
const {sequelize} = require('../dbConfig');
const log = require('../utils/logger');
const CalculationDesktopSupport = require("../Models/calculationDeskSupportModel");
const CalculationDeviceRefresh = require("../Models/calculationDeviceRefreshModel");
const LicenceCalculations = require("../Models/calculationLicenceModel");
const UserProductivityCalculations = require("../Models/calculationUserProductivityModel");
const Timeline = require("../Models/timelineModel")
const RoiBenefits = require("../Models/roiBenefitsModel")


const addProductEnvDetails = async (req, res) => {
    const {
        roiId, l1TicketCost, l2TicketCost, l3TicketCost,
        noOfL1Tickets, noOfL2Tickets, noOfL3Tickets,
        percentDeskSupportTicket, cost, hardwareRefresh,
        costPerUser, waitTime, avgTimeSpent, hourlyPrice
    } = req.body;

    // Validate incoming data
    if (!roiId || isNaN(roiId) || roiId <= 0) {
        return res.status(400).json({ error: 'Invalid roiId' });
    }

    const fields = [
        l1TicketCost, l2TicketCost, l3TicketCost, noOfL1Tickets,
        noOfL2Tickets, noOfL3Tickets, percentDeskSupportTicket, cost,
        hardwareRefresh, costPerUser, waitTime, avgTimeSpent, hourlyPrice
    ];

    for (const field of fields) {
        if (field === undefined || isNaN(field) || field < 0 || field=="") {
            return res.status(400).json({ error: 'Invalid input: all numeric fields must be non-negative numbers' });
        }
    }

    if (percentDeskSupportTicket > 100) {
        return res.status(400).json({ error: 'Percentage DeskSupport Ticket must be between 0 and 100' });
    }

    const transaction = await sequelize.transaction();

    try {
        const values = {
            l1TicketCost, l2TicketCost, l3TicketCost,
            noOfL1Tickets, noOfL2Tickets, noOfL3Tickets,
            percentDeskSupportTicket, cost, hardwareRefresh,
            costPerUser, waitTime, avgTimeSpent, hourlyPrice
        };

        const existingDetails = await ProductEnvDetails.findOne({ where: { roiId }, transaction });

        if (existingDetails) {
            await existingDetails.update(values, { transaction });
            await Promise.all([
                CalculationDesktopSupport.destroy({ where: { roiId }, transaction }),
                CalculationDeviceRefresh.destroy({ where: { roiId }, transaction }),
                LicenceCalculations.destroy({ where: { roiId }, transaction }),
                UserProductivityCalculations.destroy({ where: { roiId }, transaction }),
                Timeline.destroy({ where: { roiId }, transaction }),
                RoiBenefits.destroy({ where: { roiId }, transaction })
            ]);
            log.info('ProductEnvDetails updated');
        } else {
            await ProductEnvDetails.create({ roiId, ...values }, { transaction });
            log.info('Environment information successfully saved');
        }

        await transaction.commit();
        return res.status(200).json({ message: existingDetails ? 'Environment information successfully updated' : 'Environment information successfully saved' });
    } catch (error) {
        log.error('Error creating/updating ProductEnvDetails: \n', error);
        await transaction.rollback();
        return res.status(500).json({ error: 'Internal server error' });
    }
};



const addProductAddidtionals = async (req, res) => {
    const { roiId, mttr, desktopSupportTickets, refresh, software, waitTime } = req.body;

    // Validate incoming data
    if (!roiId || isNaN(roiId) || roiId <= 0) {
        return res.status(400).json({ error: 'Invalid roiId' });
    }

    const fields = [
        refresh, software, waitTime
    ];

    for (const field of fields) {
        if (field === undefined || isNaN(field) || field < 0 || field=="") {
            return res.status(400).json({ error: 'Invalid input: all numeric fields must be non-negative numbers' });
        }
    }

    const validateJSONField = (field, fieldName) => {
        if (field && typeof field !== 'object') {
            return res.status(400).json({ error: `${fieldName} must be a valid JSON object` });
        }
    };

    validateJSONField(mttr, 'MTTR');
    validateJSONField(desktopSupportTickets, 'Desktop Support Tickets');

    const transaction = await sequelize.transaction();

    try {
        const values = { mttr, desktopSupportTickets, refresh, software, waitTime };

        const existingDetails = await ProductAdditionals.findOne({ where: { roiId }, transaction });

        if (existingDetails) {
            await existingDetails.update(values, { transaction });
            await Promise.all([
                CalculationDesktopSupport.destroy({ where: { roiId }, transaction }),
                CalculationDeviceRefresh.destroy({ where: { roiId }, transaction }),
                LicenceCalculations.destroy({ where: { roiId }, transaction }),
                UserProductivityCalculations.destroy({ where: { roiId }, transaction }),
                Timeline.destroy({ where: { roiId }, transaction }),
                RoiBenefits.destroy({ where: { roiId }, transaction })
            ]);
            log.info('Additional information successfully updated');
        } else {
            await ProductAdditionals.create({ roiId, ...values }, { transaction });
            log.info('Additional information successfully saved');
        }

        await transaction.commit();
        return res.status(200).json({ message: existingDetails ? 'ProductAdditionalDetails updated successfully' : 'Additional information successfully saved' });
    } catch (error) {
        log.error('Error creating/updating ProductAdditionalDetails: \n', error);
        await transaction.rollback();
        return res.status(500).json({ error: 'Internal server error' });
    }
};



const addProductPhaseDetails = async (req, res) => {
    const { roiId, deskSupport, deviceRefresh, softwareLicence, userProductivity } = req.body;

    // Validate incoming data
    if (!roiId || isNaN(roiId) || roiId <= 0) {
        return res.status(400).json({ error: 'Invalid roiId' });
    }

    const fields = [deskSupport, deviceRefresh, softwareLicence, userProductivity];

    for (const field of fields) {
        if (field === undefined || isNaN(field) || field < 0) {
            return res.status(400).json({ error: 'Invalid input: all numeric fields must be non-negative numbers' });
        }
    }

    const transaction = await sequelize.transaction();

    try {
        const values = { deskSupport, deviceRefresh, softwareLicence, userProductivity };

        const existingDetails = await ProductPhaseDetails.findOne({ where: { roiId }, transaction });

        if (existingDetails) {
            await existingDetails.update(values, { transaction });
            await Promise.all([
                CalculationDesktopSupport.destroy({ where: { roiId }, transaction }),
                CalculationDeviceRefresh.destroy({ where: { roiId }, transaction }),
                LicenceCalculations.destroy({ where: { roiId }, transaction }),
                UserProductivityCalculations.destroy({ where: { roiId }, transaction }),
                Timeline.destroy({ where: { roiId }, transaction }),
                RoiBenefits.destroy({ where: { roiId }, transaction })
            ]);
            log.info('Phase delivery successfully updated');
        } else {
            await ProductPhaseDetails.create({ roiId, ...values }, { transaction });
            log.info('Phase delivery successfully saved');
        }

        await transaction.commit();
        return res.status(200).json({ message: existingDetails ? 'ProductPhaseDetails updated successfully' : 'Phase delivery successfully saved' });
    } catch (error) {
        log.error('Error creating/updating ProductPhaseDetails: \n', error);
        await transaction.rollback();
        return res.status(500).json({ error: 'Internal server error' });
    }
};



module.exports = {
    addProductEnvDetails,
    addProductAddidtionals,
    addProductPhaseDetails
}
