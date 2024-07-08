const config = require('../config')

const getConfigDetails = (req,res)=>{
    return res.status(200).json({configDetails:config.configurations})
}

module.exports = {
    getConfigDetails
}