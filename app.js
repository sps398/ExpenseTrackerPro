global.__basedir = __dirname;

const bodyParser = require('body-parser');
const userRoutes = require('./routes/user');
const dashboardRoutes = require('./routes/dashboard');
const premiumRoutes = require('./routes/premium');
const purchaseRoutes = require('./routes/purchase');
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const Razorpay = require('razorpay');
const ejs = require('ejs');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

app.set('view engine', 'ejs');
app.set('views', path.join(__basedir, 'views'));
app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(helmet());
app.use(morgan('combined', { stream: accessLogStream }));

app.use('/user', userRoutes);
app.use('/', dashboardRoutes);
app.use('/premium', premiumRoutes);
app.use('/purchase', purchaseRoutes);

app.use('/', (req, res) => {
    res.redirect('/dashboard/expense.html');
})

app.use((req, res) => {
    console.log(req.url);
    res.sendFile(path.join(__dirname, `public/${req.url}`));
});

mongoose.connect(process.env.DB_CONN_STRING)
    .then(result => {
        console.log('connected to mongodb...');
        app.listen(3000, () => {
            const port = process.env.PORT || 3000;
            console.log(`Listening at port ${port}...`);
        })
    })
    .catch(err => console.log(err));