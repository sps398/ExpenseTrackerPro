const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const entrySchema = new Schema({
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  entryType: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true
  }
});

const Entry = mongoose.model('Entry', entrySchema);

module.exports = Entry;


// const Sequelize = require('sequelize');

// const sequelize = require('../util/database');

// const Entry = sequelize.define('entries', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//       },
//       amount: {
//         type: Sequelize.INTEGER,
//         allowNull: false
//       },
//       description: {
//         type: Sequelize.STRING,
//         allowNull: false
//       },
//       category: {
//         type: Sequelize.STRING,
//         allowNull: false
//       },
//       date: {
//         type: Sequelize.DATEONLY,
//         allowNull: false
//       },
//       entryType: {
//         type: Sequelize.STRING,
//         allowNull: false
//       }
// });