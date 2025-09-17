(function() {
  if (!window.socket) {
    window.socket = io();
    window.socket.on('connect', () => {
      console.log('Conectado al servidor Socket.io');
    });
    window.socket.on('disconnect', () => {
      console.log('Desconectado del servidor Socket.io');
    });
  }
})();