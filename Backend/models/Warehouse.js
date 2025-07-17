// models/Warehouse.js
const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  cartons_num: { type: Number, required: true, default: 0 }
});

module.exports = mongoose.model('Warehouse', warehouseSchema);
