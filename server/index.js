const express = require('express')
const PORT = 2000
const db = require('./models')

const server = (express())

server.use(express.json())


server.listen(PORT, () => {
    db.sequelize.sync({ alter : true })
    console.log(`server is running at port : ${PORT}`);
})