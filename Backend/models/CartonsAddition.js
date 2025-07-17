const mongoose = require('mongoose');

const cartonsAdditionSchema = new mongoose.Schema({
  cartons_produced: { type: Number, required: true },
  DateTime:          { type: Date,   required: true },
  
},
{
  collection: 'CartonsAddition'  // Explicit collection name
});

module.exports = mongoose.model('CartonsAddition', cartonsAdditionSchema);
