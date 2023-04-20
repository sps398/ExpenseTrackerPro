const Sequelize = require('sequelize');

const sequelize = new Sequelize('expense-tracker', 'root', 'server@Shashank', {
    dialect: 'mysql', host: 'localhost'
});

module.exports = sequelize;