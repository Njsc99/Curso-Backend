
const express = require('express');
const app = express();

const multer = require('multer'); 

const handlebars = require('express-handlebars');
const { paths } = require("./config/config");

const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const viewsRouter = require('./routes/views.router');

// SETEO DE HANDLEBARS
app.engine('hbs', handlebars.engine({
  extname: '.hbs',
  defaultLayout: 'main',
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

io.on('connection', (socket) => {
  console.log(`Nuevo cliente ${socket.id} conectado`);
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
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

module.exports = { app, httpServer };