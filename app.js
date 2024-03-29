global.__basedir = __dirname;

const bodyParser = require('body-parser');
const userRoutes = require('./routes/user');
const dashboardRoutes = require('./routes/dashboard');
const premiumRoutes = require('./routes/premium');
const purchaseRoutes = require('./routes/purchase');
const sequelize = require('./util/database');
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const Entry = require('./models/entry');
const User = require('./models/user');
const ForgotPasswordRequests = require('./models/forgotpasswordrequest');
const FilesDownloaded = require('./models/filesdownloaded');
const Order = require('./models/order');
const Razorpay = require('razorpay');
const ejs = require('ejs');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

app.set('view engine', 'ejs');
app.set('views', path.join(__basedir, 'views'       ));
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

User.hasMany(Entry);
Entry.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgotPasswordRequests);
ForgotPasswordRequests.belongsTo(User);

User.hasMany(FilesDownloaded);
FilesDownloaded.belongsTo(User);

sequelize
    .sync()
    .then(result => {
        const port = process.env.PORT || 3000;
        app.listen(port);
    })
    .catch(err => console.log(err));