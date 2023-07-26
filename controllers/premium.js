const User = require('../models/user');
const Entry = require('../models/entry');
let pageLimit = 5;

module.exports.getLeaderboardData = async (req, res, next) => {
    try {
        const page = +req.query.page || 1;

        const lbData = await User.find({}, 'id name totalSavings')
            .sort({ totalSavings: -1 })
            .skip((page - 1) * pageLimit)
            .limit(pageLimit);

        const total = await User.countDocuments();

        const pageData = {
            currentPage: page,
            hasNextPage: (page * pageLimit) < total,
            nextPage: page + 1,
            hasPreviousPage: (page > 1),
            previousPage: page - 1,
            lastPage: Math.ceil(total / pageLimit)
        }

        console.log(lbData + " " + total);

        res.status(200).json({ success: true, lbData: lbData, pageData: pageData });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Something went wrong', success: false });
    }
};