// routes/data.js
const express = require('express');
const router  = express.Router();

const StaticData = require('../models/StaticData');
const SensorData = require('../models/SensorData');
const Warehouse  = require('../models/Warehouse');
const Cartons    = require('../models/CartonsAddition');
const Sale    = require('../models/Sale');
const authenticateToken = require('../middleware/auth');

// Helper to merge two objects, giving precedence to sensorProps
function mergeProps(staticProps = {}, sensorProps = {}) {
  return { ...staticProps, ...sensorProps };
}

// GET /data/all
// Returns combined rooms, machines, and cartons_num
router.get('/all', /*authenticateToken*/, async (req, res) => {
  try {
    const [staticDoc, sensorDoc, wh] = await Promise.all([
      StaticData.findOne().lean(),
      SensorData.findOne().lean(),
      Warehouse.findOne().lean()
    ]);

    const staticRooms    = staticDoc?.rooms    || [];
    const sensorRooms    = sensorDoc?.rooms    || [];
    const staticMachines = staticDoc?.machines || [];
    const sensorMachines = sensorDoc?.machines || [];

    // Combine rooms by iterating staticRooms
    const rooms = staticRooms.map(st => {
      const sr = sensorRooms.find(r => r.name === st.name) || {};
      return mergeProps(st, sr);
    });

    // Combine machines by iterating staticMachines
    const machines = staticMachines.map(st => {
      const sd = sensorMachines.find(m => m.name === st.name) || {};

      if (st.power === false) {
        // If machine is off, sensor values zero and maintenance 'Unavailable'
        return {
          ...st,
          temperature: 0,
          vibration: 0,
          power_usage: 0,
          noise_level: 0,
          maintenance: 'Unavailable'
        };
      }

      // Machine is on: merge real sensor data
      return mergeProps(st, sd);
    });

    res.json({
      rooms,
      machines,
      cartons_num: wh?.cartons_num ?? 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching combined data');
  }
});

// GET /data/rooms
// Returns combined room data only
router.get('/rooms', authenticateToken, async (req, res) => {
  try {
    const [staticDoc, sensorDoc] = await Promise.all([
      StaticData.findOne().lean(),
      SensorData.findOne().lean()
    ]);

    const staticRooms = staticDoc?.rooms || [];
    const sensorRooms = sensorDoc?.rooms || [];

    const rooms = staticRooms.map(st => {
      const sr = sensorRooms.find(r => r.name === st.name) || {};
      return mergeProps(st, sr);
    });

    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching rooms data');
  }
});

// GET /data/machines
// Returns combined machine data only
router.get('/machines', authenticateToken, async (req, res) => {
  try {
    const [staticDoc, sensorDoc] = await Promise.all([
      StaticData.findOne().lean(),
      SensorData.findOne().lean()
    ]);

    const staticMachines = staticDoc?.machines || [];
    const sensorMachines = sensorDoc?.machines || [];

    const machines = staticMachines.map(st => {
      const sd = sensorMachines.find(m => m.name === st.name) || {};

      if (st.power === false) {
        // If machine is off, sensor values zero and maintenance 'Unavailable'
        return {
          ...st,
          temperature: 0,
          vibration: 0,
          power_usage: 0,
          noise_level: 0,
          maintenance: 'Unavailable'
        };
      }

      // Machine is on: merge real sensor data
      return mergeProps(st, sd);
    });

    res.json(machines);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching machines data');
  }
});


// GET /data/warehouse
// Returns just the cartons count
router.get('/warehouse', authenticateToken, async (req, res) => {
  try {
    const wh = await Warehouse.findOne().lean();
    res.json({ cartons_num: wh?.cartons_num ?? 0 });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching warehouse data');
  }
});


//Analytics Routes
router.get('/analytics/week', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 6);
    weekAgo.setHours(0,0,0,0);

    // Helper to build an array of dates (YYYY-MM-DD) from weekAgo → today
    const dates = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(weekAgo);
      d.setDate(weekAgo.getDate() + i);
      return d.toISOString().slice(0,10);
    });

    // Aggregate cartons_produced by day
    const prodAgg = await Cartons.aggregate([
      { $match: { DateTime: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$DateTime" } },
          total: { $sum: "$cartons_produced" }
        }
      }
    ]);

    // Aggregate cartons_sold by day
    const soldAgg = await Sale.aggregate([
      { $match: { DateTime: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$DateTime" } },
          total: { $sum: "$cartons_sold" }
        }
      }
    ]);

    // Map results onto the 7-day window, defaulting to 0
    const cartons_production_week = dates.map(d =>
      (prodAgg.find(x => x._id === d)?.total) || 0
    );
    const sales_num_week = dates.map(d =>
      (soldAgg.find(x => x._id === d)?.total) || 0
    );

    res.json({ cartons_production_week, sales_num_week });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching weekly analytics');
  }
});

// GET /data/analytics/month
// Returns cartons produced & sold for each of the past 30 days
router.get('/analytics/month', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setDate(today.getDate() - 29);
    monthAgo.setHours(0,0,0,0);

    const dates = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date(monthAgo);
      d.setDate(monthAgo.getDate() + i);
      return d.toISOString().slice(0,10);
    });

    const prodAgg = await Cartons.aggregate([
      { $match: { DateTime: { $gte: monthAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$DateTime" } },
          total: { $sum: "$cartons_produced" }
        }
      }
    ]);

    const soldAgg = await Sale.aggregate([
      { $match: { DateTime: { $gte: monthAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$DateTime" } },
          total: { $sum: "$cartons_sold" }
        }
      }
    ]);

    const cartons_production_month = dates.map(d =>
      (prodAgg.find(x => x._id === d)?.total) || 0
    );
    const sales_production_month = dates.map(d =>
      (soldAgg.find(x => x._id === d)?.total) || 0
    );

    res.json({ cartons_production_month, sales_production_month });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching monthly analytics');
  }
});

module.exports = router;
