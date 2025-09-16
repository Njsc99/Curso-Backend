const CartManager = require('../managers/CartManager');
const ProductManager = require('../managers/ProductManager');

const cartManager = new CartManager();
const productManager = new ProductManager();

async function createCart(req, res) {
  try {
    const newCart = await cartManager.addCart();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getCartById(req, res) {
  try {
    const cart = await cartManager.getById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(cart.products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function addProductToCart(req, res) {
  try {
    const product = await productManager.getById(req.params.pid);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    const cart = await cartManager.addProductToCart(req.params.cid, req.params.pid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createCart,
  getCartById,
  addProductToCart
};