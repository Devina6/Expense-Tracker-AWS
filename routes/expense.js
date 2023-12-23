const express = require('express');
const router = express.Router();

const expenseController = require('../controllers/expense');
const authentication = require('../middleware/auth');

router.get('',expenseController.getExpenses);
router.get('/viewExpenses',expenseController.getviewExpenses)
router.post('/index',authentication.userAuthenticate,expenseController.getIndex);
router.post('/addExpense',authentication.userAuthenticate,expenseController.postExpense);
router.get('/delete/:expenseId',authentication.userAuthenticate,expenseController.deleteExpense);

module.exports = router;
