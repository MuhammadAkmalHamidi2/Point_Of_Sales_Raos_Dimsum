require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// Database Model
const db = require('./models');

// Import Routers
const authRoutes = require('./routers/auth-router');
const categoryRoutes = require('./routers/category-router');
const produkRoutes = require('./routers/produk-router');
const penjualanRoutes = require('./routers/penjualan-router');
const absenRoutes = require('./routers/absen-router');

const server = express();
const PORT = process.env.PORT;

// =====================================================
// MIDDLEWARE
// =====================================================
server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// =====================================================
// STATIC FILES
// =====================================================
// Menyajikan seluruh isi folder public (termasuk /public/produk dan /public/absen)
server.use('/public', express.static(path.join(__dirname, 'public')));

// =====================================================
// ROUTES
// =====================================================
server.get('/', (req, res) => {
  res.json({
    message: 'POS Raos Dimsum API is running',
  });
});

server.use('/api/auth', authRoutes);
server.use('/api/categories', categoryRoutes);
server.use('/api/products', produkRoutes);
server.use('/api/penjualan', penjualanRoutes);
server.use('/api/absen', absenRoutes);

// =====================================================
// START SERVER
// =====================================================
server.listen(PORT, () => {
  // db.sequelize.sync({ alter: true });
  console.log(`Server is running at port : ${PORT}`);
});