const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');

router.post('/', authenticate, upload.single('image'), productController.createProduct);
router.get('/', authenticate, productController.getAllProducts);
router.get('/low-stock', authenticate, productController.getLowStock);
router.get('/:id', authenticate, productController.getProductById);
router.put('/:id', authenticate, upload.single('image'), productController.updateProduct);
router.delete('/:id', authenticate, productController.deleteProduct);

module.exports = router;