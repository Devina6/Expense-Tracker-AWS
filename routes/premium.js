const express = require('express');
const router = express.Router();

const premiumController = require('../controllers/premium');
const authentication = require('../middleware/auth');


router.get('/leaderboardstatus',premiumController.leaderBoardStatus);
router.post('/filterexpenses',authentication.userAuthenticate,premiumController.filterExpenses);
router.post('/download',authentication.userAuthenticate,premiumController.downloadExpense);

module.exports = router;
