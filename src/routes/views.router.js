
const express = require('express');
const ProductManager = require('../managers/ProductManager');
const CartManager = require('../managers/CartManager');
const router = express.Router();

const productManager = new ProductManager();
const cartManager = new CartManager();

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12; // Mostrar más productos en home
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort;
    const query = req.query.query;
    const category = req.query.category;
    const status = req.query.status;

    // Obtener productos usando mongoose-paginate-v2
    const result = await productManager.getAll({
      limit,
      page,
      sort,
      query,
      category,
      status
    });

    // Construir URLs de navegación para la paginación
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    let prevLink = null;
    let nextLink = null;
    
    if (result.hasPrevPage) {
      const prevParams = new URLSearchParams(req.query);
      prevParams.set('page', result.prevPage.toString());
      prevLink = `${baseUrl}/?${prevParams.toString()}`;
    }
    
    if (result.hasNextPage) {
      const nextParams = new URLSearchParams(req.query);
      nextParams.set('page', result.nextPage.toString());
      nextLink = `${baseUrl}/?${nextParams.toString()}`;
    }

    res.render('pages/home', { 
      title: 'Catálogo - E-Commerce Backend',
      products: result.docs,
      pagination: {
        totalPages: result.totalPages,
        currentPage: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        prevLink,
        nextLink,
        totalDocs: result.totalDocs,
        limit: result.limit
      },
      filters: {
        query,
        category,
        status,
        sort,
        limit
      }
    });
  } catch (error) {
    console.error('Error en ruta home:', error);
    res.render('pages/home', { 
      title: 'Inicio',
      products: [], 
      error: 'Error al cargar productos' 
    });
  }
});

router.get('/realtimeproducts', async (req, res) => {
  try {
    const result = await productManager.getAll({ limit: 50 }); // Obtener más productos para tiempo real
    res.render('pages/realTimeProducts', { 
      title: 'Productos en Tiempo Real',
      products: result.docs, // Usar result.docs en lugar de result
      useSocket: true
    });
  } catch (error) {
    console.error('Error en ruta realTimeProducts:', error);
    res.render('pages/realTimeProducts', { 
      title: 'Productos en Tiempo Real',
      products: [], 
      error: 'Error al cargar productos',
      useSocket: true
    });
  }
});

// Nueva ruta: Lista de productos con paginación
router.get('/products', async (req, res) => {
  try {
    // Obtener parámetros de query con valores por defecto
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort;
    const query = req.query.query;
    const category = req.query.category;
    const status = req.query.status;

    // Obtener productos usando mongoose-paginate-v2
    const result = await productManager.getAll({
      limit,
      page,
      sort,
      query,
      category,
      status
    });

    // Construir URLs de navegación para la paginación
    const baseUrl = `/products`;
    
    let prevLink = null;
    let nextLink = null;
    
    if (result.hasPrevPage) {
      const prevParams = new URLSearchParams(req.query);
      prevParams.set('page', result.prevPage.toString());
      prevLink = `${baseUrl}?${prevParams.toString()}`;
    }
    
    if (result.hasNextPage) {
      const nextParams = new URLSearchParams(req.query);
      nextParams.set('page', result.nextPage.toString());
      nextLink = `${baseUrl}?${nextParams.toString()}`;
    }

    res.render('pages/products', {
      title: 'Catálogo de Productos',
      products: result.docs,
      pagination: {
        totalPages: result.totalPages,
        currentPage: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        prevLink,
        nextLink,
        totalDocs: result.totalDocs,
        limit: result.limit
      },
      filters: {
        query,
        category,
        status,
        sort,
        limit
      }
    });
  } catch (error) {
    console.error('Error en ruta products:', error);
    res.render('pages/products', { 
      products: [], 
      error: 'Error al cargar productos',
      pagination: { currentPage: 1, totalPages: 0 },
      filters: {}
    });
  }
});

// Nueva ruta: Detalle de producto individual
router.get('/products/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productManager.getById(pid);
    
    if (!product) {
      return res.render('pages/product-detail', { 
        title: 'Producto no encontrado',
        error: 'Producto no encontrado',
        product: null 
      });
    }

    res.render('pages/product-detail', { 
      title: product.title,
      product 
    });
  } catch (error) {
    console.error('Error en ruta product detail:', error);
    res.render('pages/product-detail', { 
      error: 'Error al cargar el producto',
      product: null 
    });
  }
});

// Nueva ruta: Ver carrito específico
router.get('/carts/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartManager.getById(cid);
    
    if (!cart) {
      return res.render('pages/cart', { 
        title: 'Carrito no encontrado',
        error: 'Carrito no encontrado',
        cart: null 
      });
    }

    // Calcular totales
    let totalItems = 0;
    let totalPrice = 0;
    
    if (cart.products) {
      totalItems = cart.products.reduce((sum, item) => sum + item.quantity, 0);
      totalPrice = cart.products.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
      }, 0);
    }

    res.render('pages/cart', { 
      title: `Carrito ${cart.id.substring(0, 8)}...`,
      cart,
      totals: {
        totalItems,
        totalPrice: totalPrice.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error en ruta cart:', error);
    res.render('pages/cart', { 
      error: 'Error al cargar el carrito',
      cart: null,
      totals: { totalItems: 0, totalPrice: '0.00' }
    });
  }
});

module.exports = router;
