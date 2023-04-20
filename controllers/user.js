const User = require('../models/user');


module.exports.postUserSignUp = async (req, res, next) => {
    try {
        await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });

        res.json({ "success": "true" });
    } catch(err) {
        res.json({ "success": "false" });
    }
};