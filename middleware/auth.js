const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Password = require('../models/forgotpasswordrequests');
exports.userAuthenticate = (req,res,next) => {
    try{
        const token = req.header("userAuthorization");
        const user = jwt.verify(token,'8ytrdfghbvfde34567ytdcvyr57465rtfgjf47gy4557tyfghchgtue4348768fdchgyr5437097ttrfchvr5676865343wdghjf5xdy46tcrs7re4ech6u53tdytr56ehgu');
        User.findByPk(user.userId)
            .then(user => {
                req.user = user;
                next();
            })
            .catch(err => console.log(err))
    }catch(err){
        console.log(err);
        return res.status(401).json({userSuccess:false})
    }
}

exports.passwordAuthenticate = (req,res,next) => {
    try{
        const token = req.header("passwordAuthorization");
        const password = jwt.verify(token,'8ytrdfghbvfde34567ytdcvyr57465rtfgjf47gy4557tyfghchgtue4348768fdchgyr5437097ttrfchvr5676865343wdghjf5xdy46tcrs7re4ech6u53tdytr56ehgu');
        Password.findByPk(password.userId.id)
            .then(password =>{
                req.password = password;
                next();
            })
            .catch(err => console.log(err))
    }catch(err){
        console.log(err);
        return res.status(401).json({passwordSuccess:false})
    }
}
