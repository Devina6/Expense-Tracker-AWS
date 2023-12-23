const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const sequelize = require('./util/database');
const cors = require('cors')
require('dotenv').config();
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');

const User = require('./models/user');
const Expense = require('./models/expense');
const Order = require('./models/order');
const ForgotPasswordRequests = require('./models/forgotpasswordrequests');

const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const premiumRoutes = require('./routes/premium');

const accessLog = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' }) //flag a -> append to file 
//app.use(helmet())
app.use(bodyParser.urlencoded({extended:false})); 
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined', { stream: accessLog }));
app.use(express.static('public'));

app.use('',userRoutes);
app.use('/expense',expenseRoutes);
app.use('/purchase',purchaseRoutes);
app.use('/premium',premiumRoutes);


User.hasMany(Expense);
Expense.belongsTo(User);
User.hasMany(Order);
Order.belongsTo(User);
User.hasMany(ForgotPasswordRequests);
ForgotPasswordRequests.belongsTo(User);

async function initiate(){
    try{
        await sequelize
        .sync()//.sync({force:true})
        .then(result => {
            app.listen(process.env.PORT);
        })
    }
        catch(err){ //app.use(morgan(err,{stream:log}))
            console.log(err);
        }
    }
initiate();
            
    
