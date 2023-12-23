const Sequelize = require('sequelize');
require('dotenv').config();
const sequelize = new Sequelize(process.env.DATABASE_SCHEME,process.env.DATABASE_USERNAME,process.env.DATABASE_PASSWORD,{
    dialect:process.env.DATABASE_TYPE,
    host:process.env.DATABASE_HOST
});

module.exports = sequelize;
