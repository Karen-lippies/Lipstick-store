// ============================================================
// PRODUCTS MODULE — CRUD operations for products in Firestore
// ============================================================

const Products = {
    // --------------------------------------------------------
    // Get all products
    // --------------------------------------------------------
    async getAll() {
        try {
            const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching products:", error);
            return [];
        }
    },

    // --------------------------------------------------------
    // Get products by category (Lipstick, Eyeshadow, Eyeliner)
    // --------------------------------------------------------
    async getByCategory(category) {
        try {
            const snapshot = await db.collection('products')
                .where('category', '==', category)
                .orderBy('createdAt', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching products:", error);
            return [];
        }
    },

    // --------------------------------------------------------
    // Get a single product by ID
    // --------------------------------------------------------
    async getById(productId) {
        try {
            const doc = await db.collection('products').doc(productId).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error("Error fetching product:", error);
            return null;
        }
    },

    // --------------------------------------------------------
    // Add a new product (admin only)
    // data = { name, category, shadeCode, price, imageUrl }
    // --------------------------------------------------------
    async add(productData) {
        try {
            const docRef = await db.collection('products').add({
                name: productData.name,
                category: productData.category,       // "Lipstick", "Eyeshadow", "Eyeliner"
                shadeCode: productData.shadeCode,      // hex color like "#c0392b"
                price: parseFloat(productData.price),
                imageUrl: productData.imageUrl || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // --------------------------------------------------------
    // Update a product (admin only)
    // --------------------------------------------------------
    async update(productId, productData) {
        try {
            await db.collection('products').doc(productId).update({
                name: productData.name,
                category: productData.category,
                shadeCode: productData.shadeCode,
                price: parseFloat(productData.price),
                imageUrl: productData.imageUrl || ''
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // --------------------------------------------------------
    // Delete a product (admin only)
    // --------------------------------------------------------
    async delete(productId) {
        try {
            await db.collection('products').doc(productId).delete();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // --------------------------------------------------------
    // Upload product image to Firebase Storage
    // Returns the download URL
    // --------------------------------------------------------
    async uploadImage(file, productId) {
        try {
            const storageRef = storage.ref('products/' + productId + '_' + file.name);
            await storageRef.put(file);
            const downloadURL = await storageRef.getDownloadURL();
            return { success: true, url: downloadURL };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // --------------------------------------------------------
    // Get all unique shades for the Try-On selector
    // Returns array of { name, shadeCode, category }
    // --------------------------------------------------------
    async getAllShades() {
        try {
            const products = await this.getAll();
            return products.map(p => ({
                name: p.name,
                shadeCode: p.shadeCode,
                category: p.category,
                id: p.id
            }));
        } catch (error) {
            return [];
        }
    }
};
