const Cart = require('../models/Cart');
const Product = require('../models/Product');

class CartManager {
  constructor() {
    // Ya no necesitamos archivos, usamos MongoDB
  }

  // Crear un nuevo carrito vacío
  async create() {
    try {
      const newCart = new Cart();
      const savedCart = await newCart.save();
      
      return {
        ...savedCart.toObject(),
        id: savedCart._id.toString(),
        _id: undefined
      };
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  // Obtener todos los carritos
  async getAll() {
    try {
      const carts = await Cart.find().populate({
        path: 'products.product',
        select: 'title description code price category stock status'
      }).lean();
      
      return carts.map(cart => ({
        ...cart,
        id: cart._id.toString(),
        _id: undefined
      }));
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  }

  // Obtener carrito por ID con productos poblados
  async getById(cartId) {
    try {
      const cart = await Cart.findByIdWithProducts(cartId).lean();
      if (!cart) return null;
      
      // Transformar productos para agregar campo id
      const transformedProducts = cart.products.map(item => ({
        ...item,
        product: {
          ...item.product,
          id: item.product._id.toString(),
          _id: undefined
        }
      }));
      
      return {
        ...cart,
        id: cart._id.toString(),
        _id: undefined,
        products: transformedProducts
      };
    } catch (error) {
      console.error('Error en getById:', error);
      return null;
    }
  }

  // Agregar producto al carrito
  async addProduct(cartId, productId, quantity = 1) {
    try {
      // Verificar que el producto existe
      const productExists = await Product.findById(productId);
      if (!productExists) {
        throw new Error('El producto no existe');
      }

      // Verificar que el carrito existe
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error('El carrito no existe');
      }

      // Agregar o actualizar producto en el carrito
      cart.addProduct(productId, quantity);
      await cart.save();

      // Retornar carrito con productos poblados
      const updatedCart = await Cart.findByIdWithProducts(cartId).lean();
      return {
        ...updatedCart,
        id: updatedCart._id.toString(),
        _id: undefined
      };
    } catch (error) {
      console.error('Error en addProduct:', error);
      throw error;
    }
  }

  // Eliminar producto específico del carrito
  async removeProduct(cartId, productId) {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error('El carrito no existe');
      }

      const wasRemoved = cart.removeProduct(productId);
      if (!wasRemoved) {
        throw new Error('El producto no está en el carrito');
      }

      await cart.save();

      // Retornar carrito actualizado con productos poblados
      const updatedCart = await Cart.findByIdWithProducts(cartId).lean();
      return {
        ...updatedCart,
        id: updatedCart._id.toString(),
        _id: undefined
      };
    } catch (error) {
      console.error('Error en removeProduct:', error);
      throw error;
    }
  }

  // Actualizar cantidad de un producto específico
  async updateProductQuantity(cartId, productId, quantity) {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error('El carrito no existe');
      }

      const wasUpdated = cart.updateProductQuantity(productId, quantity);
      if (!wasUpdated) {
        throw new Error('El producto no está en el carrito');
      }

      await cart.save();

      // Retornar carrito actualizado con productos poblados
      const updatedCart = await Cart.findByIdWithProducts(cartId).lean();
      return {
        ...updatedCart,
        id: updatedCart._id.toString(),
        _id: undefined
      };
    } catch (error) {
      console.error('Error en updateProductQuantity:', error);
      throw error;
    }
  }

  // Actualizar todo el carrito con un nuevo array de productos
  async updateCart(cartId, products) {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error('El carrito no existe');
      }

      // Validar que todos los productos existen
      for (const item of products) {
        const productExists = await Product.findById(item.product);
        if (!productExists) {
          throw new Error(`El producto ${item.product} no existe`);
        }
        
        if (!item.quantity || item.quantity < 1) {
          throw new Error('La cantidad debe ser mayor a 0');
        }
      }

      // Actualizar productos del carrito
      cart.products = products;
      await cart.save();

      // Retornar carrito actualizado con productos poblados
      const updatedCart = await Cart.findByIdWithProducts(cartId).lean();
      return {
        ...updatedCart,
        id: updatedCart._id.toString(),
        _id: undefined
      };
    } catch (error) {
      console.error('Error en updateCart:', error);
      throw error;
    }
  }

  // Eliminar todos los productos del carrito
  async clearCart(cartId) {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error('El carrito no existe');
      }

      const hadProducts = cart.clearCart();
      await cart.save();

      return {
        ...cart.toObject(),
        id: cart._id.toString(),
        _id: undefined,
        cleared: hadProducts
      };
    } catch (error) {
      console.error('Error en clearCart:', error);
      throw error;
    }
  }

  // Eliminar carrito completamente
  async deleteCart(cartId) {
    try {
      const deletedCart = await Cart.findByIdAndDelete(cartId).lean();
      if (!deletedCart) {
        throw new Error('El carrito no existe');
      }

      return {
        ...deletedCart,
        id: deletedCart._id.toString(),
        _id: undefined
      };
    } catch (error) {
      console.error('Error en deleteCart:', error);
      throw error;
    }
  }
}

module.exports = CartManager;