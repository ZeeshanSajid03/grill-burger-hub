const express       = require('express');
const http          = require('http');
const { Server }    = require('socket.io');
const mongoose      = require('mongoose');
const cors          = require('cors');
require('dotenv').config();

const menuRoutes     = require('./routes/menu');
const orderRoutes    = require('./routes/order');
const authRoutes     = require('./routes/auth');
const customerRoutes = require('./routes/customer');
const deliveryZoneRoutes = require('./routes/deliveryZones');
const riderRoutes = require('./routes/riders');
const settingsRoutes      = require('./routes/settings');
const reviewRoutes        = require('./routes/reviews');
const discountCodeRoutes  = require('./routes/discountCodes');

const app        = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://grill-burger-hub.vercel.app'
    ]
  }
});

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://grill-burger-hub.vercel.app'
  ]
}));

app.use(express.json());
app.set('io', io);

app.use('/api/menu',      menuRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/auth',      authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/delivery-zones', deliveryZoneRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/settings',       settingsRoutes);
app.use('/api/reviews',        reviewRoutes);
app.use('/api/discount-codes', discountCodeRoutes);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    httpServer.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error('MongoDB error:', err));