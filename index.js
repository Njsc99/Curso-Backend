require('dotenv').config();

const { app, httpServer, initializeApp } = require('./src/app');
const { server } = require('./src/config/config');
const port = server.port;

async function startServer() {
  try {
    const initialized = await initializeApp();
    
    if (!initialized) {
      console.error('ERROR: No se pudo inicializar la aplicación');
      process.exit(1);
    }

    httpServer.listen(port, () => {
      console.log(`Servidor escuchando en http://localhost:${port}`);
    });

  } catch (error) {
    console.error('ERROR: Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  try {
    const dbConnection = require('./src/config/database');
    await dbConnection.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('ERROR: Error al cerrar conexiones:', error);
    process.exit(1);
  }
});

startServer();