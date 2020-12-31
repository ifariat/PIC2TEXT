const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const api = require('./routes/api.js');

app.set('view engine', 'ejs');
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb'}));
app.use("/public", express.static('public'));

app.use('/', api);
app.listen(process.env.PORT, () => {
    //console.log(`listening on port ${process.env.PORT}`)
})

