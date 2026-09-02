// ============================================================
// PRODUCTS MODULE — Supabase version
// CRUD operations for products in the "products" table
// ============================================================

const Products = {
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

    async getOnSale() {
        try {
            const { data, error } = await sb
                .from('products')
                .select('*')
                .eq('is_on_sale', true)
                .order('discount_percent', { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Get sale products error:", error);
            return [];
        }
    },

    async add(productData) {
        try {
            const { data, error } = await sb
                .from('products')
                .insert([{
                    name: productData.name,
                    category: productData.category,
                    shade_code: productData.shadeCode,
                    price: parseFloat(productData.price),
                    image_url: productData.imageUrl || '',
                    original_price: parseFloat(productData.price),
                    discount_percent: 0,
                    is_on_sale: false,
                    offer_text: null
                }])
                .select();
            if (error) throw error;
            return { success: true, id: data[0].id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async update(productId, productData) {
        try {
            const updateObj = {
                name: productData.name,
                category: productData.category,
                shade_code: productData.shadeCode,
                price: parseFloat(productData.price),
                image_url: productData.imageUrl || ''
            };
            if (productData.originalPrice !== undefined) updateObj.original_price = parseFloat(productData.originalPrice);
            if (productData.discountPercent !== undefined) updateObj.discount_percent = parseFloat(productData.discountPercent);
            if (productData.isOnSale !== undefined) updateObj.is_on_sale = productData.isOnSale;
            if (productData.offerText !== undefined) updateObj.offer_text = productData.offerText || null;

            const { error } = await sb
                .from('products')
                .update(updateObj)
                .eq('id', productId);
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async updateOffer(productId, offerData) {
        try {
            const salePrice = offerData.originalPrice * (1 - offerData.discountPercent / 100);
            const { error } = await sb
                .from('products')
                .update({
                    original_price: offerData.originalPrice,
                    discount_percent: offerData.discountPercent,
                    is_on_sale: offerData.isOnSale,
                    offer_text: offerData.offerText || null,
                    price: Math.round(salePrice)
                })
                .eq('id', productId);
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

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

    async uploadImage(file, productId) {
        try {
            const ext = file.name.split('.').pop();
            const fileName = `product_${productId}_${Date.now()}.${ext}`;
            const { error: uploadError } = await sb.storage
                .from('product-images')
                .upload(fileName, file);
            if (uploadError) throw uploadError;
            const { data } = sb.storage
                .from('product-images')
                .getPublicUrl(fileName);
            return { success: true, url: data.publicUrl };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async getAllShades() {
        try {
            const products = await this.getAll();
            return products.map(p => ({
                name: p.name || '',
                shadeCode: p.shade_code,
                category: p.category,
                id: p.id
            }));
        } catch (error) {
            return [];
        }
    }
};
