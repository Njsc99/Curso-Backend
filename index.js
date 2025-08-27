const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Clase para Productos

class ProductManager {
  constructor(filename = 'products.json') {
    this.file = path.join(__dirname, filename);
  }

  async getAll() {
    try {
      const data = await fs.readFile(this.file, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async getById(id) {
    const products = await this.getAll();
    return products.find(product => String(product.id) === String(id));
  }

  async add(product) {
    const products = await this.getAll();
    product.id = crypto.randomUUID();
    products.push(product);
    await fs.writeFile(this.file, JSON.stringify(products, null, 2));
    return product;
  }

  async update(id, updateFields) {
    const products = await this.getAll();
    const idx = products.findIndex(product => String(product.id) === String(id));
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...updateFields, id: products[idx].id };
    await fs.writeFile(this.file, JSON.stringify(products, null, 2));
    return products[idx];
  }

  async delete(id) {
    const products = await this.getAll();
    const idx = products.findIndex(product => String(product.id) === String(id));
    if (idx === -1) return null;
    const [deleted] = products.splice(idx, 1);
    await fs.writeFile(this.file, JSON.stringify(products, null, 2));
    return deleted;
  }
}

// Clase para carrito de compra

class CartManager {
  constructor(filename = 'carts.json') {
    this.file = path.join(__dirname, filename);
  }

  async getAll() {
    try {
      const data = await fs.readFile(this.file, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async getById(id) {
    const carts = await this.getAll();
    return carts.find(cart => String(cart.id) === String(id));
  }

  async addCart() {
    const carts = await this.getAll();
    const newCart = {
      id: crypto.randomUUID(),
      products: []
    };
    carts.push(newCart);
    await fs.writeFile(this.file, JSON.stringify(carts, null, 2));
    return newCart;
  }

  async addProductToCart(cid, pid) {
    const carts = await this.getAll();
    const cart = carts.find(cart => String(cart.id) === String(cid));
    if (!cart) return null;
    const prodInCart = cart.products.find(item => String(item.product) === String(pid));
    if (prodInCart) {
      prodInCart.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }
    await fs.writeFile(this.file, JSON.stringify(carts, null, 2));
    return cart;
  }
}

const productManager = new ProductManager();
const cartManager = new CartManager();

// Rutas para productos

app.get('/api/products', async (req, res) => {
  const products = await productManager.getAll();
  res.json(products);
});

app.get('/api/products/:pid', async (req, res) => {
  const product = await productManager.getById(req.params.pid);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(product);
});

app.post('/api/products', async (req, res) => {
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

app.put('/api/products/:pid', async (req, res) => {
  const { id, ...rest } = req.body;
  const updated = await productManager.update(req.params.pid, rest);
  if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(updated);
});

app.delete('/api/products/:pid', async (req, res) => {
  const deleted = await productManager.delete(req.params.pid);
  if (!deleted) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(deleted);
});

// Rutas para carrito de compra

app.post('/api/carts', async (req, res) => {
  const newCart = await cartManager.addCart();
  res.status(201).json(newCart);
});

app.get('/api/carts/:cid', async (req, res) => {
  const cart = await cartManager.getById(req.params.cid);
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
  res.json(cart.products);
});

app.post('/api/carts/:cid/product/:pid', async (req, res) => {
  const product = await productManager.getById(req.params.pid);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

  const cart = await cartManager.addProductToCart(req.params.cid, req.params.pid);
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
  res.status(200).json(cart);
});

app.get('/', (req, res) => {
  res.status(200).send('Hello World!');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});