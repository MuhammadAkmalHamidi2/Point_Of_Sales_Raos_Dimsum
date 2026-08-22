require('dotenv').config();

const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 2000;
const db = require('./models');

const server = express();
server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use('/api/auth', require('./routers/auth-router'));

server.get('/', (req, res) => {
    res.json({ message: 'POS Raos Dimsum API is running' })
})

server.listen(PORT, () => {
    // db.sequelize.sync({ alter: true })
    console.log(`server is running at port : ${PORT}`);
})