# 🍔 Grill Burger Hub

A full-stack food ordering and restaurant management system built with the MERN stack. Customers can browse the menu, customize orders with add-ons, place takeaway/dine-in/delivery orders, and track them live. The restaurant gets a real-time dashboard to manage incoming orders.

## 🌐 Live Demo

- **Customer Site:** https://grill-burger-hub.vercel.app
- **Restaurant Dashboard:** https://grill-burger-hub.vercel.app/dashboard
- **Admin Panel:** https://grill-burger-hub.vercel.app/admin

## ✨ Features

### Customer Side
- Browse menu with categories (Burgers, Fries, Drinks, Deals)
- Real food images uploaded via Cloudinary
- Item add-ons/customization (e.g. add fries or drink to a burger)
- Cart with quantity controls
- Checkout with Takeaway, Dine-in, or Delivery options
- Optional email receipt after order placement
- Unique order number (e.g. GBH-1001) on confirmation
- Live order tracking page with step-by-step status
- Optional customer account — register/login to view order history

### Restaurant Dashboard
- Password protected with JWT authentication
- Real-time incoming orders via Socket.io
- Order status management — Pending → Preparing → Ready → Out for Delivery → Completed
- Print receipt for any order
- Delete completed orders
- Daily sales summary (orders, revenue, completed, pending)

### Admin Panel
- Add, edit, delete menu items
- Upload real food images (stored on Cloudinary)
- Toggle item availability
- Attach add-ons to menu items
- Sales analytics — revenue graph, order volume, category breakdown (weekly/monthly)

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| Real-time | Socket.io |
| Auth | JWT + bcryptjs |
| Image Upload | Cloudinary |
| Email Receipt | EmailJS |
| Charts | Recharts |
| Deployment | Vercel (frontend) + Railway (backend) |

## 🚀 Running Locally

### Prerequisites
- Node.js
- MongoDB (local or Atlas)
- Cloudinary account
- EmailJS account

### Backend
```bash
cd server
npm install
```

Create a `.env` file in the `server` folder:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

```bash
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## 📁 Project Structure
```bash
grill-burger-hub/
├── server/
│   ├── config/        Cloudinary setup
│   ├── middleware/    JWT auth middleware
│   ├── models/        MongoDB schemas
│   ├── routes/        API routes
│   └── index.js       Server entry point
└── client/
├── src/
│   ├── components/  Navbar, CartDrawer, Modals
│   ├── context/     Cart and Auth context
│   └── pages/       All page components
└── public/
```

## 👨‍💻 Built By

Zeeshan Sajid — MERN Stack Project
