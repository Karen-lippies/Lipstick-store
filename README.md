# Luxe Beauty — Makeup E-Commerce Website

A modern beauty e-commerce site with Virtual Makeup Try-On, customer accounts, and an admin panel. Built with pure HTML, CSS, and JavaScript (no build tools). Data stored in **Firebase** (free Spark plan). Code version-controlled with **Git** and hosted on **GitHub Pages / Netlify** (free).

## ✨ Features

### Customer Site
- **Homepage** — beauty-brand styled, products loaded from Firestore
- **Product pages** — image, name, price, Add to Cart
- **Cart page** — view/remove items, live total, Proceed to Checkout
- **Virtual Try-On** (`tryon.html`) — real-time camera makeup:
  - Lipstick (adjustable intensity, matte/gloss)
  - Eyeshadow (single + gradient shades)
  - Eyeliner (adjustable thickness)
  - 📸 Snapshot download
  - Shades load dynamically from admin-added products

### Accounts & Checkout
- **Login/Signup** — name, email, mobile, password (Firebase Auth)
- **Checkout** — login required; saves delivery address to profile; returns customers don't retype
- **Payment** — placeholder "Place Order" + `TODO` markers for future Razorpay/Stripe

### Admin Panel (`admin.html`)
- Separate secure admin login (only authorized admin)
- Add / edit / delete products with image upload, hex shade code
- Products appear automatically on site + try-on

## 📁 File Structure
```
├── index.html          Homepage
├── product.html        Product detail
├── cart.html           Shopping bag
├── checkout.html       Delivery + payment placeholder
├── login.html          Customer login/signup
├── tryon.html          Virtual makeup try-on
├── admin.html          Admin panel
├── css/styles.css      All styling
├── js/
│   ├── firebase-config.js   🔒 REAL keys (git-ignored)
│   ├── firebase-config.example.js  placeholder keys (safe to commit)
│   ├── auth.js          login/signup/logout
│   ├── products.js      product CRUD
│   ├── cart.js          cart in Firestore
│   ├── admin.js         panel logic
│   └── tryon.js         face detection + makeup drawing
└── .gitignore
```

## 🚀 Getting Started

1. **Install Git** (if not installed): https://git-scm.com → download → install (next-next-next)
2. **Set up Firebase** (free):
   - Create project at https://console.firebase.google.com
   - Enable **Authentication → Email/Password**
   - Create **Firestore** database & **Storage**
   - Copy your `firebaseConfig` into `js/firebase-config.js`
3. **Make yourself admin**: In Firestore → `users` collection → doc with your UID → `{ name, email, isAdmin: true }`
4. **Run locally**: open `index.html` in a browser
5. **Deploy** (choose one):
   - **Netlify Drag & Drop**: https://app.netlify.com/drop
   - **GitHub Pages**: push to GitHub (see Git Commands below)

## 🔐 Security (important!)
- NEVER commit `js/firebase-config.js` — it contains real keys. It's already git-ignored.
- Paste the Firestore rules (top of `js/firebase-config.js`) so only your admin can write products, and users only read/write their own data.
- Commit only `js/firebase-config.example.js` (placeholders), never the real file.

## 🪓 Git Setup & Commands

```bash
# One-time setup (replace with your GitHub username)
git init
git add .
git commit -m "Initial commit: Luxe Beauty store"

# Connect to your GitHub repo (create empty repo on github.com first)
git remote add origin https://github.com/YOUR-USERNAME/beauty-store.git
git branch -M main
git push -u origin main
```

## 🧪 Testing Checklist
- [ ] Customer: signup → login → browse → add to cart → checkout
- [ ] Admin: login → add/edit/delete product → appears on site + try-on
- [ ] Try-On: camera works → face tracks → shades apply → snapshot downloads
- [ ] Security: non-admin blocked from `admin.html`; checkout blocked without login
