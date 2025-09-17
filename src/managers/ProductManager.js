const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class ProductManager {
  constructor(filename = 'products.json') {
    this.file = path.join(__dirname, '..', 'data', 'products.json');
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

module.exports = ProductManager;