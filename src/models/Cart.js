const mongoose = require('mongoose');

const cartProductSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Referencia al modelo Product
    required: [true, 'La referencia del producto es obligatoria']
  },
  quantity: {
    type: Number,
    required: [true, 'La cantidad es obligatoria'],
    min: [1, 'La cantidad debe ser mayor a 0'],
    default: 1
  }
}, {
  _id: false // No generar _id para subdocumentos
});

const cartSchema = new mongoose.Schema({
  products: {
    type: [cartProductSchema],
    default: []
  }
}, {
  timestamps: true, // Agrega createdAt y updatedAt
  versionKey: false // Elimina __v
});

// Índices para mejorar el rendimiento
cartSchema.index({ 'products.product': 1 });
cartSchema.index({ createdAt: -1 });

// Método para obtener el total de productos en el carrito
cartSchema.methods.getTotalItems = function() {
  return this.products.reduce((total, item) => total + item.quantity, 0);
};

// Método para obtener el precio total del carrito (requiere populate)
cartSchema.methods.getTotalPrice = function() {
  if (!this.products.some(item => item.product.price !== undefined)) {
    throw new Error('Los productos deben estar poblados para calcular el precio total');
  }
  return this.products.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
};

// Método para verificar si un producto existe en el carrito
cartSchema.methods.hasProduct = function(productId) {
  return this.products.some(item => item.product.toString() === productId.toString());
};

// Método para encontrar el índice de un producto en el carrito
cartSchema.methods.findProductIndex = function(productId) {
  return this.products.findIndex(item => item.product.toString() === productId.toString());
};

// Método para agregar o actualizar un producto en el carrito
cartSchema.methods.addProduct = function(productId, quantity = 1) {
  const existingIndex = this.findProductIndex(productId);
  
  if (existingIndex !== -1) {
    // Si el producto ya existe, aumentar la cantidad
    this.products[existingIndex].quantity += quantity;
  } else {
    // Si no existe, agregarlo
    this.products.push({
      product: productId,
      quantity: quantity
    });
  }
};

// Método para actualizar la cantidad de un producto específico
cartSchema.methods.updateProductQuantity = function(productId, quantity) {
  const existingIndex = this.findProductIndex(productId);
  
  if (existingIndex !== -1) {
    if (quantity <= 0) {
      // Si la cantidad es 0 o menor, eliminar el producto
      this.products.splice(existingIndex, 1);
    } else {
      // Actualizar la cantidad
      this.products[existingIndex].quantity = quantity;
    }
    return true;
  }
  return false; // Producto no encontrado
};

// Método para eliminar un producto del carrito
cartSchema.methods.removeProduct = function(productId) {
  const initialLength = this.products.length;
  this.products = this.products.filter(item => 
    item.product.toString() !== productId.toString()
  );
  return this.products.length !== initialLength; // true si se eliminó algo
};

// Método para limpiar todo el carrito
cartSchema.methods.clearCart = function() {
  const hadProducts = this.products.length > 0;
  this.products = [];
  return hadProducts;
};

// Método estático para obtener un carrito con productos poblados
cartSchema.statics.findByIdWithProducts = function(cartId) {
  return this.findById(cartId).populate({
    path: 'products.product',
    select: 'title description code price category stock status' // Seleccionar solo campos necesarios
  });
};

// Middleware pre-save para validar que las cantidades sean positivas
cartSchema.pre('save', function(next) {
  // Filtrar productos con cantidad <= 0
  this.products = this.products.filter(item => item.quantity > 0);
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;