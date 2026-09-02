// ============================================================
// AUTH MODULE — handles signup, login, logout, session
// ============================================================

const Auth = {
    // Current logged-in user data
    currentUser: null,
    isAdmin: false,

    // --------------------------------------------------------
    // Sign up a new customer (name, email, phone, password)
    // --------------------------------------------------------
    async signup(name, email, phone, password) {
        try {
            // Create user in Firebase Auth
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Save extra profile data in Firestore
            await db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                phone: phone,
                isAdmin: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true, user: user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // --------------------------------------------------------
    // Log in with email and password
    // --------------------------------------------------------
    async login(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // --------------------------------------------------------
    // Log out
    // --------------------------------------------------------
    async logout() {
        await auth.signOut();
        this.currentUser = null;
        this.isAdmin = false;
        window.location.href = 'login.html';
    },

    // --------------------------------------------------------
    // Check if current user is admin
    // -------------------------------------------------------
    async checkAdmin(uid) {
        try {
            const doc = await db.collection('users').doc(uid).get();
            if (doc.exists && doc.data().isAdmin === true) {
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    },

    // --------------------------------------------------------
    // Get user profile from Firestore
    // --------------------------------------------------------
    async getProfile(uid) {
        try {
            const doc = await db.collection('users').doc(uid).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error("Error getting profile:", error);
            return null;
        }
    },

    // --------------------------------------------------------
    // Update user profile
    // --------------------------------------------------------
    async updateProfile(uid, data) {
        try {
            await db.collection('users').doc(uid).update(data);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // --------------------------------------------------------
    // Listen for auth state changes (auto-login on page load)
    // --------------------------------------------------------
    init() {
        return new Promise((resolve) => {
            auth.onAuthStateChanged(async (user) => {
                if (user) {
                    this.currentUser = user;
                    this.isAdmin = await this.checkAdmin(user.uid);
                    resolve(user);
                } else {
                    this.currentUser = null;
                    this.isAdmin = false;
                    resolve(null);
                }
            });
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
    // Require admin — redirect to home if not admin
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
