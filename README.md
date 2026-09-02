# Luxe Beauty — Makeup E-Commerce Website

A modern beauty e-commerce site with Virtual Makeup Try-On, customer accounts, and an admin panel. Built with pure HTML, CSS, and JavaScript (no build tools). Data stored in **Supabase** (free tier). Code version-controlled with **Git** and hosted on **GitHub Pages / Netlify** (free).

## ✨ Features

### Customer Site
- **Homepage** — beauty-brand styled, products loaded from Supabase
- **Product pages** — image, name, price, Add to Cart
- **Cart page** — view/remove items, live total, Proceed to Checkout
- **Virtual Try-On** (`tryon.html`) — real-time camera makeup:
  - Lipstick (adjustable intensity, matte/gloss)
  - Eyeshadow (single + gradient shades)
  - Eyeliner (adjustable thickness)
  - 📸 Snapshot download
  - Shades load dynamically from admin-added products

### Accounts & Checkout
- **Login/Signup** — name, email, mobile, password (Supabase Auth)
- **Checkout** — login required; saves delivery address to profile; returning customers don't retype
- **Payment** — placeholder "Place Order" + `TODO` markers for future Razorpay/Stripe

### Admin Panel (`admin.html`)
- Separate secure admin login (only authorized admin — marked in `profiles.is_admin`)
- Add / edit / delete products with image upload, hex shade code
- Products appear automatically on site + try-on

## 📁 File Structure
```
├── index.html              Homepage
├── product.html            Product detail
├── cart.html               Shopping bag
├── checkout.html           Delivery + payment placeholder
├── login.html              Customer login/signup
├── tryon.html              Virtual makeup try-on
├── admin.html              Admin panel
├── css/styles.css          All styling
├── js/
│   ├── supabase-config.js      🔑 Your Supabase URL + anon key
│   ├── supabase-auth.js        login/signup/logout
│   ├── supabase-products.js    product CRUD
│   ├── supabase-cart.js        cart in Supabase
│   ├── admin.js                panel logic
│   └── tryon.js                face detection + makeup drawing
└── supabase-schema.sql        database setup (run once in SQL Editor)
```

> **Security note:** the Supabase anon key and project URL are PUBLIC by design. They are safe to commit — real security comes from the Row Level Security policies in `supabase-schema.sql`. Never commit your Supabase *service role* key to a public repo!

## 🚀 Getting Started

1. **Install Git** (if not installed): https://git-scm.com
2. **Set up Supabase** (free):
   - Create account at https://supabase.com
   - Create a new project → wait ~2 min
   - In **SQL Editor**, run the entire `supabase-schema.sql` file
   - In **Project Settings → API**, copy the Project URL + anon key into `js/supabase-config.js`
3. **Make yourself admin** (one-time):
   - Sign up on your site (or in Auth → Users add a user)
   - In Supabase → Table Editor → `profiles` → find your row → set `is_admin` to `true`
4. **Run locally**: open `index.html` in a browser
5. **Deploy** (choose one):
   - **Netlify Drag & Drop**: https://app.netlify.com/drop
   - **GitHub Pages**: push to GitHub (see Git Commands below)

## 🔐 Database Security
See the policies at the bottom of `supabase-schema.sql`:
- Anyone can **read** products (needed for the storefront)
- Only **admins** can add / edit / delete products
- Users can only **read/write their own** profile, cart, and orders

## 🪓 Git Setup & Commands
```bash
# One-time setup
git init
git add .
git commit -m "Initial commit: Luxe Beauty store"

# Connect to GitHub (create empty repo first)
git remote add origin https://github.com/YOUR-USERNAME/Lipstick-store.git
git branch -M main
git push -u origin main
```

## 🧪 Testing Checklist
- [ ] Customer: signup → login → browse → add to cart → checkout
- [ ] Admin: login → add/edit/delete product → appears on site + try-on
- [ ] Try-On: camera works → face tracks → shades apply → snapshot downloads
- [ ] Security: non-admin blocked from `admin.html`; checkout blocked without login