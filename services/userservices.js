// const sequelize = require("../util/database");

const getEntries = async (req, where) => {
    return req.user.getEntries(where);
};

module.exports = {
    getEntries
};