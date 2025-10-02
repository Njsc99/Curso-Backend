
const express = require('express');
const app = express();

const multer = require('multer'); 

const handlebars = require('express-handlebars');
const { paths } = require("./config/config");

// Importar configuración de base de datos
const dbConnection = require('./config/database');

const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const viewsRouter = require('./routes/views.router');

// SETEO DE HANDLEBARS
app.engine('hbs', handlebars.engine({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: {
    // Helper para multiplicar
    multiply: function(a, b) {
      return (a * b).toFixed(2);
    },
    // Helper para comparar igualdad
    eq: function(a, b) {
      return a === b;
    },
    // Helper para comparar mayor que
    gt: function(a, b) {
      return a > b;
    },
    // Helper para comparar menor que
    lt: function(a, b) {
      return a < b;
    },
    // Helper para sumar
    add: function(a, b) {
      return a + b;
    },
    // Helper para restar
    sub: function(a, b) {
      return a - b;
    },
    // Helper para máximo
    max: function(a, b) {
      return Math.max(a, b);
    },
    // Helper para mínimo
    min: function(a, b) {
      return Math.min(a, b);
    },
    // Helper para generar rango de números
    range: function(start, end) {
      const result = [];
      for (let i = start; i <= end; i++) {
        result.push(i);
      }
      return result;
    },
    // Helper para obtener primer elemento de array
    first: function(array) {
      return array && array.length > 0 ? array[0] : null;
    },
    // Helper para verificar si array tiene elementos
    hasItems: function(array) {
      return array && array.length > 0;
    }
  }
}));
app.set('view engine', 'hbs');
app.set('views', paths.views);

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(paths.public));

// Config Multer

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Socket.io
const http = require('http');
const httpServer = http.createServer(app);

const io = require('socket.io')(httpServer);

// Importar ProductManager para usar en los eventos de socket
const ProductManager = require('./managers/ProductManager');
const productManager = new ProductManager();

io.on('connection', async (socket) => {
  // Enviar lista de productos al cliente cuando se conecta
  try {
    const products = await productManager.getAll();
    socket.emit('productsUpdated', products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
  }

  // Manejar creación de productos por socket
  socket.on('createProduct', async (productData) => {
    try {
      const { title, description, code, price, status, stock, category, thumbnails } = productData;
      
      // Validar campos obligatorios
      if (!title || !description || !code || price == null || status == null || stock == null || !category) {
        socket.emit('productError', { error: 'Faltan campos obligatorios' });
        return;
      }
      
      // Crear el producto
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
      
      // Emitir la lista actualizada a todos los clientes
      const updatedProducts = await productManager.getAll();
      io.emit('productsUpdated', updatedProducts);
      
      socket.emit('productCreated', newProduct);
    } catch (error) {
      socket.emit('productError', { error: error.message });
    }
  });

  // Manejar eliminación de productos por socket
  socket.on('deleteProduct', async (productId) => {
    try {
      const deletedProduct = await productManager.delete(productId);
      
      if (!deletedProduct) {
        socket.emit('productError', { error: 'Producto no encontrado' });
        return;
      }
      
      // Emitir la lista actualizada a todos los clientes
      const updatedProducts = await productManager.getAll();
      io.emit('productsUpdated', updatedProducts);
      
      socket.emit('productDeleted', deletedProduct);
    } catch (error) {
      socket.emit('productError', { error: error.message });
    }
  });

  socket.on('disconnect', () => {
    // Cliente desconectado
  });
});
app.set('socketio', io);

// RUTAS
app.use('/', viewsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// RUTA RAIZ
app.get('/', (req, res) => {
  return res.render("pages/home", {});
});

// Función para inicializar la aplicación con base de datos
async function initializeApp() {
  try {
    // Conectar a MongoDB
    await dbConnection.connect();
    return true;
  } catch (error) {
    console.error('ERROR: Error al inicializar la aplicación:', error);
    return false;
  }
}

module.exports = { app, httpServer, initializeApp };