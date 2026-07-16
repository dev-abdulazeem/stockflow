const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/dashboard', authenticate, reportController.getDashboardStats);
router.get('/sales-trend', authenticate, reportController.getSalesTrend);
router.get('/inventory', authenticate, reportController.getInventoryReport);

module.exports = router;