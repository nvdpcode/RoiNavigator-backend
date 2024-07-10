const Customer = require('../Models/customerModel');
const Roi = require('../Models/roiModel')
const Licence = require('../Models/licenceDetailsModel')

const create = async (req, res) => {
    const { name,contactName,employees,eps,date,licenceTerm,licencePrice,addonPrice,impleandTraining,residentPs,roiName} = req.body;
    try {
      const existingCustomer = await Customer.findOne({ where: { name } });
      if (existingCustomer) {
        return res.status(400).json({ error: 'Customer already exists' });
      }
      const customer = await Customer.create({  name,contactName});
      const roi = await Roi.create({name:roiName,custId:customer.dataValues.custId})
      await Licence.create({custId:customer.dataValues.custId,roiId:roi.dataValues.id,employees,eps:employees*eps,date,licenceTerm,licencePrice,addonPrice,impleandTraining,residentPs})
      return res.status(200).json({ message: 'Customer information successfully saved',roiId:roi.id });
    } catch (error) {
      console.error('Error creating Customer:', error);
      return res.status(500).json({ error: 'Error creating Customer' });
    }
  };


module.exports = {
    create
}
