
const express = require('express');
const ProductManager = require('../managers/ProductManager');
const router = express.Router();

router.get('/', async (req, res) => {
  const productManager = new ProductManager();
  const products = await productManager.getAll();
  res.render('pages/home', { products });
});

router.get('/realtimeproducts', async (req, res) => {
  const productManager = new ProductManager();
  const products = await productManager.getAll();
  res.render('pages/realTimeProducts', { products });
});

module.exports = router;
