const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  temperature: { type: Number, required: true },
  humidity:    { type: Number, required: true },
  smoke:       { type: Number, required: true },
  noise_level: { type: Number, required: true }
}, { _id: false });

const machineSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  temperature: { type: Number, required: true },
  vibration:   { type: Number, required: true },
  power_usage: { type: Number, required: true },
  noise_level: { type: Number, required: true },
  maintenance: { type: String, required: true }
}, { _id: false });

const sensorDataSchema = new mongoose.Schema({
  rooms:    { type: [roomSchema],    default: [] },
  machines: { type: [machineSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('SensorData', sensorDataSchema);
