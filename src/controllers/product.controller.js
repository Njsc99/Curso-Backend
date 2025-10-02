const ProductManager = require('../managers/ProductManager');
const productManager = new ProductManager();

async function getAllProducts(req, res) {
  try {
    // Extraer query parameters con valores por defecto
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort; // 'asc' o 'desc' para ordenar por precio
    const query = req.query.query; // filtro de búsqueda general
    const category = req.query.category; // filtro específico por categoría
    const status = req.query.status; // filtro específico por disponibilidad

    // Validar parámetros
    if (limit <= 0) {
      return res.status(400).json({ 
        status: "error", 
        error: "El parámetro 'limit' debe ser un número positivo" 
      });
    }

    if (page <= 0) {
      return res.status(400).json({ 
        status: "error", 
        error: "El parámetro 'page' debe ser un número positivo" 
      });
    }

    if (sort && !['asc', 'desc'].includes(sort)) {
      return res.status(400).json({ 
        status: "error", 
        error: "El parámetro 'sort' debe ser 'asc' o 'desc'" 
      });
    }

    if (status && !['true', 'false'].includes(status)) {
      return res.status(400).json({ 
        status: "error", 
        error: "El parámetro 'status' debe ser 'true' o 'false'" 
      });
    }

    // Usar ProductManager con mongoose-paginate-v2
    const result = await productManager.getAll({
      limit,
      page,
      sort,
      query,
      category,
      status
    });

    // Construir URLs de navegación
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    
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

    // Respuesta con el formato exacto requerido
    const response = {
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink,
      nextLink
    };

    res.json(response);
  } catch (error) {
    console.error('Error en getAllProducts:', error);
    res.status(500).json({ 
      status: "error", 
      error: error.message 
    });
  }
}

async function getProductById(req, res) {
  try {
    const product = await productManager.getById(req.params.pid);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createProduct(req, res) {
  try {
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
    // Emitir evento de producto agregado por websocket
    const io = req.app.get('socketio');
    if (io) {
      io.emit('productAdded', newProduct);
    }
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateProduct(req, res) {
  try {
    const { id, ...rest } = req.body;
    const updated = await productManager.update(req.params.pid, rest);
    if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });
    
    // Emitir actualización de productos por websocket
    const io = req.app.get('socketio');
    if (io) {
      const productosActualizados = await productManager.getAll();
      io.emit('productsUpdated', productosActualizados);
    }
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const deleted = await productManager.delete(req.params.pid);
    if (!deleted) return res.status(404).json({ error: 'Producto no encontrado' });
    
    // Emitir evento de producto eliminado por websocket
    const io = req.app.get('socketio');
    if (io) {
      io.emit('productDeleted', req.params.pid);
    }
    
    res.json(deleted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};