const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class CartManager {
  constructor(filename = 'carts.json') {
    this.file = path.join(__dirname, '..', '..', 'products.json');
  }

  async getAll() {
    try {
      const data = await fs.readFile(this.file, 'utf-8');
      return JSON.parse(data);
    } catch {
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

module.exports = CartManager;