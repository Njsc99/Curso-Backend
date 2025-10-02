const mongoose = require('mongoose');
const { mongodb } = require('../config/config');

class DatabaseConnection {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      if (this.connection) {
        return this.connection;
      }

      this.connection = await mongoose.connect(mongodb.uri);
      console.log('Conectado exitosamente a MongoDB Atlas');
      
      // Eventos de conexión
      mongoose.connection.on('error', (err) => {
        console.error('ERROR: Error de conexión con MongoDB:', err);
      });

      return this.connection;
    } catch (error) {
      console.error('ERROR: Error al conectar con MongoDB Atlas:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        this.connection = null;
      }
    } catch (error) {
      console.error('ERROR: Error al desconectar de MongoDB:', error);
      throw error;
    }
  }

  getConnection() {
    return this.connection;
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

// Exportar una instancia singleton
const dbConnection = new DatabaseConnection();
module.exports = dbConnection;