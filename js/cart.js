// ============================================================
// CART MODULE — manages shopping cart in Firestore
// ============================================================

const Cart = {
    // --------------------------------------------------------
    // Get cart items for a user
    // --------------------------------------------------------
    async getItems(userId) {
        try {
            const doc = await db.collection('carts').doc(userId).get();
            if (doc.exists) {
                return doc.data().items || [];
            }
            return [];
        } catch (error) {
            console.error("Error getting cart:", error);
            return [];
        }
    },

    // --------------------------------------------------------
    // Add item to cart
    // item = { productId, name, price, shadeCode, category, imageUrl, quantity }
    // --------------------------------------------------------
    async addItem(userId, item) {
        try {
            const cartRef = db.collection('carts').doc(userId);
            const doc = await cartRef.get();

            let items = [];
            if (doc.exists) {
                items = doc.data().items || [];
            }

            // Check if product already in cart
            const existingIndex = items.findIndex(i => i.productId === item.productId);
            if (existingIndex >= 0) {
                items[existingIndex].quantity += item.quantity || 1;
            } else {
                items.push({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    shadeCode: item.shadeCode,
                    category: item.category,
                    imageUrl: item.imageUrl || '',
                    quantity: item.quantity || 1
                });
            }

            await cartRef.set({ items: items });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // --------------------------------------------------------
    // Update item quantity
    // --------------------------------------------------------
    async updateQuantity(userId, productId, quantity) {
        try {
            const cartRef = db.collection('carts').doc(userId);
            const doc = await cartRef.get();

            if (!doc.exists) return { success: false };

            let items = doc.data().items || [];
            const index = items.findIndex(i => i.productId === productId);

            if (index >= 0) {
                if (quantity <= 0) {
                    items.splice(index, 1);
                } else {
                    items[index].quantity = quantity;
                }
            }

            await cartRef.set({ items: items });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // --------------------------------------------------------
    // Remove item from cart
    // --------------------------------------------------------
    async removeItem(userId, productId) {
        try {
            const cartRef = db.collection('carts').doc(userId);
            const doc = await cartRef.get();

            if (!doc.exists) return { success: false };

            let items = doc.data().items || [];
            items = items.filter(i => i.productId !== productId);

            await cartRef.set({ items: items });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // --------------------------------------------------------
    // Clear entire cart
    // --------------------------------------------------------
    async clear(userId) {
        try {
            await db.collection('carts').doc(userId).set({ items: [] });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // --------------------------------------------------------
    // Calculate total price
    // --------------------------------------------------------
    calculateTotal(items) {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    // --------------------------------------------------------
    // Get total number of items
    // --------------------------------------------------------
    getCount(items) {
        return items.reduce((sum, item) => sum + item.quantity, 0);
    }
};
