const express = require('express');
const router  = express.Router();
const SensorData = require('../models/SensorData');

// Uncommend these lines if you want authentication for updating sensors data
//const authenticateToken = require('../middleware/auth');

// PUT /data/update — replace entire sensor data document
router.put('/',/* authenticateToken,*/ async (req, res) => {
  const { rooms, machines } = req.body;
  if (!Array.isArray(rooms) || !Array.isArray(machines)) {
    return res.status(400).send('rooms and machines must be arrays');
  }

  try {
    const updated = await SensorData.findOneAndUpdate(
      {}, 
      { rooms, machines },
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating sensor data');
  }
});

module.exports = router;
