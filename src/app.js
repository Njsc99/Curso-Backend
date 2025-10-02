
const express = require('express');
const app = express();

const multer = require('multer'); 

const handlebars = require('express-handlebars');
const { paths } = require("./config/config");

const dbConnection = require('./config/database');

const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const viewsRouter = require('./routes/views.router');

app.engine('hbs', handlebars.engine({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: {
    multiply: function(a, b) {
      return (a * b).toFixed(2);
    },
    eq: function(a, b) {
      return a === b;
    },
    gt: function(a, b) {
      return a > b;
    },
    lt: function(a, b) {
      return a < b;
    },
    add: function(a, b) {
      return a + b;
    },
    sub: function(a, b) {
      return a - b;
    },
    max: function(a, b) {
      return Math.max(a, b);
    },
    min: function(a, b) {
      return Math.min(a, b);
    },
    range: function(start, end) {
      const result = [];
      for (let i = start; i <= end; i++) {
        result.push(i);
      }
      return result;
    },
    first: function(array) {
      return array && array.length > 0 ? array[0] : null;
    },
    hasItems: function(array) {
      return array && array.length > 0;
    }
  }
}));
app.set('view engine', 'hbs');
app.set('views', paths.views);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(paths.public));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

const http = require('http');
const httpServer = http.createServer(app);
const io = require('socket.io')(httpServer);

const ProductManager = require('./managers/ProductManager');
const productManager = new ProductManager();

io.on('connection', async (socket) => {
  try {
    const products = await productManager.getAll();
    socket.emit('productsUpdated', products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
  }

  socket.on('createProduct', async (productData) => {
    try {
      const { title, description, code, price, status, stock, category, thumbnails } = productData;
      
      if (!title || !description || !code || price == null || status == null || stock == null || !category) {
        socket.emit('productError', { error: 'Faltan campos obligatorios' });
        return;
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

app.use('/', viewsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.get('/', (req, res) => {
  return res.render("pages/home", {});
});

async function initializeApp() {
  try {
    await dbConnection.connect();
    return true;
  } catch (error) {
    console.error('ERROR: Error al inicializar la aplicación:', error);
    return false;
  }
}

module.exports = { app, httpServer, initializeApp };