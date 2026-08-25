require('dotenv').config();

const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 2000;
const db = require('./models');
const path = require("path");


const server = express();

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use(
  "/public/produk",
  express.static(
    path.join(__dirname, "public/produk")
  )
);

server.use('/api/auth', require('./routers/auth-router'));

const categoryRoutes = require('./routers/category-router');
const produkRoutes = require("./routers/produk-router");
const penjualanRoutes = require("./routers/penjualan-router");
const karyawanRoutes = require("./routers/karyawan-router");
const outletRoutes = require("./routers/outlet-router");

server.use('/api/categories', categoryRoutes);
server.use("/api/products", produkRoutes);
server.use("/api/penjualan", penjualanRoutes);
server.use("/api/karyawan", karyawanRoutes);
server.use("/api/outlets", outletRoutes);


server.get('/', (req, res) => {
    res.json({
        message: 'POS Raos Dimsum API is running'
    });
});

server.listen(PORT, () => {
    // db.sequelize.sync({ alter: true })
    console.log(`server is running at port : ${PORT}`);
});