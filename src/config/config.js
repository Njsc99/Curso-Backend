const path = require('path');

const paths = {
  views: path.join(__dirname, '../views'),
  public: path.join(__dirname, '../../public')
};

// Configuración de MongoDB Atlas usando variables de entorno
const mongodb = {
  uri: process.env.MONGODB_URI,
  dbName: process.env.DB_NAME || 'ecomerce'
};

// Validar que las variables de entorno críticas estén presentes
if (!mongodb.uri) {
  throw new Error('ERROR: MONGODB_URI no está definida en las variables de entorno. Verifica tu archivo .env');
}

// Configuración del servidor
const server = {
  port: process.env.PORT || 8081,
  nodeEnv: process.env.NODE_ENV || 'development'
};

module.exports = { paths, mongodb, server };

