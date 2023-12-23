const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Expense = sequelize.define('expense',{
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        autoIncrement:true,
        unique:true,
        primaryKey:true
    },
    amount:{
        type:Sequelize.DECIMAL,
        allowNull:false,
    },
    description:{
        type:Sequelize.STRING,
        allowNull:false
    },
    category:{
        type:Sequelize.STRING,
        allowNull:false
    }
})

module.exports = Expense;
