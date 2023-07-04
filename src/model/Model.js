const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const modelSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const Model = mongoose.model('Model', modelSchema);

module.exports = Model;
