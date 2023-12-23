const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');
const authentication = require('../middleware/auth');
const expenseController = require('../controllers/expense');

router.get('/home',userController.gethomePage);
router.get('',userController.geterrorPage);

router.get('/signup',userController.getsignup);
router.post('/adduser',userController.postsignup);

router.get('/login',userController.getlogin)
router.post('/login',userController.postlogin);

router.get('/forgotpassword',userController.getforgotpassword);
router.post('/forgotpassword',userController.postforgotPassword);
router.get('/password/:passwordId',userController.resetPassword);
router.post('/resetpassword',authentication.userAuthenticate,authentication.passwordAuthenticate,userController.passwordReset);

module.exports = router;
