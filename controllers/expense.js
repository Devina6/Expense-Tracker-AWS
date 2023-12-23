const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const User = require('../models/user');
const Expense = require('../models/expense');
const sequelize = require('../util/database');
const rootDir = require('../util/path');
const fs = require('fs');

exports.getExpenses = (request,response,next) =>{
    response.sendFile('expense.html',{root:'client'});
}
exports.getviewExpenses = (request, response, next) => {
    response.sendFile('viewExpenses.html', { root: 'client' });
}
exports.getIndex = async (req,res,next) => {
    try{
        const page = req.query.page;
        let expensePerPage = req.body.rows
        const id = req.user.id
        const {count, rows} = await Expense.findAndCountAll({
            where:{userId:id},
            offset:(page-1)*expensePerPage,//skip offset number of rows and then fetch
            limit: expensePerPage//fetch number of rows
        })
        res.json({
            expenses:rows,
            currentPage: parseInt(page),
            hasNextPage: expensePerPage*page < count,
            nextPage: parseInt(page)+1,
            hasPreviousPage:parseInt(page)>1,
            previousPage: parseInt(page)-1,
            lastPage: Math.ceil(count/expensePerPage)
        })
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    };
}


exports.postExpense = async (req,res,next) => {
    
    let amount = req.body.amount;
    let description = req.body.description;
    let category = req.body.category;
    let id = req.user.id
    sequelize.transaction(async (t)=>{
        try{
            if(amount!='' && description!='' && category!='' && id!=''){
                const expense = await Expense.create({
                    amount:amount,
                    description:description,
                    category:category,
                    userId:id
                },
                {transaction:t})
            const updatedTotalExpense = parseInt(req.user.totalExpense) + parseInt(amount);
            await User.update({ totalExpense: updatedTotalExpense },{where:{id:id},transaction:t})
            res.json({expense:expense})
        }
    }
    catch(err){
        await t.rollback();
        console.log(err)
    }
})
}


exports.deleteExpense = (req,res,next) => {
    sequelize.transaction(async(t)=>{
        try{
            const expense = await Expense.findOne({where:{id:req.params.expenseId}})
            const del = await Expense.destroy({where:{id:req.params.expenseId,userId:req.user.id}},{transaction:t})
            const updatedTotalExpense = parseInt(req.user.totalExpense) - parseInt(expense.amount);
            await User.update({ totalExpense: updatedTotalExpense },{where:{id:req.user.id},transaction:t})
            res.redirect('/expense/index')
        }
        catch(err){
            await t.rollback()
            return res.status(500).json({success:false,error:err})
                }
    })
    
}

