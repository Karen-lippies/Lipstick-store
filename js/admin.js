// ============================================================
// ADMIN MODULE — Supabase version
// Product management for the admin panel
// ============================================================

const Admin = {
    editingProductId: null,

    // --------------------------------------------------------
    // Initialize admin panel
    // --------------------------------------------------------
    async init() {
        const user = await Auth.requireAdmin();
        if (!user) return;
        this.loadProducts();
        this.setupEventListeners();
    },

    // --------------------------------------------------------
    // Load all products into the admin grid
    // --------------------------------------------------------
    async loadProducts() {
        const products = await Products.getAll();
        const grid = document.getElementById('adminProductsGrid');
        if (!grid) return;

        if (products.length === 0) {
            grid.innerHTML = '<p class="no-products">No products yet. Add your first product above!</p>';
            return;
        }

        grid.innerHTML = products.map(product => `
            <div class="admin-product-card">
                <div class="admin-product-image">
                    ${product.image_url
                        ? `<img src="${product.image_url}" alt="${product.name}">`
                        : `<div class="placeholder-img" style="background-color: ${product.shade_code}20;">
                             <i class="fas fa-eye" style="color: ${product.shade_code};"></i>
                           </div>`
                    }
                </div>
                <div class="admin-product-info">
                    <h4>${product.name}</h4>
                    <p><span class="shade-dot" style="background:${product.shade_code};"></span> ${product.shade_code}</p>
                    <p class="product-category-tag">${product.category}</p>
                    <p class="admin-product-price">$${Number(product.price).toFixed(2)}</p>
                </div>
                <div class="admin-product-actions">
                    <button class="btn-edit" onclick="Admin.editProduct('${product.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="Admin.deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    },

    // --------------------------------------------------------
    // Setup event listeners
    // --------------------------------------------------------
    setupEventListeners() {
        const form = document.getElementById('productForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    },

    // --------------------------------------------------------
    // Handle form submit (add or update)
    // --------------------------------------------------------
    async handleSubmit(e) {
        e.preventDefault();

        const name = document.getElementById('productName').value.trim();
        const category = document.getElementById('productCategory').value;
        const shadeCode = document.getElementById('productShade').value;
        const price = document.getElementById('productPrice').value;
        const imageFile = document.getElementById('productImage').files[0];

        if (!name || !category || !shadeCode || !price) {
            this.showMessage('Please fill all fields', 'error');
            return;
        }

        // Show loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;

        try {
            let imageUrl = '';
            let tempId = this.editingProductId || Date.now().toString();

            // Upload image if provided
            if (imageFile) {
                const uploadResult = await Products.uploadImage(imageFile, tempId);
                if (uploadResult.success) {
                    imageUrl = uploadResult.url;
                } else {
                    this.showMessage('Image upload failed: ' + uploadResult.error, 'error');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    return;
                }
            }

            const productData = {
                name: name,
                category: category,
                shadeCode: shadeCode,
                price: parseFloat(price),
                imageUrl: imageUrl
            };

            let result;
            if (this.editingProductId) {
                // Keep old image if no new image uploaded
                if (!imageUrl) {
                    const existing = await Products.getById(this.editingProductId);
                    productData.imageUrl = existing ? existing.image_url : '';
                }
                result = await Products.update(this.editingProductId, productData);
                this.showMessage('Product updated successfully!', 'success');
                this.editingProductId = null;
                document.getElementById('formTitle').textContent = 'Add New Product';
                submitBtn.textContent = 'Add Product';
            } else {
                result = await Products.add(productData);
                this.showMessage('Product added successfully!', 'success');
                submitBtn.textContent = 'Add Product';
            }

            if (result.success) {
                e.target.reset();
                document.getElementById('shadePreview').style.backgroundColor = '#ccc';
                document.getElementById('productShade').value = '#c0392b';
                document.getElementById('productShadeText').value = '#c0392b';
                this.loadProducts();
            } else {
                this.showMessage('Error: ' + result.error, 'error');
            }
        } catch (error) {
            this.showMessage('An error occurred: ' + error.message, 'error');
        }

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    },

    // --------------------------------------------------------
    // Edit a product — fill the form with existing data
    // --------------------------------------------------------
    async editProduct(productId) {
        const product = await Products.getById(productId);
        if (!product) return;

        this.editingProductId = productId;

        document.getElementById('formTitle').textContent = 'Edit Product';
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productShade').value = product.shade_code;
        document.getElementById('productShadeText').value = product.shade_code;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('shadePreview').style.backgroundColor = product.shade_code;

        const submitBtn = document.querySelector('#productForm button[type="submit"]');
        submitBtn.textContent = 'Update Product';

        // Scroll to form
        document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
    },

    // --------------------------------------------------------
    // Delete a product after confirmation
    // --------------------------------------------------------
    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        const result = await Products.delete(productId);
        if (result.success) {
            this.showMessage('Product deleted', 'success');
            this.loadProducts();
        } else {
            this.showMessage('Error deleting product: ' + result.error, 'error');
        }
    },

    // --------------------------------------------------------
    // Show success/error messages
    // --------------------------------------------------------
    showMessage(text, type) {
        const msg = document.getElementById('adminMessage');
        if (!msg) return;
        msg.textContent = text;
        msg.className = 'admin-message ' + type;
        msg.style.display = 'block';
        setTimeout(() => { msg.style.display = 'none'; }, 3000);
    }
};