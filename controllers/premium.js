const Upload = require('@aws-sdk/lib-storage');
const {S3Client,S3, PutObjectCommand} = require('@aws-sdk/client-s3');
const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const { Op } = require('sequelize');
const User = require('../models/user');
const Expense = require('../models/expense');

require('dotenv').config();

exports.leaderBoardStatus = (req,res,next) => {

  User.findAll({
    attributes:['firstName','lastName','totalExpense'],
    order:[['totalExpense','DESC']]
  })
      .then(result => {
        return res.json(result);
      })
      .catch(error => {
        console.error(error);
      })    
}

function getMonth(month){
  switch(month){
    case('January'):{
      return 1;
    }
    case('February'):{
      return 2
    }
    case('March'):{
      return 3
    }
    case('April'):{
      return 4
    }
    case('May'):{
      return 5
    }
    case('June'):{
      return 6
    }
    case('July'):{
      return 7
    }
    case('August'):{
      return 8
    }
    case('September'):{
      return 9
    }
    case('October'):{
      return 10
    }
    case('November'):{
      return 11
    }
    case('December'):{
      return 12
    }
    defualt: return 0;
  }
}


exports.filterExpenses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { category, year } = req.body;
    let month1 = req.body.month;
    const month = getMonth(req.body.month)

    let categoryArray = ['Travel', 'Food', 'Entertainment', 'Health'] 
    let yearArray = ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026']
    

    if (categoryArray.includes(category)==false && (month>=1 && month<=12)==false && yearArray.includes(year)==false) {
      return res.json({ success: false });
    }

    const whereClause = {
      userId: userId,
    };
    
    if (category && categoryArray.includes(category)) {
      whereClause.category = category;
    }

    if ((month && month!==0) || (year && yearArray.includes(year) )) {
      whereClause.updatedAt = {};

      if (month &&(month>=1 && month<=12)) {
        whereClause.updatedAt[Op.and] = [
          sequelize.literal(`MONTH(updatedAt) = ${month}`),
        ];
      }

      if (year && yearArray.includes(year)) {
        if (!whereClause.updatedAt[Op.and]) {
          whereClause.updatedAt[Op.and] = [];
        }
        whereClause.updatedAt[Op.and].push(
          sequelize.literal(`YEAR(updatedAt) = ${year}`)
        );
      }
    }

    const expenses = await Expense.findAll({
      attributes: ['updatedAt', 'amount', 'description', 'category'],
      where: whereClause,
    });

    if (expenses.length > 0) {
      return res.json({ expenses, success: true });
    } else {
      return res.json({ success: false });
    }
  } catch (error) {
    
    console.error(error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

async function uploadToS3(data,filename){

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const region = process.env.S3_REGION
  const Bucket = process.env.S3_BUCKET


  const s3client = new S3Client({
      credentials:{
        accessKeyId,
        secretAccessKey
      },
      region
    });
  
  try{
    const s3response = await s3client.send(
      new PutObjectCommand({
        Bucket,
        Key:filename,
        Body:data,
        ACL:'public-read'
      })
    )
    //console.log('response',s3response);
    const fileurl = `https://s3.${region}.amazonaws.com/${Bucket}/${filename}`;
    return fileurl;
  }
  catch(err){
    console.log('Error',err)
  }
}
    
exports.downloadExpense = async (req,res,next) => {
  console.log(req.body);
  const userId = req.user.id;
  const category = req.body.category;
  const month = getMonth(req.body.month)
  const year = req.body.year;
  
  const expenses = await Expense.findAll({
    attributes:['updatedAt','amount','description','category'],
    where:{userId:userId,category:category,[Op.and]: [
      sequelize.literal(`MONTH(updatedAt) = ${month}`),
      sequelize.literal(`YEAR(updatedAt) = ${year}`),
      ]
    }
  })

  const stringifiedExpenses = JSON.stringify(expenses);
  const filename = 'Expenses.txt';
  const fileURL = await uploadToS3(stringifiedExpenses,filename);
  //console.log('url',fileURL);
  res.status(200).json({fileURL,success:true})
}
