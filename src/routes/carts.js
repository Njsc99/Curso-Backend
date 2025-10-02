const express = require('express');
const router = express.Router();
const {
  createCart,
  getCartById,
  addProductToCart,
  removeProductFromCart,
  updateCart,
  updateProductQuantity,
  clearCart,
  getAllCarts
} = require('../controllers/cart.controller');

// GET /api/carts - Obtener todos los carritos (opcional)
router.get('/', getAllCarts);

// POST /api/carts - Crear un nuevo carrito vacío
router.post('/', createCart);

// GET /api/carts/:cid - Obtener carrito por ID con productos completos (populate)
router.get('/:cid', getCartById);

// POST /api/carts/:cid/products/:pid - Agregar producto al carrito
router.post('/:cid/products/:pid', addProductToCart);

// DELETE /api/carts/:cid/products/:pid - Eliminar producto específico del carrito
router.delete('/:cid/products/:pid', removeProductFromCart);

// PUT /api/carts/:cid - Actualizar todo el carrito con un array de productos
router.put('/:cid', updateCart);

// PUT /api/carts/:cid/products/:pid - Actualizar cantidad de un producto específico
router.put('/:cid/products/:pid', updateProductQuantity);

// DELETE /api/carts/:cid - Eliminar todos los productos del carrito
router.delete('/:cid', clearCart);

module.exports = router;