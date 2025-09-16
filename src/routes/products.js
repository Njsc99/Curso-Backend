const express = require('express');
const ProductManager = require('../managers/ProductManager');
const router = express.Router();

const productManager = new ProductManager();

router.get('/', async (req, res) => {
  const products = await productManager.getAll();
  res.json(products);
});

router.get('/:pid', async (req, res) => {
  const product = await productManager.getById(req.params.pid);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(product);
});

router.post('/', async (req, res) => {
  const { title, description, code, price, status, stock, category, thumbnails } = req.body;
  if (!title || !description || !code || price == null || status == null || stock == null || !category) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  const newProduct = await productManager.add({
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails: thumbnails || []
  });
  res.status(201).json(newProduct);
});

router.put('/:pid', async (req, res) => {
  const { id, ...rest } = req.body;
  const updated = await productManager.update(req.params.pid, rest);
  if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(updated);
});

router.delete('/:pid', async (req, res) => {
  const deleted = await productManager.delete(req.params.pid);
  if (!deleted) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(deleted);
});

module.exports = router;