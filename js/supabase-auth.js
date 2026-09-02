// ============================================================
// AUTH MODULE — Supabase version
// Handles signup, login, logout, session, admin check
// ============================================================

const Auth = {
    currentUser: null,   // Supabase user object
    isAdmin: false,

    // --------------------------------------------------------
    // Sign up a new customer (name, email, phone, password)
    // --------------------------------------------------------
    async signup(name, email, phone, password) {
        try {
            // Create user in Supabase Auth
            const { data, error } = await sb.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { full_name: name, phone: phone }
                }
            });

            if (error) throw error;

            // If a user was created, save profile in "profiles" table
            if (data.user) {
                const { error: profileError } = await sb
                    .from('profiles')
                    .upsert({
                        id: data.user.id,
                        name: name,
                        email: email,
                        phone: phone,
                        is_admin: false
                    });

                if (profileError) throw profileError;
            }

            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // --------------------------------------------------------
    // Log in with email and password
    // --------------------------------------------------------
    async login(email, password) {
        try {
            const { data, error } = await sb.auth.signInWithPassword({ email, password });
            if (error) throw error;
            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // --------------------------------------------------------
    // Log out
    // --------------------------------------------------------
    async logout() {
        await sb.auth.signOut();
        this.currentUser = null;
        this.isAdmin = false;
        window.location.href = 'login.html';
    },

    // --------------------------------------------------------
    // Check if a user is admin (reads from profiles table)
    // --------------------------------------------------------
    async checkAdmin(uid) {
        try {
            const { data, error } = await sb
                .from('profiles')
                .select('is_admin')
                .eq('id', uid)
                .maybeSingle();

            if (error) throw error;
            return data && data.is_admin === true;
        } catch (error) {
            console.error("Admin check error:", error);
            return false;
        }
    },

    // --------------------------------------------------------
    // Get user profile from "profiles" table
    // --------------------------------------------------------
    async getProfile(uid) {
        try {
            const { data, error } = await sb
                .from('profiles')
                .select('*')
                .eq('id', uid)
                .maybeSingle();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Get profile error:", error);
            return null;
        }
    },

    // --------------------------------------------------------
    // Update user profile
    // --------------------------------------------------------
    async updateProfile(uid, updates) {
        try {
            const { error } = await sb
                .from('profiles')
                .update(updates)
                .eq('id', uid);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // --------------------------------------------------------
    // Get the current session (call once on page load)
    // --------------------------------------------------------
    init() {
        return new Promise((resolve) => {
            const session = sb.auth.getSession();
            if (session.data && session.data.session) {
                const user = session.data.session.user;
                this.currentUser = user;
                this.checkAdmin(user.id).then((isAdmin) => {
                    this.isAdmin = isAdmin;
                    resolve(user);
                });
            } else {
                this.currentUser = null;
                this.isAdmin = false;
                resolve(null);
            }
        });
    },

    // --------------------------------------------------------
    // Require login — redirect to login.html if not logged in
    // --------------------------------------------------------
    async requireAuth() {
        const user = await this.init();
        if (!user) {
            window.location.href = 'login.html';
            return null;
        }
        return user;
    },

    // --------------------------------------------------------
    // Require admin — redirect if not admin
    // --------------------------------------------------------
    async requireAdmin() {
        const user = await this.init();
        if (!user) {
            window.location.href = 'login.html';
            return null;
        }
        if (!this.isAdmin) {
            window.location.href = 'index.html';
            return null;
        }
        return user;
    }
};
