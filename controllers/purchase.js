const Razorpay = require('razorpay');
const Order = require('../models/order');
require('dotenv').config();

const User = require('../models/user');

exports.isPremium = (req,res,next) => {
    const user_id = req.user.id;
    User.findOne({where:{id:user_id}})
        .then(user => {
            res.json(user.ispreminumuser);
        })
        .catch(err => console.log(err))
}

exports.purchasepremium = (req,res,next) => {
    try{
        let rzp = new Razorpay({
            key_id:process.env.RAZORPAY_KEY_ID,
            key_secret:process.env.RAZORPAY_KEY_SECRET
        })
        const amount = 2500;

        rzp.orders.create({amount,currency:"INR"},(err,order) => {
            if(err){
                req.user.createOrder({orderId:order.id,status:'FAILURE'})
                    .then(()=>{
                        throw new Error(JSON.stringify(err));
                    })
                    .catch(err => {
                        throw new Error(err);
                      });
            }
            req.user.createOrder({orderId:order.id,status:'PENDING'})
            .then(()=>{
                return res.json({order,key_id:rzp.key_id});
            })
            .catch(err => {
                console.log(err);
            })
        })
        .catch(err => console.log(err))
    }
    catch(err){
        console.log(err);
        res.status(403).json({message:"Something went wrong",error:err})
    }
}

exports.updateTransactionStatus = async(req,res,next) => {
    try{
        const{payment_id,order_id} = req.body;
        const order = await Order.findOne({where:{orderId:order_id}})
        if(payment_id!="00000000"){
            const promise1 =  order.update({paymentId:payment_id,status:"SUCCESSFUL"})
            const promise2 = req.user.update({ispreminumuser:1})
            Promise.all([promise1,promise2])
                .then(( )=> {
                    return res.status(202).json({success:true,message:"Transaction Successful"})
                })
                .catch(err => console.log(err))
        }else{
            order.update({paymentId:payment_id,status:"FAILURE"})
                .then(( )=> {
                    return res.status(202).json({success:false,message:"Transaction Failure"})
                })
                .catch(err => console.log(err))
        }
        
    }
    catch(err){
        console.log(err);
        res.status(403).json({message:"Something went wrong",error:err})
    }
}
