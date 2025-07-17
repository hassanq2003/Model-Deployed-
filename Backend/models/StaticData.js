// models/StaticData.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  // An array of light states (true = on, false = off)
  name:              { type: String, required: true },
  lights: {
    type: [Boolean],
    required: true,
    default: []          // you can initialize with [false, false] if you always have two lights
  }
}, { _id: false });

const machineSchema = new mongoose.Schema({
  name:              { type: String, required: true },
  manufacturer:      { type: String, required: true },
  model:             { type: String, required: true },
  installation_date: { type: Date,   required: true },
  location:          { type: String, required: true },
  power:             { type: Boolean, required: true}
}, { _id: false });

const staticDataSchema = new mongoose.Schema({
  rooms:    { type: [roomSchema],    default: [] },
  machines: { type: [machineSchema], default: [] }
},{
  collection: 'StaticData'  // Explicit collection name
});

module.exports = mongoose.model('StaticData', staticDataSchema);
