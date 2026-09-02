// ============================================================
// PRODUCTS MODULE — Supabase version
// CRUD operations for products in the "products" table
// ============================================================

const Products = {
    // --------------------------------------------------------
    // Get all products (newest first)
    // --------------------------------------------------------
    async getAll() {
        try {
            const { data, error } = await sb
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Get products error:", error);
            return [];
        }
    },

    // --------------------------------------------------------
    // Get products by category (Lipstick, Eyeshadow, Eyeliner)
    // --------------------------------------------------------
    async getByCategory(category) {
        try {
            const { data, error } = await sb
                .from('products')
                .select('*')
                .eq('category', category)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Get by category error:", error);
            return [];
        }
    },

    // --------------------------------------------------------
    // Get a single product by ID
    // --------------------------------------------------------
    async getById(productId) {
        try {
            const { data, error } = await sb
                .from('products')
                .select('*')
                .eq('id', productId)
                .maybeSingle();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Get product error:", error);
            return null;
        }
    },

    // --------------------------------------------------------
    // Add a new product (admin only)
    // data = { name, category, shade_code, price, image_url }
    // --------------------------------------------------------
    async add(productData) {
        try {
            const { data, error } = await sb
                .from('products')
                .insert([{
                    name: productData.name,
                    category: productData.category,
                    shade_code: productData.shadeCode,     // hex color
                    price: parseFloat(productData.price),
                    image_url: productData.imageUrl || ''
                }])
                .select();

            if (error) throw error;
            return { success: true, id: data[0].id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // --------------------------------------------------------
    // Update a product (admin only)
    // --------------------------------------------------------
    async update(productId, productData) {
        try {
            const { error } = await sb
                .from('products')
                .update({
                    name: productData.name,
                    category: productData.category,
                    shade_code: productData.shadeCode,
                    price: parseFloat(productData.price),
                    image_url: productData.imageUrl || ''
                })
                .eq('id', productId);

            if (error) throw error;
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
            const { error } = await sb
                .from('products')
                .delete()
                .eq('id', productId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // --------------------------------------------------------
    // Upload product image to Supabase Storage
    // Returns the public URL
    // --------------------------------------------------------
    async uploadImage(file, productId) {
        try {
            // Sanitize the filename
            const ext = file.name.split('.').pop();
            const fileName = `product_${productId}_${Date.now()}.${ext}`;

            // Upload to the "product-images" bucket
            const { error: uploadError } = await sb.storage
                .from('product-images')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Get the public URL
            const { data } = sb.storage
                .from('product-images')
                .getPublicUrl(fileName);

            return { success: true, url: data.publicUrl };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // --------------------------------------------------------
    // Get all unique shades for the Try-On selector
    // --------------------------------------------------------
    async getAllShades() {
        try {
            const products = await this.getAll();
            return products.map(p => ({
                name: p.name || '',
                shadeCode: p.shade_code,     // uses snake_case column
                category: p.category,
                id: p.id
            }));
        } catch (error) {
            return [];
        }
    }
};
