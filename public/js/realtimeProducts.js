const socket = io();

function renderProducts(products) {
  const list = document.getElementById('product-list');
  list.innerHTML = '';
  
  if (products.length === 0) {
    list.innerHTML = '<li>No hay productos disponibles</li>';
    return;
  }
  
  products.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${p.title}</strong> - $${p.price}
      <br>Código: ${p.code} | Stock: ${p.stock} | Categoría: ${p.category}
      <br>${p.description}
      <br><button onclick="deleteProduct('${p.id}')" class="delete-btn">Eliminar</button>
      <hr>
    `;
    list.appendChild(li);
  });
}

// Escuchar actualizaciones de productos
socket.on('productsUpdated', (products) => {
  renderProducts(products);
});

// Escuchar confirmación de creación de producto
socket.on('productCreated', (product) => {
  showMessage('Producto creado exitosamente', 'success');
});

// Escuchar confirmación de eliminación de producto
socket.on('productDeleted', (product) => {
  showMessage('Producto eliminado exitosamente', 'success');
});

// Escuchar errores
socket.on('productError', (error) => {
  showMessage('Error: ' + error.error, 'error');
});

// Función para mostrar mensajes al usuario
function showMessage(message, type) {
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  messageDiv.className = `message ${type}`;
  messageDiv.style.cssText = `
    padding: 10px;
    margin: 10px 0;
    border-radius: 4px;
    ${type === 'success' ? 'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : 'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'}
  `;
  
  const container = document.querySelector('.container') || document.body;
  container.insertBefore(messageDiv, container.firstChild);
  
  // Remover el mensaje después de 3 segundos
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.parentNode.removeChild(messageDiv);
    }
  }, 3000);
}

// Manejar el formulario de creación de productos usando WebSocket
document.getElementById('add-product-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  
  const product = {
    title: form.title.value,
    description: form.description.value,
    code: form.code.value,
    price: Number(form.price.value),
    category: form.category.value,
    stock: Number(form.stock.value),
    status: form.status.value === 'true',
    thumbnails: []
  };
  
  // Emitir evento para crear producto por socket
  socket.emit('createProduct', product);
  form.reset();
});

// Función para eliminar producto usando WebSocket
window.deleteProduct = function(id) {
  if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
    socket.emit('deleteProduct', id);
  }
};

// Escuchar cuando se desconecta del socket
socket.on('disconnect', () => {
  showMessage('Conexión perdida con el servidor', 'error');
});
