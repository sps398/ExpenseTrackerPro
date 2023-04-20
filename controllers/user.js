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

module.exports.postUserSignIn = async (req, res, next) => {
    try {
        const users = await User.findAll({
            where: { email: req.body.email }
        });

        const user = users[0];
        
        if(!user)
            return res.json({ 'message': 'Error 404 : User not Found!', "success": "false" });
        
        if(user.password != req.body.password)
            return res.json({ 'message': "Error 401 (Unauthorized) : Incorrect Password!", "success": "false" });
        
        return res.json({ "message": "User login succesfull!", "success": "true" });
    } catch(err) {
        console.log(err);
    }
};