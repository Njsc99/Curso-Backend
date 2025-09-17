const socket = io();

function renderProducts(products) {
  const list = document.getElementById('product-list');
  list.innerHTML = '';
  products.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `${p.title} - ${p.price} <button onclick="deleteProduct('${p.id}')">Eliminar</button>`;
    list.appendChild(li);
  });
}

socket.on('productsUpdated', (products) => {
  renderProducts(products);
});

document.getElementById('add-product-form').addEventListener('submit', async (e) => {
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
  await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
  form.reset();
});

window.deleteProduct = async function(id) {
  await fetch(`/api/products/${id}`, { method: 'DELETE' });
};
