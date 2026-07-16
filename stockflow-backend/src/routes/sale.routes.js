const express = require('express');
const router = express.Router();
const saleController = require('../controllers/sale.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/', authenticate, saleController.recordSale);
router.get('/', authenticate, saleController.getAllSales);
router.get('/:id', authenticate, saleController.getSaleById);
router.delete('/:id', authenticate, saleController.deleteSale);

module.exports = router;