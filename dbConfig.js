const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('roi_navigator', 'root', 'navdeep', {
  host: 'localhost',
  dialect: 'mysql',
  "logging": false
});

module.exports = {
  sequelize
}
