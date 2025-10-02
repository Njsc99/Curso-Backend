const Product = require('../models/Product');

class ProductManager {
  constructor() {
    // Ya no necesitamos archivos, usamos MongoDB
  }

  async getAll(options = {}) {
    try {
      const {
        limit = 10,
        page = 1,
        sort = null,
        query = null,
        category = null,
        status = null
      } = options;

      // Construir filtro de búsqueda
      let filter = {};
      
      // Filtro por categoría específica
      if (category) {
        filter.category = { $regex: category, $options: 'i' };
      }

      // Filtro por disponibilidad
      if (status !== null) {
        filter.status = status === 'true' || status === true;
      }

      // Filtro de búsqueda general
      if (query) {
        // Si query es un objeto, aplicarlo directamente
        if (typeof query === 'object') {
          filter = { ...filter, ...query };
        } 
        // Si query es string, buscar en title, description o category
        else {
          const searchRegex = { $regex: query, $options: 'i' };
          filter.$or = [
            { title: searchRegex },
            { description: searchRegex },
            { category: searchRegex }
          ];
        }
      }

      // Configurar opciones de paginación
      const paginateOptions = {
        page: parseInt(page),
        limit: parseInt(limit),
        lean: true, // Mejora performance
        leanWithId: false, // No agregar campo virtual id
      };

      // Aplicar ordenamiento
      if (sort) {
        if (sort === 'asc') {
          paginateOptions.sort = { price: 1 };
        } else if (sort === 'desc') {
          paginateOptions.sort = { price: -1 };
        }
      }

      // Usar mongoose-paginate-v2
      const result = await Product.paginate(filter, paginateOptions);
      
      // Convertir _id a id para compatibilidad con frontend
      const docs = result.docs.map(product => ({
        ...product,
        id: product._id.toString(),
        _id: undefined
      }));

      return {
        docs,
        totalDocs: result.totalDocs,
        limit: result.limit,
        page: result.page,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
        nextPage: result.nextPage,
        prevPage: result.prevPage,
        pagingCounter: result.pagingCounter
      };
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const product = await Product.findById(id).lean();
      if (!product) return null;
      
      return {
        ...product,
        id: product._id.toString(),
        _id: undefined
      };
    } catch (error) {
      console.error('Error en getById:', error);
      return null;
    }
  }

  async add(productData) {
    try {
      const product = new Product(productData);
      const savedProduct = await product.save();
      
      return {
        ...savedProduct.toObject(),
        id: savedProduct._id.toString(),
        _id: undefined
      };
    } catch (error) {
      console.error('Error en add:', error);
      throw error;
    }
  }

  async update(id, updateFields) {
    try {
      // Remover campos que no se deben actualizar
      const { _id, createdAt, updatedAt, ...cleanFields } = updateFields;
      
      const updatedProduct = await Product.findByIdAndUpdate(
        id, 
        cleanFields, 
        { 
          new: true, // Retornar el documento actualizado
          runValidators: true // Ejecutar validaciones del esquema
        }
      ).lean();
      
      if (!updatedProduct) return null;
      
      return {
        ...updatedProduct,
        id: updatedProduct._id.toString(),
        _id: undefined
      };
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const deletedProduct = await Product.findByIdAndDelete(id).lean();
      if (!deletedProduct) return null;
      
      return {
        ...deletedProduct,
        id: deletedProduct._id.toString(),
        _id: undefined
      };
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  // Métodos adicionales específicos para MongoDB
  async getByCategory(category) {
    try {
      const products = await Product.findByCategory(category).lean();
      return products.map(product => ({
        ...product,
        id: product._id.toString(),
        _id: undefined
      }));
    } catch (error) {
      console.error('Error en getByCategory:', error);
      throw error;
    }
  }

  async getActiveProducts() {
    try {
      const products = await Product.findActive().lean();
      return products.map(product => ({
        ...product,
        id: product._id.toString(),
        _id: undefined
      }));
    } catch (error) {
      console.error('Error en getActiveProducts:', error);
      throw error;
    }
  }


}

module.exports = ProductManager;