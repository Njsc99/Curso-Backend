const ProductManager = require('../managers/ProductManager');
const productManager = new ProductManager();

async function getAllProducts(req, res) {
  try {
    const products = await productManager.getAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    // Emitir actualización de productos por websocket
    const io = req.app.get('socketio');
    if (io) {
      const productosActualizados = await productManager.getAll();
      io.emit('productsUpdated', productosActualizados);
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
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const deleted = await productManager.delete(req.params.pid);
    if (!deleted) return res.status(404).json({ error: 'Producto no encontrado' });
    // Emitir actualización de productos por websocket
    const io = req.app.get('socketio');
    if (io) {
      const productosActualizados = await productManager.getAll();
      io.emit('productsUpdated', productosActualizados);
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