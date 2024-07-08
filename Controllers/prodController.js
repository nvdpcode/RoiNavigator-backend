const ProductEnvDetails = require('../Models/productEnvdetailsModel')
const ProductAdditionals = require('../Models/productAdditionals')
const ProductPhase = require('../Models/productPhaseModel')

const addProductEnvDetails = async (req, res) => {
    const { roiId, l1TicketCost, l2TicketCost, l3TicketCost, noOfL1Tickets, noOfL2Tickets, noOfL3Tickets, percentDeskSupportTicket, cost, hardwareRefresh, costPerUser, waitTime, avgTimeSpent, hourlyPrice } = req.body;
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
            });

            console.log('ProductEnvDetails updated:', existingDetails);
            return res.status(200).json({ message: 'ProductEnvDetails updated successfully' });
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
            });

            console.log('New ProductEnvDetails created:', newDetails);
            return res.status(200).json({ message: 'ProductEnvDetails created successfully' });
        }
    } catch (error) {
        console.error('Error creating/updating ProductEnvDetails:', error);
        return res.status(500).json({ error: 'Error creating/updating ProductEnvDetails' });
    }
};

const addProductAddidtionals = async (req, res) => {
    const { roiId, mttr, desktopSupportTickets, refresh, software, waitTime} = req.body;
    try {
        let existingDetails = await ProductAdditionals.findOne({ where: { roiId: roiId } });
        if (existingDetails) {
            existingDetails = await existingDetails.update({
                mttr: mttr,
                desktopSupportTickets: desktopSupportTickets,
                refresh: refresh,
                software: software,
                waitTime: waitTime
            });

            console.log('ProductAdditionalDetails updated:', existingDetails);
            return res.status(200).json({ message: 'ProductAdditionalDetails updated successfully' });
        } else {
            const newDetails = await ProductAdditionals.create({
                roiId: roiId,
                mttr: mttr,
                desktopSupportTickets: desktopSupportTickets,
                refresh: refresh,
                software: software,
                waitTime: waitTime
            });

            console.log('New ProductAdditionalDetails created:', newDetails);
            return res.status(200).json({ message: 'ProductAdditionalDetails created successfully' });
        }
    } catch (error) {
        console.error('Error creating/updating ProductAdditionalDetails:', error);
        return res.status(500).json({ error: 'Error creating/updating ProductAdditionalDetails' });
    }
};

const addProductPhaseDetails = async (req, res) => {
    const { roiId, deskSupport, deviceRefresh, softwareLicence, userProductivity} = req.body;
    try {
        let existingDetails = await ProductPhase.findOne({ where: { roiId: roiId } });
        if (existingDetails) {
            existingDetails = await existingDetails.update({
                deskSupport: deskSupport,
                deviceRefresh: deviceRefresh,
                softwareLicence: softwareLicence,
                userProductivity: userProductivity
            });

            console.log('ProductPhaseDetails updated:', existingDetails);
            return res.status(200).json({ message: 'ProductPhaseDetails updated successfully' });
        } else {
            const newDetails = await ProductPhase.create({
                roiId: roiId,
                deskSupport: deskSupport,
                deviceRefresh: deviceRefresh,
                softwareLicence: softwareLicence,
                userProductivity: userProductivity
            });

            console.log('New ProductPhaseDetails created:', newDetails);
            return res.status(200).json({ message: 'ProductPhaseDetails created successfully' });
        }
    } catch (error) {
        console.error('Error creating/updating ProductPhaseDetails:', error);
        return res.status(500).json({ error: 'Error creating/updating ProductPhaseDetails' });
    }
};


module.exports = {
    addProductEnvDetails,
    addProductAddidtionals,
    addProductPhaseDetails
}
