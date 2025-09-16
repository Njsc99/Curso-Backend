const express = require('express');
const app = express();
const port = 8080;

const handlebars = require('express-handlebars');
const path = require('path');

const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');

// SETEO DE HANDLEBARS
app.engine('hbs', handlebars.engine({
  extname: '.hbs',
  defaultLayout: 'main',
}));
app.set('view engine', 'hbs');

const paths = {
  views: path.join(__dirname, 'views')
};
app.set('views', paths.views);

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// RUTAS
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// RUTA RAIZ
app.get('/', (req, res) => {
  res.status(200).send('Hello World!');
});

// INICIO DEL SERVIDOR
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});