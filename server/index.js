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

const app        = express();
const httpServer = http.createServer(app);
const io         = new Server(httpServer, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.set('io', io);

app.use('/api/menu',      menuRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/auth',      authRoutes);
app.use('/api/customers', customerRoutes);

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