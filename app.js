document.getElementById("productForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const id = document.getElementById("editId").value;
  const name = document.getElementById("productName").value.trim();
  const price = Number(document.getElementById("productPrice").value);
  const stock = Number(document.getElementById("productStock").value);
  const file = document.getElementById("productImage").files[0];

  if (!name || price <= 0 || stock < 0) {
    alert("Periksa kembali data produk!");
    return;
  }

  function saveProduct(image) {
    if (id) {
      const product = products.find(p => p.id === Number(id));

      if (product) {
        product.name = name;
        product.price = price;
        product.stock = stock;
        if (image) product.image = image;
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
  }

  if (file) {
    if (!file.type.startsWith("image/")) {
      alert("Pilih file gambar!");
      return;
    }

    const reader = new FileReader();

    reader.onload = function() {
      saveProduct(reader.result);
    };

    reader.onerror = function() {
      alert("Gagal membaca gambar!");
    };

    reader.readAsDataURL(file);
  } else {
    saveProduct(null);
  }
});
