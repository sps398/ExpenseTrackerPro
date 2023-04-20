const bodyParser = require('body-parser');
const userRoutes = require('./routes/user');
const sequelize = require('./util/database');
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/user', userRoutes);

sequelize
    .sync()
    .then(result => {
        app.listen(3000);
    })
    .catch(err => console.log(err));