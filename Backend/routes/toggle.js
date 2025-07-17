// routes/toggle.js
const express = require('express');
const router  = express.Router();
const StaticData = require('../models/StaticData');
const authenticateToken = require('../middleware/auth');

// POST /toggle/lights
// Body: { room_name: String, light_num: Number }
router.post('/lights', authenticateToken, async (req, res) => {
  const { room_name, light_num } = req.body;
  if (typeof room_name !== 'string' || typeof light_num !== 'number') {
    return res.status(400).send('room_name (string) and light_num (number) required');
  }

  try {
    const sd = await StaticData.findOne();
    if (!sd) return res.status(404).send('No static data found');

    // Find the room by name
    const room = sd.rooms.find(r => r.name === room_name);
    if (!room) return res.status(404).send(`Room "${room_name}" not found`);

    // Validate light index
    if (light_num < 0 || light_num >= room.lights.length) {
      return res.status(400).send(`light_num must be between 0 and ${room.lights.length - 1}`);
    }

    // Toggle the light
    room.lights[light_num] = !room.lights[light_num];

    await sd.save();
    res.json({ room_name, lights: room.lights });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error toggling light');
  }
});

// POST /toggle/machine
// Body: { machine_name: String }
router.post('/machine', authenticateToken, async (req, res) => {
  const { machine_name } = req.body;
  if (typeof machine_name !== 'string') {
    return res.status(400).send('machine_name (string) required');
  }

  try {
    const sd = await StaticData.findOne();
    if (!sd) return res.status(404).send('No static data found');

    // Find the machine by name
    const machine = sd.machines.find(m => m.name === machine_name);
    if (!machine) return res.status(404).send(`Machine "${machine_name}" not found`);

    // Toggle the power state
    machine.power = !machine.power;

    await sd.save();
    res.json({ machine_name, power: machine.power });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error toggling machine power');
  }
});

module.exports = router;
