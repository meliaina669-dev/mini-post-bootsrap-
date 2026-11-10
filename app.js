const rupiah = n => "Rp" + Number(n).toLocaleString("id-ID");

const defaultProducts = [
  {
    id: 1,
    name: "Nasi Goreng",
    price: 18000,
    stock: 15,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500"
  },
  {
    id: 2,
    name: "Mie Goreng",
    price: 15000,
    stock: 12,
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500"
  },
  {
    id: 3,
    name: "Ayam Geprek",
    price: 20000,
    stock: 10,
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500"
  },
  {
    id: 4,
    name: "Burger",
    price: 16000,
    stock: 8,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500"
  },
  {
    id: 5,
    name: "Kentang Goreng",
    price: 12000,
    stock: 20,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500"
  },
  {
    id: 6,
    name: "Es Teh Manis",
    price: 5000,
    stock: 25,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500"
  }
];

let products = JSON.parse(localStorage.getItem("posProducts")) || defaultProducts;
let cart = [];
let transactions = JSON.parse(localStorage.getItem("posTransactions")) || [];

function saveData() {
  localStorage.setItem("posProducts", JSON.stringify(products));
  localStorage.setItem("posTransactions", JSON.stringify(transactions));
}

function showPage(page, element) {
  document.querySelectorAll(".page-section").forEach(section => {
    section.classList.remove("active");
  });

  const target = document.getElementById(page);
  if (target) target.classList.add("active");

  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.remove("active");
  });

  if (element) element.classList.add("active");

  if (page === "cart") renderCart();
  if (page === "checkout") updateCheckout();
  if (page === "history") renderHistory();

  window.scrollTo(0, 0);
}

function getStockBadge(stock) {
  if (stock === 0) {
    return '<span class="badge badge-empty">Stok Habis</span>';
  }

  if (stock < 5) {
    return '<span class="badge badge-low">Stok Menipis</span>';
  }

  return '<span class="badge badge-safe">Stok Aman</span>';
}

function productCard(p) {
  return `
    <div class="col-6 col-md-4 col-lg-3">
      <div class="product-card">
        <img src="${escapeHTML(p.image || "")}"
        class="product-img"
        alt="${escapeHTML(p.name)}"
        onerror="this.src='https://placehold.co/500x300/ffe3ef/bd5e8d?text=Mini+POS'">

        <div class="product-body">
          <h6 class="fw-bold">${escapeHTML(p.name)}</h6>
          <p class="metric-value mb-2">${rupiah(p.price)}</p>
          <p class="mb-2">Stok: ${p.stock}</p>
          ${getStockBadge(p.stock)}

          <button class="btn btn-pink btn-sm w-100 mt-3"
          onclick="addToCart(${p.id})"
          ${p.stock === 0 ? "disabled" : ""}>
          ${p.stock === 0 ? "Stok Habis" : "Beli"}
          </button>
        </div>
      </div>
    </div>
  `;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function renderProducts() {
  const keyword = document.getElementById("searchProduct").value.toLowerCase();

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(keyword)
  );

  document.getElementById("productList").innerHTML =
    filtered.length
      ? filtered.map(productCard).join("")
      : "<p>Produk tidak ditemukan.</p>";
}

function renderHome() {
  document.getElementById("homeProducts").innerHTML =
    products.slice(0, 4).map(productCard).join("");
}

function renderManage() {
  document.getElementById("manageList").innerHTML = products.map(p => `
    <tr>
      <td>${escapeHTML(p.name)}</td>
      <td>${rupiah(p.price)}</td>
      <td>${p.stock}</td>
      <td>
        <button class="btn btn-sm btn-outline-pink mb-1"
        onclick="editProduct(${p.id})">Edit</button>

        <button class="btn btn-sm btn-danger mb-1"
        onclick="deleteProduct(${p.id})">Hapus</button>
      </td>
    </tr>
  `).join("");
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product || product.stock <= 0) return;

  const item = cart.find(p => p.id === id);

  if (item) {
    if (item.quantity >= product.stock) {
      alert("Jumlah melebihi stok tersedia!");
      return;
    }

    item.quantity++;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  renderCart();
  renderProducts();
  renderHome();
}

function renderCart() {
  const list = document.getElementById("cartList");

  if (!cart.length) {
    list.innerHTML = '<tr><td colspan="5" class="text-center">Keranjang masih kosong 💗</td></tr>';
  } else {
    list.innerHTML = cart.map(item => `
      <tr>
        <td>${escapeHTML(item.name)}</td>
        <td>${rupiah(item.price)}</td>
        <td>
          <button class="btn btn-sm btn-outline-pink"
          onclick="changeQuantity(${item.id},-1)">−</button>

          ${item.quantity}

          <button class="btn btn-sm btn-outline-pink"
          onclick="changeQuantity(${item.id},1)">+</button>
        </td>
        <td>${rupiah(item.price * item.quantity)}</td>
        <td>
          <button class="btn btn-sm btn-danger"
          onclick="removeCart(${item.id})">Hapus</button>
        </td>
      </tr>
    `).join("");
  }

  document.getElementById("cartTotal").textContent = rupiah(getTotal());
}

function getTotal() {
  return cart.reduce((sum, item) =>
    sum + item.price * item.quantity, 0
  );
}

function changeQuantity(id, amount) {
  const item = cart.find(p => p.id === id);
  const product = products.find(p => p.id === id);

  if (!item || !product) return;

  const newQuantity = item.quantity + amount;

  if (newQuantity <= 0) {
    removeCart(id);
    return;
  }

  if (newQuantity > product.stock) {
    alert("Stok tidak mencukupi!");
    return;
  }

  item.quantity = newQuantity;
  renderCart();
}

function removeCart(id) {
  cart = cart.filter(p => p.id !== id);
  renderCart();
}

function resetForm() {
  document.getElementById("productForm").reset();
  document.getElementById("editId").value = "";
  document.getElementById("formTitle").textContent = "Tambah Produk Baru";
}

document.getElementById("productForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const id = document.getElementById("editId").value;
  const name = document.getElementById("productName").value.trim();
  const price = Number(document.getElementById("productPrice").value);
  const stock = Number(document.getElementById("productStock").value);
  const image = document.getElementById("productImage").value.trim();

  if (!name || price <= 0 || stock < 0) {
    alert("Periksa kembali data produk!");
    return;
  }

  if (id) {
    const product = products.find(p => p.id === Number(id));

    if (product) {
      product.name = name;
      product.price = price;
      product.stock = stock;
      product.image = image || product.image;
    }
  } else {
    products.push({
      id: Date.now(),
      name,
      price,
      stock,
      image: image || "https://placehold.co/500x300/ffe3ef/bd5e8d?text=Produk"
    });
  }

  saveData();
  resetForm();
  renderAll();
  alert("Produk berhasil disimpan! 💗");
});

function editProduct(id) {
  const p = products.find(item => item.id === id);
  if (!p) return;

  document.getElementById("editId").value = p.id;
  document.getElementById("productName").value = p.name;
  document.getElementById("productPrice").value = p.price;
  document.getElementById("productStock").value = p.stock;
  document.getElementById("productImage").value = p.image;

  document.getElementById("formTitle").textContent = "Edit Produk";
  window.scrollTo(0, 0);
}

function deleteProduct(id) {
  if (!confirm("Yakin ingin menghapus produk ini?")) return;

  products = products.filter(p => p.id !== id);
  cart = cart.filter(p => p.id !== id);

  saveData();
  renderAll();
}

function updateDashboard() {
  const today = new Date().toLocaleDateString("id-ID");

  const todayTransactions = transactions.filter(t =>
    t.date === today
  );

  const revenue = todayTransactions.reduce((sum, t) =>
    sum + t.total, 0
  );

  const stock = products.reduce((sum, p) =>
    sum + p.stock, 0
  );

  document.getElementById("totalRevenue").textContent = rupiah(revenue);
  document.getElementById("totalStock").textContent = stock;
  document.getElementById("totalTransactions").textContent = todayTransactions.length;
}

function updateCheckout() {
  document.getElementById("checkoutTotal").textContent = rupiah(getTotal());
  document.getElementById("cashAmount").value = "";
  document.getElementById("paymentMessage").textContent = "Masukkan uang pembayaran.";
  document.getElementById("changeAmount").textContent = rupiah(0);

  updatePayment();
}

function updatePayment() {
  const method = document.getElementById("paymentMethod").value;
  const cashArea = document.getElementById("cashArea");
  const otherPayment = document.getElementById("otherPayment");

  cashArea.classList.toggle("d-none", method !== "Tunai");
  otherPayment.classList.toggle("d-none", method === "Tunai");

  document.getElementById("payButton").disabled =
    cart.length === 0;

  if (method !== "Tunai") {
    document.getElementById("otherPayment").textContent =
      "Pembayaran " + method + " dalam mode simulasi untuk tugas sekolah. Klik Bayar Sekarang untuk menyelesaikan transaksi demo.";
  }
}

function calculateChange() {
  const total = getTotal();
  const cash = Number(document.getElementById("cashAmount").value);
  const message = document.getElementById("paymentMessage");
  const button = document.getElementById("payButton");

  if (cash >= total && total > 0) {
    message.textContent = "Pembayaran mencukupi! 💗";
    message.style.color = "green";
    document.getElementById("changeAmount").textContent = rupiah(cash - total);
    button.disabled = false;
  } else {
    message.textContent = cash > 0
      ? "Uang pembayaran masih kurang."
      : "Masukkan uang pembayaran.";

    message.style.color = "#c52e50";
    document.getElementById("changeAmount").textContent = rupiah(0);
    button.disabled = true;
  }
}

function completePayment() {
  if (!cart.length) {
    alert("Keranjang masih kosong!");
    return;
  }

  const method = document.getElementById("paymentMethod").value;
  const total = getTotal();
  const cash = method === "Tunai"
    ? Number(document.getElementById("cashAmount").value)
    : total;

  if (method === "Tunai" && cash < total) {
    alert("Uang pembayaran masih kurang!");
    return;
  }

  for (const item of cart) {
    const product = products.find(p => p.id === item.id);

    if (!product || product.stock < item.quantity) {
      alert("Stok produk " + item.name + " tidak mencukupi!");
      return;
    }
  }

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    product.stock -= item.quantity;
  });

  const now = new Date();

  const transaction = {
    number: "POS-" + Date.now(),
    date: now.toLocaleDateString("id-ID"),
    time: now.toLocaleTimeString("id-ID"),
    method,
    total,
    cash,
    change: cash - total,
    items: cart.map(item => ({...item}))
  };

  transactions.push(transaction);

  saveData();

  document.getElementById("receiptNumber").textContent = transaction.number;
  document.getElementById("receiptDate").textContent =
    transaction.date + " " + transaction.time;
  document.getElementById("receiptMethod").textContent = method;

  document.getElementById("receiptItems").innerHTML =
    transaction.items.map(item => `
      <div class="d-flex justify-content-between mb-2">
        <span>${escapeHTML(item.name)} x${item.quantity}</span>
        <span>${rupiah(item.price * item.quantity)}</span>
      </div>
    `).join("");

  document.getElementById("receiptTotal").textContent = rupiah(total);
  document.getElementById("receiptCash").textContent = rupiah(cash);
  document.getElementById("receiptChange").textContent = rupiah(transaction.change);

  cart = [];

  renderAll();
  showPage("receipt");
}

function renderHistory() {
  const list = document.getElementById("historyList");

  list.innerHTML = transactions.length
    ? [...transactions].reverse().map((t, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${t.date} ${t.time}</td>
        <td>${escapeHTML(t.method)}</td>
        <td>${rupiah(t.total)}</td>
      </tr>
    `).join("")
    : '<tr><td colspan="4" class="text-center">Belum ada transaksi.</td></tr>';
}

function renderAll() {
  renderProducts();
  renderHome();
  renderManage();
  renderCart();
  updateDashboard();
  renderHistory();
}

renderAll();
