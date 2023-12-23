const express = require('express');
const router = express.Router();

const purchaseController = require('../controllers/purchase');
const authentication = require('../middleware/auth');

router.get('/premiummembership',authentication.userAuthenticate,purchaseController.purchasepremium);
router.post('/updatetransactionstatus',authentication.userAuthenticate,purchaseController.updateTransactionStatus);
router.get('/ispremium',authentication.userAuthenticate,purchaseController.isPremium);

module.exports = router;
