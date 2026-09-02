// ============================================================
// CART MODULE — Supabase version
// Manages shopping cart items in the "cart_items" table
// ============================================================

const Cart = {
    // --------------------------------------------------------
    // Get cart items for a user
    // --------------------------------------------------------
    async getItems(userId) {
        try {
            const { data, error } = await sb
                .from('cart_items')
                .select('*')
                .eq('user_id', userId);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Get cart error:", error);
            return [];
        }
    },

    // --------------------------------------------------------
    // Add item to cart
    // item = { productId, name, price, shadeCode, category, imageUrl, quantity }
    // --------------------------------------------------------
    async addItem(userId, item) {
        try {
            // Check if this product is already in the cart
            const existing = await this.getItems(userId);
            const found = existing.find(i => i.product_id === item.productId);

            if (found) {
                // Update quantity
                const { error } = await sb
                    .from('cart_items')
                    .update({ quantity: (found.quantity || 1) + (item.quantity || 1) })
                    .eq('id', found.id);
                if (error) throw error;
            } else {
                // Insert new row
                const { error } = await sb
                    .from('cart_items')
                    .insert([{
                        user_id: userId,
                        product_id: item.productId,
                        name: item.name,
                        price: item.price,
                        shade_code: item.shadeCode,
                        category: item.category,
                        image_url: item.imageUrl || '',
                        quantity: item.quantity || 1
                    }]);
                if (error) throw error;
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // --------------------------------------------------------
    // Update item quantity (delete if quantity is 0)
    // --------------------------------------------------------
    async updateQuantity(userId, productId, quantity) {
        try {
            if (quantity <= 0) {
                return await this.removeItem(userId, productId);
            }

            const { error } = await sb
                .from('cart_items')
                .update({ quantity })
                .eq('user_id', userId)
                .eq('product_id', productId);

            if (error) throw error;
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
            const { error } = await sb
                .from('cart_items')
                .delete()
                .eq('user_id', userId)
                .eq('product_id', productId);

            if (error) throw error;
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
            const { error } = await sb
                .from('cart_items')
                .delete()
                .eq('user_id', userId);

            if (error) throw error;
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