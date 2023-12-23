const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const {v4:uuidv4} = require('uuid');
const uuid = uuidv4();

const ForgotPasswordRequests = sequelize.define('forgotpasswordrequests',{
    id:{
        type:Sequelize.DataTypes.UUID,
        allowNull:false,
        defaultValue:()=>uuidv4(),
        unique:true,
        primaryKey:true
    },
    isActive:{
        type:Sequelize.BOOLEAN,
        allowNull:false,
    }
})

module.exports = ForgotPasswordRequests;
