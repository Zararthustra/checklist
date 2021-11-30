const express = require('express');
const app = express()
const db = require("./models");
const cors = require('cors');
const routes = require('./routes/routes')


db.sequelize.sync();

app.listen(3001, () => {
    console.log("Server running on 3001");
})

app.use("/apiroutes", routes);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
