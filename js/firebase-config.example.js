// ============================================================
// FIREBASE CONFIGURATION
// ============================================================
// HOW TO GET YOUR KEYS:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project (name it anything, e.g. "beauty-store")
// 3. Click the gear icon > Project Settings
// 4. Scroll down to "Your apps" > Click the web icon (</> )
// 5. Register app with nickname "beauty-store-web"
// 6. Copy the firebaseConfig object and paste it below
// ============================================================

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Auth — handles user login/signup
const auth = firebase.auth();

// Firestore — database for products, users, orders, cart
const db = firebase.firestore();

// Storage — for uploading product images
const storage = firebase.storage();

// ============================================================
// FIREBASE SECURITY RULES (paste these in Firebase Console):
// Firestore Rules:
// ============================================================
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//
//     // Admin can do everything
//     match /products/{productId} {
//       allow read: if true;
//       allow write: if request.auth != null && request.auth.token.admin === true;
//     }
//
//     // Users can only read/write their own data
//     match /users/{userId} {
//       allow read, write: if request.auth != null && request.auth.uid == userId;
//     }
//
//     // Users can read/write their own cart
//     match /carts/{userId} {
//       allow read, write: if request.auth != null && request.auth.uid == userId;
//     }
//
//     // Users can read/write their own orders
//     match /orders/{orderId} {
//       allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
//       allow create: if request.auth != null;
//     }
//   }
// }
