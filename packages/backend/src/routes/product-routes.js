const express = require('express');
const router = express.Router();
const productController = require('../controllers/product-controller');
const auth = require('../middleware/auth');

router.get('/products', auth, productController.getAllProducts);
router.post('/products', auth, productController.createProduct);
router.get('/products/:id', auth, productController.getProduct);
router.patch('/products/:id/stock', auth, productController.updateStock);

router.use((error, request, response) => {
  console.error(error);
  response.status(500).json({ error: 'Something went wrong!' });
});

module.exports = router;
