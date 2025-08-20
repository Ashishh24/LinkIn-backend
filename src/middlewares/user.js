const jwt = require("jsonwebtoken");
const User = require("../models/schema");

const userAuth = async (req, res, next) => {
    try{
        const cookie = req.cookies;
        const {token} = cookie;
        
        if(!token){
            throw { message: "Invalid Token!", statusCode: 401};
        }
        const decodedId = jwt.verify(token, 'Link@in@1804');
        const {_id} = decodedId; 

        const user = await User.findById(_id);
        req.user = user;
        next();
    }
    catch(err) {
        res.status(err.statusCode || 401).json({message: err.message});
    }
};

module.exports = {userAuth};