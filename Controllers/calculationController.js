const ProductAdditional = require('../Models/productAdditionals');
const ProductEnv = require('../Models/productEnvdetailsModel');
const ProductPhase = require('../Models/productPhaseModel');
const Licence = require("../Models/licenceDetailsModel");
const CalculationDesktopSupport = require("../Models/calculationDeskSupportModel");
const CalculationDeviceRefresh = require("../Models/calculationDeviceRefreshModel");
const LicenceCalculations = require("../Models/calculationLicenceModel");
const UserProductivityCalculations = require("../Models/calculationUserProductivityModel");
const CalculationLicence = require('../Models/calculationLicenceModel');
const CalcUserProductivity = require('../Models/calculationUserProductivityModel');
const {sequelize} = require('../dbConfig');
const log = require('../utils/logger');


function deviceRefreshAlgo(year, cycle, totalEPs, reduction) {
    const max0YearMinusCycle = Math.max(0, year - cycle);
    const innerTerm = Math.pow(reduction, year) + Math.pow(reduction, max0YearMinusCycle) * (1 - reduction) * max0YearMinusCycle;
    return (totalEPs / cycle) * (1 - innerTerm);
}

const addDate = (date, value) => {
    const newDate = new Date(date);
    if (value.months) newDate.setMonth(newDate.getMonth() + value.months);
    if (value.years) newDate.setFullYear(newDate.getFullYear() + value.years);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
};

const createDesktopTasks = (levels, yearCalc, tickets, costs, reductionFactors,reductionMttr) => {
    const tasks = [];
    Object.keys(yearCalc.Desktop).forEach((yearKey, index) => {
        const yearDate = yearCalc.Desktop[yearKey];
        levels.forEach((level, levelIndex) => {
            const reductionfact = {
                reductionDesktop : index === 0 ? reductionFactors.firstYear : reductionFactors.subsYear,
                reductionMttr : index === 0 ? reductionMttr.firstYear : reductionMttr.subsYear,
            } 
            tasks.push({
                level,
                yearDate,
                noOfTickets: tickets[levelIndex],
                costPerTicket: costs[levelIndex],
                reductionFact:reductionfact
            });
        });
    });

    return tasks;
};


const createDeviceRefreshTasks = (yearCalc, noOfDevices, costPerDevice, reductionFact, cycle, totalEPs) => {
    const numYears = Object.keys(yearCalc.Refresh).length;

    return Array.from({ length: numYears }, (_, i) => {
        const year = i + 1;
        const noOfDevicesAlluvio = deviceRefreshAlgo(year, cycle, totalEPs, (1 - (reductionFact / 100)));
        return {
            yearDate: yearCalc.Refresh[`year${year}`],
            noOfDevices,
            noOfDevicesAlluvio,
            costPerDevice,
            reductionFact
        };
    });
};

 const createLicenceCalculationTasks = (yearCalc, noOfEmployees, costPerUser, reductionFact) => {
    const numYears = Object.keys(yearCalc.softwareLicence).length;
    return Array.from({ length: numYears }, (_, i) => {
        const year = i + 1;
        return {
            yearDate: yearCalc.softwareLicence[`year${year}`],
            noOfUsers:noOfEmployees,
            costOfSoftware:costPerUser,
            reductionFact
        };
    });
};

const createUserProductivityTasks = (yearCalc, waitTime, costPerHour, reductionFact) => {
    const numYears = Object.keys(yearCalc.userProductivity).length;
    return Array.from({ length: numYears }, (_, i) => {
        const year = i + 1;
        return {
            yearDate: yearCalc.userProductivity[`year${year}`],
            waitTimeHrs:waitTime,
            costPerHour,
            reductionFact
        };
    });
};

const deskSupportCalculations = async (roiId, { yearDate, level, noOfTickets, costPerTicket, reductionFact }) => {
    const noOfTicketsAlluvino = noOfTickets * (reductionFact.reductionDesktop / 100);
    const costPerTicketAlluvino = costPerTicket * (reductionFact.reductionMttr / 100);
    const costPerAnnum = noOfTickets * costPerTicket;
    const costPerAnnumAlluvino = noOfTicketsAlluvino * costPerTicketAlluvino;
    const transaction = await sequelize.transaction();

    try {
        const existingRecord = await CalculationDesktopSupport.findOne({ where: { level, Date:yearDate,roiId },transaction });
        console.log('existingRecord',existingRecord)
        if (existingRecord) {
            console.log(` Desktop Support Record with roiId ${roiId} and level ${level} already exists. Updating record.`);
            await existingRecord.update({
                noOfTickets,
                cost: costPerTicket,
                costPerAnnum,
                noOfTicketsAlluvino,
                costAlluvino: costPerTicketAlluvino,
                costPerAnnumAlluvino,
                savingsPerAnnum: costPerAnnum - costPerAnnumAlluvino
            }, { transaction });

            await transaction.commit();
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
        },{transaction});
        await transaction.commit();
        return true;
    } catch (error) {
        log.error('Error creating CalculationDesktopSupport: \n', error);
        await transaction.rollback();
        return false;
    }
};

const deviceRefreshCalculations = async (roiId, { yearDate, noOfDevices,noOfDevicesAlluvio, costPerDevice, reductionFact }) => {
    const costPerDeviceAlluvino = costPerDevice;
    const costPerAnnum = noOfDevices * costPerDevice;
    const costPerAnnumAlluvino = noOfDevicesAlluvio * costPerDeviceAlluvino;
    const transaction = await sequelize.transaction();
    try {
        const existingRecord = await CalculationDeviceRefresh.findOne({ where: { roiId, Date:yearDate },transaction });
        if (existingRecord) {
            console.log(`Record with roiId ${roiId} and Date ${yearDate} already exists. Updating record.`);
            await existingRecord.update({
                noOfDevices: Math.ceil(noOfDevices),
                cost: costPerDevice,
                costPerAnnum,
                noOfDevicesAlluvino: Math.floor(noOfDevicesAlluvio),
                costAlluvino: costPerDeviceAlluvino,
                costPerAnnumAlluvino,
                savingsPerAnnum: costPerAnnum - costPerAnnumAlluvino
            }, { transaction });

            await transaction.commit();
            return true;
        }

        await CalculationDeviceRefresh.create({
            roiId,
            Date: yearDate,
            noOfDevices:Math.ceil(noOfDevices),
            cost: costPerDevice,
            costPerAnnum,
            noOfDevicesAlluvino:Math.floor(noOfDevicesAlluvio),
            costAlluvino: costPerDeviceAlluvino,
            costPerAnnumAlluvino,
            savingsPerAnnum: costPerAnnum - costPerAnnumAlluvino
        },{transaction});
        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        log.error('Error creating CalculationDeviceRefresh: \n', error);
        return false;
    }
};

const licenceCalculations = async (roiId, { yearDate, noOfUsers, costOfSoftware, reductionFact }) => {
    const costPerAnnum = noOfUsers * costOfSoftware;
    const costOfSoftwareAlluvio = costOfSoftware * (reductionFact / 100);
    const costPerAnnumAlluvino = noOfUsers * costOfSoftwareAlluvio;
    const transaction = await sequelize.transaction();

    try {
        const existingRecord = await LicenceCalculations.findOne({ where: { roiId, Date: yearDate }, transaction });
        if (existingRecord) {
            console.log(`Record with roiId ${roiId} and Date ${yearDate} already exists. Updating record.`);
            await existingRecord.update({
                noOfUsers: noOfUsers,
                costOfSoftware: costOfSoftware,
                costOfSoftwareAlluvio: costOfSoftwareAlluvio,
                costPerAnnum: costPerAnnum,
                costPerAnnumAlluvino: costPerAnnumAlluvino,
                savingsPerAnnum: costPerAnnum - costPerAnnumAlluvino
            }, { transaction });

            await transaction.commit();
            return true;
        }

        await LicenceCalculations.create({
            roiId,
            Date: yearDate,
            noOfUsers: noOfUsers,
            costOfSoftware: costOfSoftware,
            costOfSoftwareAlluvio: costOfSoftwareAlluvio,
            costPerAnnum: costPerAnnum,
            costPerAnnumAlluvino: costPerAnnumAlluvino,
            savingsPerAnnum: costPerAnnum - costPerAnnumAlluvino
        }, { transaction });

        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating/updating Licence calculations: \n', error);
        return false;
    }
};


const userProductivityCalculations = async (roiId,{  yearDate, waitTimeHrs, costPerHour, reductionFact} ) => {
    const costPerAnnum = waitTimeHrs* costPerHour;
    const waitTimeHrsAlluvio = reductionFact*waitTimeHrs/100
    const costPerAnnumAlluvino = waitTimeHrsAlluvio*costPerHour;
    const transaction = await sequelize.transaction();

    try {
        const existingRecord = await UserProductivityCalculations.findOne({ where: { roiId, Date:yearDate },transaction });
        if (existingRecord) {
            console.log(`Record with roiId ${roiId} and Date ${yearDate} already exists. Updating record.`);
            await existingRecord.update({
                waitTimeHrs: waitTimeHrs,
                waitTimeHrsAlluvio: waitTimeHrsAlluvio,
                costPerHour: costPerHour,
                costPerHourAlluvio: costPerHour,
                costPerAnnum: costPerAnnum,
                costPerAnnumAlluvio: costPerAnnumAlluvino,
                savingsPerAnnum: costPerAnnum - costPerAnnumAlluvino
            }, { transaction });

            await transaction.commit();
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
        },{transaction});

        await transaction.commit();
        return true;

    } catch (error) {
        await transaction.rollback();
        log.error('Error calculating userProductivityCalculations: \n', error);
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

        if (!prodAddDetails || !prodAddEnv || !prodAddPhase || !licenceDetails) {
            return res.status(200).json({ message:'Roi not found' });
        }

        const Year = new Date(licenceDetails.date);
        const totalTerm = addDate(Year, { months: Number(licenceDetails.licenceTerm)})
        
        const reftreshterm =addDate(Year, { months:Number(prodAddPhase.deviceRefresh) })
        const desktopTerm =addDate(Year, { months:Number(prodAddPhase.deskSupport) })
        const licenceTerm = addDate(Year, { months:Number(prodAddPhase.softwareLicence) })
        const userProductivityTerm = addDate(Year, { months: Number(prodAddPhase.userProductivity)})

        const diffDesktop = (totalTerm.getFullYear() - desktopTerm.getFullYear())+1;
        const diffreftreshterm = (totalTerm.getFullYear() - reftreshterm.getFullYear())+1;
        const diffsoftwareLicence = (totalTerm.getFullYear() - licenceTerm.getFullYear())+1;
        const diffuserProductivity = (totalTerm.getFullYear() - userProductivityTerm.getFullYear())+1;

        const yearCalc = {
            Desktop: {},
            Refresh:{},
            softwareLicence:{},
            userProductivity:{}
        };
        
        for (let i = 1; i <= diffDesktop; i++) {
            yearCalc.Desktop[`year${i}`] = addDate(Year, { months: Number(prodAddPhase.deskSupport), years: i - 1 });
        }

        for (let i = 1; i <= diffreftreshterm; i++) {
            yearCalc.Refresh[`year${i}`] = addDate(Year, { months: Number(prodAddPhase.deviceRefresh), years: i - 1 });
        }

        for (let i = 1; i <= diffsoftwareLicence; i++) {
            yearCalc.softwareLicence[`year${i}`] = addDate(Year, { months: Number(prodAddPhase.softwareLicence), years: i - 1 });
        }

        for (let i = 1; i <= diffuserProductivity; i++) {
            yearCalc.userProductivity[`year${i}`] = addDate(Year, { months: Number(prodAddPhase.userProductivity), years: i - 1 });
        }

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
                eachYear: 100-Number(prodAddDetails.refresh)
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

        const desktopTasks = createDesktopTasks([level, level2, level3], yearCalc, [NoOfL1Tickets, NoOfL2Tickets, NoOfL3Tickets], [costPerL1Ticket, costPerL2Ticket, costPerL3Ticket], reductionFact.desktopSupport,reductionFact.mttr);

        // For Device Refresh
        const noOfDevices = Number(prodAddEnv.hardwareRefresh) * (12 - phase.deviceRefresh) / 12;
        const costPerDevice = Number(prodAddEnv.cost);
        const cycle = 4;
        const  totalEPs = licenceDetails.eps
        const refreshTasks = createDeviceRefreshTasks(yearCalc, noOfDevices, costPerDevice, reductionFact.refresh.eachYear,cycle, totalEPs);
    
        //For User Productivity
        const waitTime = (250*(12 - phase.userProductivity)*(licenceDetails.employees)*(prodAddEnv.avgTimeSpent)*(prodAddEnv.waitTime))/10000;
        const userProductivityTasks = createUserProductivityTasks(yearCalc,waitTime,prodAddEnv.hourlyPrice,reductionFact.waitTime.eachYear) ;

         //for Software Licence
        const licenceCalculationTasks = createLicenceCalculationTasks(yearCalc, licenceDetails.employees, prodAddEnv.costPerUser, reductionFact.software.eachYear)

        //Executing all tasks concurrently
        const [desktopResults, refreshResults, licenceResult, userProductivityResult] = await Promise.all([
            Promise.all(desktopTasks.map(task => deskSupportCalculations(roiId, task))),
            Promise.all(refreshTasks.map(task => deviceRefreshCalculations(roiId, task))),
            Promise.all(licenceCalculationTasks.map(task => licenceCalculations(roiId, task))),
            Promise.all(userProductivityTasks.map(task => userProductivityCalculations(roiId, task))),
        ]);

         const allSuccessful = [...desktopResults, ...refreshResults, ...licenceResult, ...userProductivityResult].every(result => result);

        if (allSuccessful) {
            return res.status(200).json({ message: 'Calculations Details updated successfully' });
        } else {
            return res.status(500).json({ error: 'Error During Calculations' });
        }
    } catch (error) {
        log.error('Error in calculations: \n', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


function filterByConditions(array, conditions) {
    return array.filter(item => Object.keys(conditions).every(key => item[key] === conditions[key]));
}


function sortByDate(array) {
    return array.sort((a, b) => new Date(a.date) - new Date(b.date));
}


const getCalculations = async (req, res) => {
    try {
        const { roiId } = req.body;
        const [deskSupport, deviceRefresh, licence, userProductivity] = await Promise.all([
            CalculationDesktopSupport.findAll({ where: { roiId } }),
            CalculationDeviceRefresh.findAll({ where: { roiId } }),
            CalculationLicence.findAll({ where: { roiId } }),
            CalcUserProductivity.findAll({ where: { roiId } })
        ]);
       
        if (deskSupport.length<1 || deviceRefresh.length<1 || licence.length<1 || userProductivity.length<1) {
            return res.status(404).json({ message:'Roi not found' });
        }

        const withoutAlluvio = {
            L1DesktopSupport: sortByDate(filterByConditions(deskSupport, { level: 1 }).map(item => ({
                date: item.Date,
                noOfTickets: item.noOfTickets,
                costPerTicket: item.cost,
                costPerAnnum: item.costPerAnnum,
            }))),
            L2DesktopSupport: sortByDate(filterByConditions(deskSupport, { level: 2 }).map(item => ({
                date: item.Date,
                noOfTickets: item.noOfTickets,
                costPerTicket: item.cost,
                costPerAnnum: item.costPerAnnum,
            }))),
            L3DesktopSupport: sortByDate(filterByConditions(deskSupport, { level: 3 }).map(item => ({
                date: item.Date,
                noOfTickets: item.noOfTickets,
                costPerTicket: item.cost,
                costPerAnnum: item.costPerAnnum,
            }))),
            DeviceRefresh: sortByDate(deviceRefresh.map(item => ({
                date: item.Date,
                noOfDevices: item.noOfDevices,
                costPerDevice: item.cost,
                costPerAnnum: item.costPerAnnum,
            }))),
            softwareLicence:sortByDate(licence.map(item => ({
                date: item.Date,
                noOfUsers: item.noOfUsers,
                costOfSoftware: item.costOfSoftware,
                costPerAnnum: item.costPerAnnum
            }))),
            userProductivity:sortByDate(userProductivity.map(item => ({
                date: item.Date,
                waitTimeHrs: item.waitTimeHrs,
                costPerHour: item.costPerHour,
                costPerAnnum: item.costPerAnnum
            }))),
        };
        const withAlluvio = {
            L1DesktopSupport: sortByDate(filterByConditions(deskSupport, { level: 1 }).map(item => ({
                date: item.Date,
                noOfTickets: item.noOfTicketsAlluvino,
                costPerTicket: item.costAlluvino,
                costPerAnnum: item.costPerAnnumAlluvino,
            }))),
            L2DesktopSupport: sortByDate(filterByConditions(deskSupport, { level: 2 }).map(item => ({
                date: item.Date,
                noOfTickets: item.noOfTicketsAlluvino,
                costPerTicket: item.costAlluvino,
                costPerAnnum: item.costPerAnnumAlluvino,
            }))),
            L3DesktopSupport: sortByDate(filterByConditions(deskSupport, { level: 3 }).map(item => ({
                date: item.Date,
                noOfTickets: item.noOfTicketsAlluvino,
                costPerTicket: item.costAlluvino,
                costPerAnnum: item.costPerAnnumAlluvino,
            }))),
            DeviceRefresh: sortByDate(deviceRefresh.map(item => ({
                date: item.Date,
                noOfDevices: item.noOfDevicesAlluvino,
                costPerDevice: item.costAlluvino,
                costPerAnnum: item.costPerAnnumAlluvino,
            }))),
            softwareLicence:sortByDate(licence.map(item => ({
                date: item.Date,
                noOfUsers: item.noOfUsers,
                costOfSoftware: item.costOfSoftwareAlluvio,
                costPerAnnum: item.costPerAnnumAlluvino
            }))),
            userProductivity:sortByDate(userProductivity.map(item => ({
                date: item.Date,
                waitTimeHrs: item.waitTimeHrsAlluvio,
                costPerHour: item.costPerHourAlluvio,
                costPerAnnum: item.costPerAnnumAlluvio
            }))),
        };

        const savings = {
            L1DesktopSupport: sortByDate(filterByConditions(deskSupport, { level: 1 }).map(item => ({
                date: item.Date,
                savingsPerAnnum:item.savingsPerAnnum
            }))),
            L2DesktopSupport: sortByDate(filterByConditions(deskSupport, { level: 2 }).map(item => ({
                date: item.Date,
                savingsPerAnnum:item.savingsPerAnnum
            }))),
            L3DesktopSupport: sortByDate(filterByConditions(deskSupport, { level: 3 }).map(item => ({
                date: item.Date,
                savingsPerAnnum:item.savingsPerAnnum
            }))),
            DeviceRefresh: sortByDate(deviceRefresh.map(item => ({
                date: item.Date,
                savingsPerAnnum: item.savingsPerAnnum
            }))),
            softwareLicence:sortByDate(licence.map(item => ({
                date: item.Date,
                savingsPerAnnum: item.savingsPerAnnum
            }))),
            userProductivity:sortByDate(userProductivity.map(item => ({
                date: item.Date,
                savingsPerAnnum: item.savingsPerAnnum
                }))),
        };

        return res.json({withAlluvio:withAlluvio,withoutAlluvio,savings:savings});
    } catch (error) {
        log.error('Error in fetching calculations: \n', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


module.exports = { calculation,getCalculations }
