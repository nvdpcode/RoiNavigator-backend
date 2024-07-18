const ProductPhase = require('../Models/productPhaseModel');
const Licence = require("../Models/licenceDetailsModel");
const CalculationDesktopSupport = require("../Models/calculationDeskSupportModel");
const CalculationDeviceRefresh = require("../Models/calculationDeviceRefreshModel");
const CalculationLicence = require('../Models/calculationLicenceModel');
const CalcUserProductivity = require('../Models/calculationUserProductivityModel');
const Timeline = require("../Models/timelineModel")
const {sequelize} = require('../dbConfig');
const log = require('../utils/logger');

function sortByDate(array) {
    return array.sort((a, b) => new Date(a.date) - new Date(b.date));
}

const addDate = (date, value) => {
    const newDate = new Date(date);
    if (value.months) newDate.setMonth(newDate.getMonth() + value.months);
    if (value.years) newDate.setFullYear(newDate.getFullYear() + value.years);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
};

const calculationTimeline = async(req,res)=>{
    try {
        const{roiId} = req.body;
        const [deskSupport, deviceRefresh, licence, userProductivity,productPhase,licenceDetails] = await Promise.all([
            CalculationDesktopSupport.findAll({ where: { roiId },attributes: ['Date','level','savingsPerAnnum'] }),
            CalculationDeviceRefresh.findAll({ where: { roiId },attributes: ['Date','savingsPerAnnum'] }),
            CalculationLicence.findAll({ where: { roiId },attributes: ['Date','savingsPerAnnum'] }),
            CalcUserProductivity.findAll({ where: { roiId },attributes: ['Date','savingsPerAnnum']  }),
            ProductPhase.findOne({ where: { roiId } }),
            Licence.findOne({ where: { roiId }})
        ]);
        const term = licenceDetails.licenceTerm;
        const startDate = licenceDetails.date;

        //for Desktop Support
        const desktopYearObj = sortByDate(deskSupport.map(item => ({
             date: item.Date,
             savingsPerAnnum: item.savingsPerAnnum,
             level: item.level
        })))
        const l1Savings = desktopYearObj.filter((elem)=>{
            return elem.level == 1
        })
        const l2Savings = desktopYearObj.filter((elem)=>{
            return elem.level == 2
        })
        const l3Savings = desktopYearObj.filter((elem)=>{
            return elem.level == 3
        })
        await timelineDesktopSupport(roiId,l1Savings,productPhase.deskSupport,term,startDate)
        await timelineDesktopSupport(roiId,l2Savings,productPhase.deskSupport,term,startDate)
        await timelineDesktopSupport(roiId,l3Savings,productPhase.deskSupport,term,startDate)

        //For Device Refresh
        // await timelineDeviceRefresh(roiId,deviceRefresh,productPhase.deviceRefresh,term,startDate)

        //For Software Licence
        await timelineSoftwareLicence(roiId,licence,productPhase.softwareLicence,term,startDate)

        //For User Productivity
        await timelineUserProductivity(roiId,userProductivity,productPhase.userProductivity,term,startDate)

        //For Implementation and training
        await timelineImplementationandTraining(roiId,licenceDetails.date,licenceDetails.impleandTraining)

        //For Ps
        await timelinePs(roiId,licenceDetails.date,term,licenceDetails.residentPs)

        //For Licence
        const licencePrice = (licenceDetails.licencePrice/term)*12
        await timelineLicenceandAddon(roiId,licenceDetails.date,term,licencePrice,'Licence')

        //ForAddOns
        const addOnPrice = (licenceDetails.addonPrice/term)*12
        await timelineLicenceandAddon(roiId,licenceDetails.date,term,addOnPrice,'AddOn')
        
        return res.status(200).json(licenceDetails)

    } catch (error) {
        console.log(error)
    }

}

function calcvalue(year,phase,term,startDate,currentDate){
    const savings = year.savingsPerAnnum
    //const currDate = addDate(currentDate, { months: Number(phase)})
    const value = getRemainingMonths(startDate,currentDate,term)

    return Number(((value*savings)/12).toFixed(2))
}

function calcvaluePS(cost,term,startDate,currentDate){
    const savings = cost
    const value = getRemainingMonths(startDate,currentDate,term)

    return Number(((value*savings)/12).toFixed(2))
}

function getRemainingMonths(startDate,currentDate,term) {
    const start = new Date(startDate);
    const currDate = new Date(currentDate)
    const end = addDate(start, { months: Number(term)})
    let factor;

    let currentYear = currDate.getFullYear();

        if (currentYear === start.getFullYear()) {
            factor = 12 - currDate.getMonth();
        } else if (currentYear === end.getFullYear()) {
             factor = end.getMonth();
        } else {
             factor = 12;
        }
    return factor;
}

async function timelineDesktopSupport(roiId, yearObj, phase, term, startDate) {
    try {
        const parameter = `L${yearObj[0].level}Support`;
        const existingRecord = await Timeline.findOne({ where: { roiId, parameter } });
        if (existingRecord) {
            console.log(`Record with roiId ${roiId} already exists. Skipping Timeline for DesktopRefresh.`);
            return true;
        }

        const startYear = new Date(startDate).getFullYear();
        const year0Year = new Date(yearObj[0].date).getFullYear();
        let timelineData = { roiId, parameter };

        const getDateValue = (year, index) => {
            const date = year ? year.date : addDate(yearObj[0].date, { years: index }).toISOString().split('T')[0];
            const value = year ? calcvalue(year, phase, term, startDate, date) : 0;
            return { date, value };
        };

        if (startYear < year0Year) {
            timelineData['Year0'] = { date: startDate, value: 0 };
            for (let i = 0; i <= 4; i++) {
                const year = yearObj[i];
                timelineData[`Year${i + 1}`] = getDateValue(year, i);
            }
        } else {
            for (let i = 0; i <= 5; i++) {
                const year = yearObj[i];
                timelineData[`Year${i}`] = getDateValue(year, i);
            }
        }

        await Timeline.create(timelineData);
    } catch (error) {
        console.log(error);
    }
}

async function timelineDeviceRefresh(roiId,yearObj,phase,term,startDate){
    try {
        const existingRecord = await Timeline.findOne({ where: { roiId, parameter:`L${yearObj[0].level}Support` } });
        if (existingRecord) {
            console.log(`Record with roiId ${roiId} already exists. Skipping Timeline for DesktopRefresh.`);
            return true;
        }
        await Timeline.create({
            roiId,
            parameter:`DeviceRefresh`,
            Year0:{
                date:yearObj[0].Date,
                value:calcvalue(yearObj[0],phase,term,startDate,yearObj[0].Date)
            } ,
            Year1:{
                date:yearObj[1].Date,
                value:calcvalue(yearObj[1],phase,term,startDate,yearObj[1].Date)
            },
            Year2:{
                date:yearObj[2].Date,
                value:calcvalue(yearObj[2],phase,term,startDate,yearObj[2].Date)
            },
            Year3:{
                date:yearObj[3].Date,
                value:calcvalue(yearObj[3],phase,term,startDate,yearObj[3].Date)
            },
            Year4:{
                date:yearObj[4]?yearObj[4].Date:null,
                value:yearObj[4]?calcvalue(yearObj[4],phase,term,startDate,yearObj[4].Date):0
            },
            Year5:{
                date:yearObj[5]?yearObj[5].Date:null,
                value:yearObj[5]?calcvalue(yearObj[5],phase,term,startDate,yearObj[5].Date).savingsPerAnnum:0
            },
            
        });
    } catch (error) {
        console.log(error)
    }

}

async function timelineSoftwareLicence(roiId, yearObj, phase, term, startDate) {
    try {
        const parameter = 'SoftwareLicence';
        const existingRecord = await Timeline.findOne({ where: { roiId, parameter } });
        if (existingRecord) {
            console.log(`Record with roiId ${roiId} already exists. Skipping Timeline for ${parameter}.`);
            return true;
        }

        const startYear = new Date(startDate).getFullYear();
        const year0Year = new Date(yearObj[0].Date).getFullYear();
        let timelineData = { roiId, parameter };

        const getDateValue = (year, index) => {
            const date = year ? year.Date : addDate(yearObj[0].Date, { years: index }).toISOString().split('T')[0];
            const value = year ? calcvalue(year, phase, term, startDate, date) : 0;
            return { date, value };
        };

        if (startYear < year0Year) {
            timelineData['Year0'] = { date: new Date().toISOString().split('T')[0], value: 0 };
            for (let i = 0; i <= 4; i++) {
                const year = yearObj[i];
                timelineData[`Year${i + 1}`] = getDateValue(year, i);
            }
        } else {
            for (let i = 0; i <= 5; i++) {
                const year = yearObj[i];
                timelineData[`Year${i}`] = getDateValue(year, i);
            }
        }

        await Timeline.create(timelineData);
    } catch (error) {
        console.log(error);
    }
}

async function timelineUserProductivity(roiId, yearObj, phase, term, startDate) {
    try {
        const parameter = 'UserProductivity';
        const existingRecord = await Timeline.findOne({ where: { roiId, parameter } });
        if (existingRecord) {
            console.log(`Record with roiId ${roiId} already exists. Skipping Timeline for ${parameter}.`);
            return true;
        }

        const startYear = new Date(startDate).getFullYear();
        const year0Year = new Date(yearObj[0].Date).getFullYear();
        let timelineData = { roiId, parameter };

        const getDateValue = (year, index) => {
            const date = year ? year.Date : addDate(yearObj[0].Date, { years: index }).toISOString().split('T')[0];
            const value = year ? calcvalue(year, phase, term, startDate, date) : 0;
            return { date, value };
        };

        if (startYear < year0Year) {
            timelineData['Year0'] = { date:startDate, value: 0 };
            for (let i = 0; i <= 4; i++) {
                const year = yearObj[i];
                timelineData[`Year${i + 1}`] = getDateValue(year, i);
            }
        } else {
            for (let i = 0; i <= 5; i++) {
                const year = yearObj[i];
                timelineData[`Year${i}`] = getDateValue(year, i);
            }
        }

        await Timeline.create(timelineData);
    } catch (error) {
        console.log(error);
    }
}

async function timelinePs(roiId, startDate,term,cost) {
    try {
        const parameter = 'PS';
        const existingRecord = await Timeline.findOne({ where: { roiId, parameter } });
        if (existingRecord) {
            console.log(`Record with roiId ${roiId} already exists. Skipping Timeline for ${parameter}.`);
            return true;
        }

        let timelineData = { roiId, parameter };

        const getDateValue = (year, index) => {
            const date = index==0?year : addDate(year, { years: index }).toISOString().split('T')[0];
            const value = index<=3 ? calcvaluePS(cost,term,startDate,date) : 0;
            return { date, value };
        };

     
            for (let i = 0; i <= 5; i++) {
                const year = startDate;
                timelineData[`Year${i}`] = getDateValue(year, i);
            }
        
        await Timeline.create(timelineData);
    } catch (error) {
        console.log(error);
    }
}

async function timelineLicenceandAddon(roiId, startDate,term,cost,param) {
    try {
        const parameter = param;
        const existingRecord = await Timeline.findOne({ where: { roiId, parameter } });
        if (existingRecord) {
            console.log(`Record with roiId ${roiId} already exists. Skipping Timeline for ${parameter}.`);
            return true;
        }

        let timelineData = { roiId, parameter };

        const getDateValue = (year, index) => {
            const date = index==0?year : addDate(year, { years: index }).toISOString().split('T')[0];
            const value = index<=3 ? calcvaluePS(cost,term,startDate,date) : 0;
            return { date, value };
        };

     
            for (let i = 0; i <= 5; i++) {
                const year = startDate;
                timelineData[`Year${i}`] = getDateValue(year, i);
            }
        

        await Timeline.create(timelineData);
    } catch (error) {
        console.log(error);
    }
}

async function timelineImplementationandTraining(roiId, startDate, cost) {
    try {
        const parameter = 'ImplementationandTraining';
        const existingRecord = await Timeline.findOne({ where: { roiId, parameter } });
        if (existingRecord) {
            console.log(`Record with roiId ${roiId} already exists. Skipping Timeline for ${parameter}.`);
            return true;
        }
        let timelineData = { roiId, parameter };

        const getDateValue = (year, index) => {
            const date = index==0?year:addDate(year, { years: index }).toISOString().split('T')[0]
            const value = index==0 ? cost:0
            return { date, value };
        };

        for (let i = 0; i <= 5; i++) {
            const year = startDate;
            timelineData[`Year${i}`] = getDateValue(year,i);
        }
        

        await Timeline.create(timelineData);
    } catch (error) {
        console.log(error);
    }
}

const roiBenefits = async(req,res)=>{
    const{roiId}=req.body;
    try {
        const roiTimeline = await Timeline.findAll({'roiId':roiId})
        return res.json({"roiTimeline":roiTimeline})
    } catch (error) {
        console.log(error)
    }
}

module.exports = { calculationTimeline,roiBenefits }