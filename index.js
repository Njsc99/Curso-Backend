const { app, httpServer } = require('./src/app');
const port = 8080;

httpServer.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});