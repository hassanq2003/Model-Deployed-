// models/Warehouse.js
const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  cartons_num: { type: Number, required: true, default: 0 }
},{
  collection: 'Warehouse'  // Explicit collection name
});

module.exports = mongoose.model('Warehouse', warehouseSchema);
