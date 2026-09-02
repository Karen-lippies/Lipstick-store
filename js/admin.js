// ============================================================
// ADMIN MODULE — Supabase version
// Product management + Offers for the admin panel
// ============================================================

const Admin = {
    editingProductId: null,

    async init() {
        const user = await Auth.requireAdmin();
        if (!user) return;
        this.loadProducts();
        this.setupEventListeners();
    },

    async loadProducts() {
        const products = await Products.getAll();
        const grid = document.getElementById('adminProductsGrid');
        if (!grid) return;

        if (products.length === 0) {
            grid.innerHTML = '<p class="no-products">No products yet. Add your first product above!</p>';
            return;
        }

        grid.innerHTML = products.map(product => {
            const saleTag = product.is_on_sale
                ? `<span style="background:#e74c6f;color:#fff;padding:2px 8px;border-radius:20px;font-size:0.7rem;font-weight:600;margin-left:6px;">SALE ${product.discount_percent}% OFF</span>`
                : '';
            const priceHtml = product.is_on_sale && product.original_price
                ? `<span style="text-decoration:line-through;color:#999;font-size:0.85rem;margin-right:4px;">\u20B9${product.original_price}</span><span class="admin-product-price">\u20B9${product.price}</span>`
                : `<span class="admin-product-price">\u20B9${product.price}</span>`;
            return `
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
                    <h4>${product.name}${saleTag}</h4>
                    <p><span class="shade-dot" style="background:${product.shade_code};"></span> ${product.shade_code}</p>
                    <p class="product-category-tag">${product.category}</p>
                    <p>${priceHtml}</p>
                </div>
                <div class="admin-product-actions">
                    <button class="btn-edit" onclick="Admin.editProduct('${product.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-edit" style="background:#fef0f2;color:#e74c6f;" onclick="Admin.openOfferModal('${product.id}')">
                        <i class="fas fa-tag"></i> Offer
                    </button>
                    <button class="btn-delete" onclick="Admin.deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>`;
        }).join('');
    },

    setupEventListeners() {
        const form = document.getElementById('productForm');
        if (form) form.addEventListener('submit', (e) => this.handleSubmit(e));
    },

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

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;

        try {
            let imageUrl = '';
            let tempId = this.editingProductId || Date.now().toString();

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
                name, category, shadeCode,
                price: parseFloat(price),
                imageUrl
            };

            let result;
            if (this.editingProductId) {
                if (!imageUrl) {
                    const existing = await Products.getById(this.editingProductId);
                    productData.imageUrl = existing ? existing.image_url : '';
                }
                result = await Products.update(this.editingProductId, productData);
                this.showMessage('Product updated!', 'success');
                this.editingProductId = null;
                document.getElementById('formTitle').textContent = 'Add New Product';
                submitBtn.textContent = 'Add Product';
            } else {
                result = await Products.add(productData);
                this.showMessage('Product added!', 'success');
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
        document.querySelector('#productForm button[type="submit"]').textContent = 'Update Product';
        document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
    },

    async deleteProduct(productId) {
        if (!confirm('Delete this product?')) return;
        const result = await Products.delete(productId);
        if (result.success) {
            this.showMessage('Product deleted', 'success');
            this.loadProducts();
        } else {
            this.showMessage('Error: ' + result.error, 'error');
        }
    },

    // --------------------------------------------------------
    // OFFERS MODAL
    // --------------------------------------------------------
    async openOfferModal(productId) {
        const product = await Products.getById(productId);
        if (!product) return;

        const modal = document.getElementById('offerModal');
        document.getElementById('offerProductId').value = productId;
        document.getElementById('offerProductName').textContent = product.name;
        document.getElementById('offerOriginalPrice').value = product.original_price || product.price;
        document.getElementById('offerDiscount').value = product.discount_percent || 0;
        document.getElementById('offerIsOnSale').checked = product.is_on_sale || false;
        document.getElementById('offerText').value = product.offer_text || '';
        this.updateOfferPreview();
        modal.style.display = 'flex';
    },

    closeOfferModal() {
        document.getElementById('offerModal').style.display = 'none';
    },

    updateOfferPreview() {
        const orig = parseFloat(document.getElementById('offerOriginalPrice').value) || 0;
        const disc = parseFloat(document.getElementById('offerDiscount').value) || 0;
        const sale = document.getElementById('offerIsOnSale').checked;
        const preview = document.getElementById('offerPreview');
        if (!preview) return;
        if (sale && disc > 0) {
            const salePrice = Math.round(orig * (1 - disc / 100));
            preview.innerHTML = `<span style="text-decoration:line-through;color:#999;">\u20B9${orig}</span> <span style="color:#e74c6f;font-weight:700;font-size:1.2rem;">\u20B9${salePrice}</span> <span style="background:#e74c6f;color:#fff;padding:2px 8px;border-radius:20px;font-size:0.75rem;">${disc}% OFF</span>`;
            preview.style.display = 'block';
        } else {
            preview.innerHTML = `<span style="font-weight:600;">\u20B9${orig}</span> <span style="color:#999;font-size:0.85rem;">No active sale</span>`;
            preview.style.display = 'block';
        }
    },

    async saveOffer() {
        const productId = document.getElementById('offerProductId').value;
        const offerData = {
            originalPrice: parseFloat(document.getElementById('offerOriginalPrice').value),
            discountPercent: parseFloat(document.getElementById('offerDiscount').value) || 0,
            isOnSale: document.getElementById('offerIsOnSale').checked,
            offerText: document.getElementById('offerText').value.trim()
        };

        const result = await Products.updateOffer(productId, offerData);
        if (result.success) {
            this.closeOfferModal();
            this.showMessage('Offer updated!', 'success');
            this.loadProducts();
        } else {
            this.showMessage('Error: ' + result.error, 'error');
        }
    },

    showMessage(text, type) {
        const msg = document.getElementById('adminMessage');
        if (!msg) return;
        msg.textContent = text;
        msg.className = 'admin-message ' + type;
        msg.style.display = 'block';
        setTimeout(() => { msg.style.display = 'none'; }, 3000);
    }
};
