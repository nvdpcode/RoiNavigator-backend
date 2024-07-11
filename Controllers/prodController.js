const ProductEnvDetails = require('../Models/productEnvdetailsModel')
const ProductAdditionals = require('../Models/productAdditionals')
const ProductPhase = require('../Models/productPhaseModel')
const {sequelize} = require('../dbConfig');

const addProductEnvDetails = async (req, res) => {
    const { roiId, l1TicketCost, l2TicketCost, l3TicketCost, noOfL1Tickets, noOfL2Tickets, noOfL3Tickets, percentDeskSupportTicket, cost, hardwareRefresh, costPerUser, waitTime, avgTimeSpent, hourlyPrice } = req.body;
    const transaction = await sequelize.transaction();
    try {
        let existingDetails = await ProductEnvDetails.findOne({ where: { roiId: roiId } });
        if (existingDetails) {
            existingDetails = await existingDetails.update({
                l1TicketCost: l1TicketCost,
                l2TicketCost: l2TicketCost,
                l3TicketCost: l3TicketCost,
                noOfL1Tickets: noOfL1Tickets,
                noOfL2Tickets: noOfL2Tickets,
                noOfL3Tickets: noOfL3Tickets,
                percentDeskSupportTicket: percentDeskSupportTicket,
                cost: cost,
                hardwareRefresh: hardwareRefresh,
                costPerUser: costPerUser,
                waitTime: waitTime,
                avgTimeSpent: avgTimeSpent,
                hourlyPrice: hourlyPrice
            },{ transaction });

            await transaction.commit();
            console.log('ProductEnvDetails updated');
            
            return res.status(200).json({ message: 'Environment information successfully updated' });
        } else {
            const newDetails = await ProductEnvDetails.create({
                roiId: roiId,
                l1TicketCost: l1TicketCost,
                l2TicketCost: l2TicketCost,
                l3TicketCost: l3TicketCost,
                noOfL1Tickets: noOfL1Tickets,
                noOfL2Tickets: noOfL2Tickets,
                noOfL3Tickets: noOfL3Tickets,
                percentDeskSupportTicket: percentDeskSupportTicket,
                cost: cost,
                hardwareRefresh: hardwareRefresh,
                costPerUser: costPerUser,
                waitTime: waitTime,
                avgTimeSpent: avgTimeSpent,
                hourlyPrice: hourlyPrice
            },{ transaction });
            await transaction.commit();
            console.log('Environment information successfully saved');
            return res.status(200).json({ message: 'Environment information successfully saved' });
        }
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating/updating ProductEnvDetails:', error);
        return res.status(500).json({ error: 'Error creating/updating Environment information' });
    }
};

const addProductAddidtionals = async (req, res) => {
    const { roiId, mttr, desktopSupportTickets, refresh, software, waitTime} = req.body;
    const transaction = await sequelize.transaction();
    try {
        let existingDetails = await ProductAdditionals.findOne({ where: { roiId: roiId },transaction });
        if (existingDetails) {
            existingDetails = await existingDetails.update({
                mttr: mttr,
                desktopSupportTickets: desktopSupportTickets,
                refresh: refresh,
                software: software,
                waitTime: waitTime
            },{transaction});
            await transaction.commit();
            console.log('ProductAdditionalDetails updated');
            return res.status(200).json({ message: 'ProductAdditionalDetails updated successfully' });
        } else {
            const newDetails = await ProductAdditionals.create({
                roiId: roiId,
                mttr: mttr,
                desktopSupportTickets: desktopSupportTickets,
                refresh: refresh,
                software: software,
                waitTime: waitTime
            },{ transaction });
            await transaction.commit();
            console.log('Additional information successfully saved');
            return res.status(200).json({ message: 'Additional information successfully saved' });
        }
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating/updating ProductAdditionalDetails:', error);
        return res.status(500).json({ error: 'Error creating/updating Additional information' });
    }
};

const addProductPhaseDetails = async (req, res) => {
    const { roiId, deskSupport, deviceRefresh, softwareLicence, userProductivity} = req.body;
    const transaction = await sequelize.transaction();
    try {
        let existingDetails = await ProductPhase.findOne({ where: { roiId: roiId },transaction });
        if (existingDetails) {
            existingDetails = await existingDetails.update({
                deskSupport: deskSupport,
                deviceRefresh: deviceRefresh,
                softwareLicence: softwareLicence,
                userProductivity: userProductivity
            },{transaction});
            await transaction.commit();
            console.log('ProductPhaseDetails updated');
            return res.status(200).json({ message: 'ProductPhaseDetails updated successfully' });
        } else {
            const newDetails = await ProductPhase.create({
                roiId: roiId,
                deskSupport: deskSupport,
                deviceRefresh: deviceRefresh,
                softwareLicence: softwareLicence,
                userProductivity: userProductivity
            },{transaction});
            await transaction.commit();
            console.log('Phase delivery successfully saved');
            return res.status(200).json({ message: 'Phase delivery successfully saved' });
        }
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating/updating ProductPhaseDetails:', error);
        return res.status(500).json({ error: 'Error creating/updating Phase delivery' });
    }
};


module.exports = {
    addProductEnvDetails,
    addProductAddidtionals,
    addProductPhaseDetails
}
