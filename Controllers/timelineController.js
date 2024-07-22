const ProductPhase = require('../Models/productPhaseModel');
const Licence = require("../Models/licenceDetailsModel");
const CalculationDesktopSupport = require("../Models/calculationDeskSupportModel");
const CalculationDeviceRefresh = require("../Models/calculationDeviceRefreshModel");
const CalculationLicence = require('../Models/calculationLicenceModel');
const CalcUserProductivity = require('../Models/calculationUserProductivityModel');
const Timeline = require("../Models/timelineModel")
const RoiBenefits = require("../Models/roiBenefitsModel")
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
        return res.status(500).json({message:"Internal Server Error"})    
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
        return res.status(500).json({message:"Internal Server Error"})    
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
        const roiTimeline = await Timeline.findAll({where: {'roiId':roiId}})
        const desktopSupport = roiTimeline.filter((elem)=>{
            return elem.parameter == "L1Support"||elem.parameter == "L2Support"||elem.parameter == "L3Support"
        })
        const softwareLicence = roiTimeline.filter((elem)=>{
            return elem.parameter == "SoftwareLicence"
        })
        const userProductivity =  roiTimeline.filter((elem)=>{
            return elem.parameter == "UserProductivity"
        })
        const ImpleAndTraining = roiTimeline.filter((elem)=>{
            return elem.parameter == "ImplementationandTraining"
        })
        const proffesionalServices = roiTimeline.filter((elem)=>{
            return elem.parameter == "PS"
        })
        const licence = roiTimeline.filter((elem)=>{
            return elem.parameter == 'Licence'
        })
        const addOn = roiTimeline.filter((elem)=>{
            return elem.parameter == 'AddOn'
        })
        console.log('desktopSupport.length',desktopSupport.length)

        const [desktopResults, softwarelicence, userproductivity, ImpleandTraining,proffesionalservices,Licence,addon] = await Promise.all([
            createRoi('SD',roiId, desktopSupport),
            createRoi('SL',roiId, softwareLicence),
            createRoi('UP',roiId,userProductivity),
            createRoi('IT',roiId,ImpleAndTraining),
            createRoi('PS',roiId,proffesionalServices),
            createRoi('LC',roiId,licence),
            createRoi('AO',roiId,addOn),
        ]);

         const allSuccessful = [desktopResults, softwarelicence, userproductivity, ImpleandTraining,proffesionalservices,Licence,addon].every(result => result);

        if (allSuccessful) {
            return res.status(200).json({ message: 'ROI created Successfully' });
        } else {
            return res.status(500).json({ error: 'Error During Calculations' });
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal Server Error"})    
    }
}

const createRoi = async (parameter,roiId, desktopSupport) => {
    try {
        const existingROiparameter = await RoiBenefits.findOne({where:{roiId,parameter}})
        if(existingROiparameter){
            console.log(`Skipping RoiBenefits for ${parameter}`)
            return true;
        }
        const calculateYearValues = (year) => ({
            date: desktopSupport[0][year].date,
            value: desktopSupport.reduce((acc, item) => acc + item[year].value, 0)
        });
    
        const years = ["Year0", "Year1", "Year2", "Year3", "Year4", "Year5"];
    
        const roiBenefitsData = years.reduce((acc, year) => {
            acc[year] = calculateYearValues(year);
            return acc;
        }, {});
    
        await RoiBenefits.create({
            roiId,
            parameter: parameter,
            ...roiBenefitsData
        });
        return true
    } catch (error) {
        console.log(error)
        return false
    }
    
};

const excludeAttributes = (item, attributesToExclude) => {
    const result = { ...item.dataValues };
    attributesToExclude.forEach(attr => {
      delete result[attr];
    });
    return result;
  };

const getRoi = async(req,res)=>{
    const {roiId} = req.body;
    try {
        const roi = await RoiBenefits.findAll({where: {'roiId':roiId}, attributes: {
            exclude: ['id', 'productId','roiId','createdAt','updatedAt']
        }})
        const digitalWorkspaceBenefits = {
            serviceDesk : roi.filter((elem)=>elem.parameter=='SD').map((elem) => excludeAttributes(elem, ['parameter'])),
            softwareLicence : roi.filter((elem)=>elem.parameter=='SL').map((elem) => excludeAttributes(elem, ['parameter'])),
        }
    
        const nondigitalWorkspaceBenefits={
            userProductivity: roi.filter((elem)=>elem.parameter=='UP').map((elem) => excludeAttributes(elem, ['parameter'])),
        }
    
        const oneTimeTechCost = {
            professionalServices: roi.filter((elem)=>elem.parameter=='IT').map((elem) => excludeAttributes(elem, ['parameter'])),
        }
    
        const ongoingTechCost = {
            professionalServices: roi.filter((elem)=>elem.parameter=='PS').map((elem) => excludeAttributes(elem, ['parameter'])),
            licence: roi.filter((elem)=>elem.parameter=='LC').map((elem) => excludeAttributes(elem, ['parameter'])),
            addOns: roi.filter((elem)=>elem.parameter=='AO').map((elem) => excludeAttributes(elem, ['parameter'])),
        }
    
        return res.status(200).json({digitalWorkspaceBenefits,nondigitalWorkspaceBenefits,oneTimeTechCost,ongoingTechCost})    
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal Server Error"})    
    
    }
   
}


module.exports = { calculationTimeline,roiBenefits,getRoi }