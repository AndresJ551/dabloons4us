const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  username_low: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  dabloons: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = {
    userSchema
}