const sequelize = require("../util/database");
const { Op } =  require('sequelize');

const getExpenses = (req, where) => {
    return req.user.getExpenses();
};

module.exports = {
    getExpenses
};