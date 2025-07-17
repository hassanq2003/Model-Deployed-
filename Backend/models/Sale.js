const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  cartons_sold: { type: Number, required: true },
  DateTime:     { type: Date,   required: true },
  Buyer:        { type: String, required: true }
},
{
  collection: 'Sale'
});

module.exports = mongoose.model('Sale', saleSchema);
