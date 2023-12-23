const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const rootDir = require('../util/path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const Sib = require('sib-api-v3-sdk');
const sequelize = require('../util/database');
require('dotenv').config();
const User = require('../models/user');
const ForgotPassword = require('../models/forgotpasswordrequests');

exports.gethomePage = (request, response, next) => {
    response.sendFile('home.html', { root: 'client' });
}
exports.geterrorPage = (request,response,next) =>{
    response.sendFile('404.html',{root:'client'});
}
exports.getsignup = (request,response,next)=>{
    response.sendFile('signup.html',{root:'client'})
}
exports.getlogin = (request,response,next)=>{
    response.sendFile('login.html',{root:'client'})
}
exports.getforgotpassword = (request,response,next)=>{
    response.sendFile('password.html',{root:'client'})
}
exports.postsignup = (req,res,next) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    
    if(firstName!='' && lastName!='' && email!='' && password!=''){
        User.findAll({where:{email:email}})
            .then(userExist => {
                if(userExist.length>0){
                    fs.readFile(path.join(rootDir, 'client', 'signup.html'), 'utf8', (err, data) =>{
                        if (err) {
                            console.log(err);
                            res.status(500).send('Internal Server Error');
                        }else{
                            res.json({ res: "Error : This USER already EXISTS" });
                        }
                    })  
                }else{
                    const salt = 10; //more salt more encrypt-increase based on number of users
                    const total_expense = 0;
                    bcrypt.hash(password,salt,async(err,hash) => {
                        if(err){
                            console.log(err)
                        }else{
                            await User.create({
                                    firstName:firstName,
                                    lastName:lastName,
                                    email:email,
                                    password:hash,
                                    ispreminumuser:false,
                                    totalExpense:total_expense
                            })
                            .then(result => {
                                res.json({res:"Successfully Registered!",pass:true})
                            })
                            .catch(err => console.log(err))
                        }
                    })
                }
            })
            .catch(err => console.log(err))
    }else{
        res.json({res:"Error",pass:false})
    }
    
     
}

function generateToken(id){
    return jwt.sign({userId:id},process.env.TOKEN_SECRET)
}

exports.postlogin = (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findAll({where:{email:email}})
        .then(user => {
            if(user.length>0){
                fs.readFile(path.join(rootDir, 'client', 'login.html'), 'utf8', (err, data) =>{
                    if (err) {
                        console.log(err);
                        return res.status(500).send('Internal Server Error');
                    }else{
                        bcrypt.compare(password,user[0].password,(err,result) => {
                            if(err){
                                return res.json({res:"Something went wrong",pass:false})
                            }
                            if(result){
                                return res.json({res:"Successfully Logged-in",pass:true,token:generateToken(user[0].id)})
                            }else{
                                return res.json({res:"Please enter the correct details", pass:false})
                            }
                        })
                    }
                })
            }else{
                res.json({res:"Error : User not Registered, Please Signup", pass:false})
            }
        })
}

exports.postforgotPassword = async(req,res,next) => {
    try{
        const email = req.body.email
        let user = await User.findOne({where:{email:email}});
        if(user){
            const forgotpass = await ForgotPassword.create({
                isActive:true,
                userId:user.dataValues.id
            })
            const client = Sib.ApiClient.instance//instantiate the client
            const apiKey = client.authentications['api-key']
            apiKey.apiKey = process.env.PASSWORD_MAIL

            const userToken = generateToken(user.dataValues.id);
            const passwordToken = generateToken(forgotpass);

            const tranEmailApi = new Sib.TransactionalEmailsApi()//apiInstance
            let sendSmtpEmail = new Sib.SendSmtpEmail();
            const sender = { email:'work.devina@gmail.com',name:"Devina"}
            const receiver =[{ email:email}]

            sendSmtpEmail  = {
                sender,
                to:receiver,
                subject:"Expense Tracker Project Password Reset Mail",
                textContent:"Hello, you can reset your {{params.role}} here.",
                params:{
                    role:"PASSWORD"
                },
                headers:{
                    //contentType:application/html,
                    userToken:userToken,
                    passwordToken:passwordToken
                },
                htmlContent:
                    `<h1>Click the link to
                    <a href="${process.env.WEBSITE}/password/${forgotpass.dataValues.id}" > Reset Password </a>
                    </h1>`
                } 
            const sendmail = await tranEmailApi.sendTransacEmail(sendSmtpEmail)
                console.log(sendmail)
            console.log("mail sent")
            return res.json({result:sendmail,userToken:userToken,passwordToken:passwordToken})
        }  
    }
    catch(err){
        console.log(err)
    }

}

exports.resetPassword = async(req,res,next) => {
    const passwordid = req.params.passwordId
    try{
        const request = await ForgotPassword.findAll({where:{isActive:true,id:passwordid}})
        if(request){
            res.sendFile('resetpassword.html', { root: 'client' });
        }
        else{
            res.status(500).send('Internal Server Error');
        }       
    }
    catch(err){
        console.log(err);    }
    
}

exports.passwordReset = async(req,res,next) => {

    const email = req.body.email
    const newpassword = req.body.password
    const userid = req.user.id
    const passwordid = req.password.id

    sequelize.transaction(async(t) => {
        try{
            const salt = 15; 
            const user = await User.findOne({where:{id:userid}})
            const hash = await bcrypt.hash(newpassword,salt)
            const userUpdate = await User.update({ password:hash },{where:{email:email},transaction:t})
            await ForgotPassword.update({isActive:false},{where:{userId:userid,id:passwordid},transaction:t})
            return res.json({res:"Password changed Successfully",pass:true})   
            }  
            catch(err){
                await t.rollback();
                console.log(err)
            }          
        })        
    }
