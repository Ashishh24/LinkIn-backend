const jwt = require("jsonwebtoken");
const User = require("../models/schema");

const userAuth = async (req, res, next) => {
    try{
        const cookie = req.cookies;
        const {token} = cookie;
        
        if(!token){
            throw new Error("Invalid Token!");
        }
        const decodedId = jwt.verify(token, 'Link@in@1804');
        const {_id} = decodedId; 

        const user = await User.findById(_id);
        req.user = user;
        next();
    }
    catch(err) {
        res.status(401).send("ERROR: " + err.message);
    }
};

module.exports = {userAuth};
