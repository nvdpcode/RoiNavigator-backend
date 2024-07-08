const ProductAdditional = require('../Models/productAdditionals');
const ProductEnv = require('../Models/productEnvdetailsModel');
const ProductPhase = require('../Models/productPhaseModel');
const Licence = require("../Models/licenceDetailsModel");
const CalculationDesktopSupport = require("../Models/calculationDeskSupportModel");
const CalculationDeviceRefresh = require("../Models/calculationDeviceRefreshModel");
const LicenceCalculations = require("../Models/calculationLicenceModel");
const UserProductivityCalculations = require("../Models/calculationUserProductivityModel")

const addDate = (date, value) => {
    const newDate = new Date(date);
    if (value.months) newDate.setMonth(newDate.getMonth() + value.months);
    if (value.years) newDate.setFullYear(newDate.getFullYear() + value.years);
    return newDate;
};

const createDesktopTasks = (levels, yearCalc, tickets, costs, reductionFactors) => {
    return levels.flatMap((level, index) => [
        { level, yearDate: yearCalc.year1, noOfTickets: tickets[index], costPerTicket: costs[index], reductionFact: reductionFactors.firstYear },
        { level, yearDate: yearCalc.year2, noOfTickets: tickets[index], costPerTicket: costs[index], reductionFact: reductionFactors.subsYear }
    ]);
};

const createDeviceRefreshTasks = (yearCalc, noOfDevices, costPerDevice, reductionFact) => {
    return Array.from({ length: 4 }, (_, i) => ({
        yearDate: yearCalc[`year${i + 1}`],
        noOfDevices,
        costPerDevice,
        reductionFact
    }));
};

const deskSupportCalculations = async (roiId, { yearDate, level, noOfTickets, costPerTicket, reductionFact }) => {
    const noOfTicketsAlluvino = noOfTickets * (reductionFact / 100);
    const costPerTicketAlluvino = costPerTicket * (reductionFact / 100);
    const costPerAnnum = noOfTickets * costPerTicket;
    const costPerAnnumAlluvino = noOfTicketsAlluvino * costPerTicketAlluvino;

    try {
        const existingRecord = await CalculationDesktopSupport.findOne({ where: { roiId, level } });
        if (existingRecord) {
            console.log(`Record with roiId ${roiId} and level ${level} already exists. Skipping creation.`);
            return true;
        }

        await CalculationDesktopSupport.create({
            roiId,
            Date: yearDate,
            level,
            noOfTickets,
            cost: costPerTicket,
            costPerAnnum,
            noOfTicketsAlluvino,
            costAlluvino: costPerTicketAlluvino,
            costPerAnnumAlluvino,
            savingsPerAnnum: costPerAnnum - costPerAnnumAlluvino
        });

        return true;
    } catch (error) {
        console.error('Error creating CalculationDesktopSupport:', error);
        return false;
    }
};

const deviceRefreshCalculations = async (roiId, { yearDate, noOfDevices, costPerDevice, reductionFact }) => {
    const noOfDevicesAlluvino = noOfDevices * (reductionFact / 100);
    const costPerDeviceAlluvino = costPerDevice;
    const costPerAnnum = noOfDevices * costPerDevice;
    const costPerAnnumAlluvino = noOfDevicesAlluvino * costPerDeviceAlluvino;

    try {
        const existingRecord = await CalculationDeviceRefresh.findOne({ where: { roiId, Date:yearDate } });
        if (existingRecord) {
            console.log(`Record with roiId ${roiId} already exists. Skipping creation for refresh.`);
            return true;
        }

        await CalculationDeviceRefresh.create({
            roiId,
            Date: yearDate,
            noOfDevices:Math.ceil(noOfDevices),
            cost: costPerDevice,
            costPerAnnum,
            noOfDevicesAlluvino:Math.ceil(noOfDevicesAlluvino),
            costAlluvino: costPerDeviceAlluvino,
            costPerAnnumAlluvino,
            savingsPerAnnum: costPerAnnum - costPerAnnumAlluvino
        });
        return true;
    } catch (error) {
        console.error('Error creating CalculationDeviceRefresh:', error);
        return false;
    }
};

const licenceCalculations = async (roiId,  yearDate, noOfUsers, costOfSoftware, reductionFact ) => {
    const costPerAnnum = noOfUsers * costOfSoftware;
    const costOfSoftwareAlluvio = costOfSoftware * (reductionFact / 100);
    const costPerAnnumAlluvino = noOfUsers * costOfSoftwareAlluvio

    try {
        const existingRecord = await LicenceCalculations.findOne({ where: { roiId, Date:yearDate } });
        if (existingRecord) {
            console.log(`Record with roiId ${roiId} already exists. Skipping creation for refresh.`);
            return true;
        }

        await LicenceCalculations.create({
            roiId,
            Date: yearDate,
            noOfUsers:noOfUsers,
            costOfSoftware: costOfSoftware,
            costOfSoftwareAlluvio:costOfSoftwareAlluvio,
            costPerAnnum:costPerAnnum,
            costPerAnnumAlluvino,
            savingsPerAnnum: costPerAnnum - costPerAnnumAlluvino
        });
        return true;
    } catch (error) {
        console.error('Error creating CalculationDeviceRefresh:', error);
        return false;
    }
};

const userProductivityCalculations = async (roiId,  yearDate, waitTimeHrs, costPerHour, reductionFact ) => {
    const costPerAnnum = waitTimeHrs* costPerHour;
    const waitTimeHrsAlluvio = reductionFact*waitTimeHrs/100
    const costPerAnnumAlluvino = waitTimeHrsAlluvio*costPerHour;

    try {
        const existingRecord = await UserProductivityCalculations.findOne({ where: { roiId, Date:yearDate } });
        if (existingRecord) {
            console.log(`Record with roiId ${roiId} already exists. Skipping creation for refresh.`);
            return true;
        }

        await UserProductivityCalculations.create({
            roiId,
            Date: yearDate,
            waitTimeHrs:waitTimeHrs,
            waitTimeHrsAlluvio:waitTimeHrsAlluvio ,
            costPerHour:costPerHour,
            costPerHourAlluvio:costPerHour,
            costPerAnnum:costPerAnnum,
            costPerAnnumAlluvio: costPerAnnumAlluvino,
            savingsPerAnnum: costPerAnnum-costPerAnnumAlluvino
        });
        return true;
    } catch (error) {
        console.error('Error creating CalculationDeviceRefresh:', error);
        return false;
    }
};

const calculation = async (req, res) => {
    const { roiId } = req.body;

    try {
        const [prodAddDetails, prodAddEnv, prodAddPhase, licenceDetails] = await Promise.all([
            ProductAdditional.findOne({ where: { roiId } }),
            ProductEnv.findOne({ where: { roiId } }),
            ProductPhase.findOne({ where: { roiId } }),
            Licence.findOne({ where: { roiId } })
        ]);

        const Year = new Date(licenceDetails.date);

        const yearCalc = {
            Desktop: {
                year1: addDate(Year, { months: Number(prodAddPhase.deskSupport) }),
                year2: addDate(Year, { months: Number(prodAddPhase.deskSupport), years: 1 })
            },
            Refresh: {
                year1: addDate(Year, { months: Number(prodAddPhase.deviceRefresh) }),
                year2: addDate(Year, { months: Number(prodAddPhase.deviceRefresh), years: 1 }),
                year3: addDate(Year, { months: Number(prodAddPhase.deviceRefresh), years: 2 }),
                year4: addDate(Year, { months: Number(prodAddPhase.deviceRefresh), years: 3 })
            },
            softwareLicence:{
                year: addDate(Year, { months: Number(prodAddPhase.softwareLicence) }),
            },
            userProductivity:{
                year: addDate(Year, { months: Number(prodAddPhase.userProductivity) }),
            }
        };

        const reductionFact = {
            mttr: {
                firstYear: 100 - Number(prodAddDetails.mttr.firstYear),
                subsYear: 100 - Number(prodAddDetails.mttr.subsYear)
            },
            desktopSupport: {
                firstYear: 100 - Number(prodAddDetails.desktopSupportTickets.firstYear),
                subsYear: 100 - Number(prodAddDetails.desktopSupportTickets.subsYear)
            },
            refresh: {
                eachYear: 100 - Number(prodAddDetails.refresh)
            },
            software: {
                eachYear: 100 - Number(prodAddDetails.software)
            },
            waitTime: {
                eachYear: 100 - Number(prodAddDetails.waitTime)
            }
        };

        const phase={
            deskSupport:prodAddPhase.deskSupport,
            deviceRefresh:prodAddPhase.deviceRefresh,
            softwareLicence: prodAddPhase.softwareLicence,
            userProductivity: prodAddPhase.userProductivity
         }

        //For Desktop Support
        const NoOfL1Tickets = Number(prodAddEnv.noOfL1Tickets) * Number(licenceDetails.employees) * Number(prodAddEnv.percentDeskSupportTicket / 100) * 12;
        const costPerL1Ticket = Number(prodAddEnv.l1TicketCost);
        const level = 1;

        const NoOfL2Tickets = NoOfL1Tickets * Number(prodAddEnv.noOfL2Tickets) / 100;
        const costPerL2Ticket = Number(prodAddEnv.l2TicketCost);
        const level2 = 2;

        const NoOfL3Tickets = NoOfL2Tickets * Number(prodAddEnv.noOfL3Tickets) / 100;
        const costPerL3Ticket = Number(prodAddEnv.l3TicketCost);
        const level3 = 3;

        const desktopTasks = createDesktopTasks([level, level2, level3], yearCalc.Desktop, [NoOfL1Tickets, NoOfL2Tickets, NoOfL3Tickets], [costPerL1Ticket, costPerL2Ticket, costPerL3Ticket], reductionFact.desktopSupport);

        // For Device Refresh
        const noOfDevices = Number(prodAddEnv.hardwareRefresh) * (12 - phase.deviceRefresh) / 12;
        const costPerDevice = Number(prodAddEnv.cost);
        const refreshTasks = createDeviceRefreshTasks(yearCalc.Refresh, noOfDevices, costPerDevice, reductionFact.refresh.eachYear);


        //For User Productivity
        const waitTime = (250*(12 - phase.userProductivity)*(licenceDetails.employees)*(prodAddEnv.avgTimeSpent)*(prodAddEnv.waitTime))/10000

        //Executing all tasks concurrently
        const [desktopResults, refreshResults, licenceResult, userProductivityResult] = await Promise.all([
            Promise.all(desktopTasks.map(task => deskSupportCalculations(roiId, task))),
            Promise.all(refreshTasks.map(task => deviceRefreshCalculations(roiId, task))),
            licenceCalculations(roiId,  yearCalc.softwareLicence.year, licenceDetails.employees, prodAddEnv.costPerUser, reductionFact.software.eachYear ),
            userProductivityCalculations(roiId,yearCalc.userProductivity.year,waitTime,prodAddEnv.hourlyPrice,reductionFact.waitTime.eachYear)
        ]);

        const allSuccessful = [...desktopResults, ...refreshResults, licenceResult, userProductivityResult].every(result => result);

        if (allSuccessful) {
            return res.status(200).json({ message: 'Calculations Details updated successfully' });
        } else {
            return res.status(500).json({ error: 'Error During Calculations' });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ error: 'Error During Calculations' });
    }
};

module.exports = { calculation };
