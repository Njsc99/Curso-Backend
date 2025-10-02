const CartManager = require('../managers/CartManager');
const cartManager = new CartManager();

// POST / - Crear un nuevo carrito
async function createCart(req, res) {
  try {
    const newCart = await cartManager.create();
    res.status(201).json({
      status: 'success',
      message: 'Carrito creado exitosamente',
      payload: newCart
    });
  } catch (error) {
    console.error('Error en createCart:', error);
    res.status(500).json({ 
      status: 'error', 
      error: error.message 
    });
  }
}

// GET /:cid - Obtener carrito por ID con productos completos (populate)
async function getCartById(req, res) {
  try {
    const cart = await cartManager.getById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ 
        status: 'error', 
        error: 'Carrito no encontrado' 
      });
    }

    res.json({
      status: 'success',
      payload: cart
    });
  } catch (error) {
    console.error('Error en getCartById:', error);
    res.status(500).json({ 
      status: 'error', 
      error: error.message 
    });
  }
}

// POST /:cid/product/:pid - Agregar producto al carrito
async function addProductToCart(req, res) {
  try {
    const { cid, pid } = req.params;
    const { quantity = 1 } = req.body;

    // Validar cantidad
    if (quantity < 1) {
      return res.status(400).json({ 
        status: 'error', 
        error: 'La cantidad debe ser mayor a 0' 
      });
    }

    const updatedCart = await cartManager.addProduct(cid, pid, quantity);
    
    res.json({
      status: 'success',
      message: 'Producto agregado al carrito exitosamente',
      payload: updatedCart
    });
  } catch (error) {
    console.error('Error en addProductToCart:', error);
    
    if (error.message.includes('no existe')) {
      return res.status(404).json({ 
        status: 'error', 
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      status: 'error', 
      error: error.message 
    });
  }
}

// DELETE /:cid/products/:pid - Eliminar producto específico del carrito
async function removeProductFromCart(req, res) {
  try {
    const { cid, pid } = req.params;
    const updatedCart = await cartManager.removeProduct(cid, pid);
    
    res.json({
      status: 'success',
      message: 'Producto eliminado correctamente',
      payload: updatedCart
    });
  } catch (error) {
    if (error.message.includes('no existe') || error.message.includes('no está en el carrito')) {
      return res.status(404).json({ 
        status: 'error', 
        error: 'No pudimos encontrar ese producto en tu carrito' 
      });
    }
    
    res.status(500).json({ 
      status: 'error', 
      error: 'Hubo un problema al eliminar el producto. Intenta nuevamente.' 
    });
  }
}

// PUT /:cid - Actualizar todo el carrito con un array de productos
async function updateCart(req, res) {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    // Validar que se envió un array de productos
    if (!Array.isArray(products)) {
      return res.status(400).json({ 
        status: 'error', 
        error: 'Se debe enviar un array de productos en el campo "products"' 
      });
    }

    // Validar estructura de productos
    for (const item of products) {
      if (!item.product || !item.quantity) {
        return res.status(400).json({ 
          status: 'error', 
          error: 'Cada producto debe tener "product" (ID) y "quantity" (número)' 
        });
      }
    }

    const updatedCart = await cartManager.updateCart(cid, products);
    
    res.json({
      status: 'success',
      message: 'Carrito actualizado exitosamente',
      payload: updatedCart
    });
  } catch (error) {
    console.error('Error en updateCart:', error);
    
    if (error.message.includes('no existe')) {
      return res.status(404).json({ 
        status: 'error', 
        error: error.message 
      });
    }
    
    if (error.message.includes('cantidad')) {
      return res.status(400).json({ 
        status: 'error', 
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      status: 'error', 
      error: error.message 
    });
  }
}

// PUT /:cid/products/:pid - Actualizar cantidad de un producto específico
async function updateProductQuantity(req, res) {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    // Validar cantidad
    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ 
        status: 'error', 
        error: 'La cantidad debe ser un número mayor o igual a 0' 
      });
    }

    const updatedCart = await cartManager.updateProductQuantity(cid, pid, quantity);
    
    res.json({
      status: 'success',
      message: quantity === 0 ? 'Producto eliminado del carrito' : 'Cantidad actualizada exitosamente',
      payload: updatedCart
    });
  } catch (error) {
    console.error('Error en updateProductQuantity:', error);
    
    if (error.message.includes('no existe') || error.message.includes('no está en el carrito')) {
      return res.status(404).json({ 
        status: 'error', 
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      status: 'error', 
      error: error.message 
    });
  }
}

// DELETE /:cid - Eliminar todos los productos del carrito
async function clearCart(req, res) {
  try {
    const { cid } = req.params;

    const result = await cartManager.clearCart(cid);
    
    res.json({
      status: 'success',
      message: result.cleared ? 'Carrito vaciado exitosamente' : 'El carrito ya estaba vacío',
      payload: result
    });
  } catch (error) {
    console.error('Error en clearCart:', error);
    
    if (error.message.includes('no existe')) {
      return res.status(404).json({ 
        status: 'error', 
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      status: 'error', 
      error: error.message 
    });
  }
}

// Función adicional para obtener todos los carritos (opcional)
async function getAllCarts(req, res) {
  try {
    const carts = await cartManager.getAll();
    
    res.json({
      status: 'success',
      payload: carts
    });
  } catch (error) {
    console.error('Error en getAllCarts:', error);
    res.status(500).json({ 
      status: 'error', 
      error: error.message 
    });
  }
}

module.exports = {
  createCart,
  getCartById,
  addProductToCart,
  removeProductFromCart,
  updateCart,
  updateProductQuantity,
  clearCart,
  getAllCarts
};