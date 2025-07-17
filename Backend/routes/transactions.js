// routes/transactions.js
const express   = require('express');
const router    = express.Router();
const Sale      = require('../models/Sale');
const Cartons   = require('../models/CartonsAddition');
const Warehouse = require('../models/Warehouse');
const authenticateToken = require('../middleware/auth');

// POST /tx/sale — add a sale and decrement cartons
router.post('/sale', /*authenticateToken,*/ async (req, res) => {
  const { cartons_sold, DateTime, Buyer } = req.body;
  if (typeof cartons_sold !== 'number' || !DateTime || !Buyer) {
    return res.status(400).send('Invalid fields');
  }
  try {
    let wh = await Warehouse.findOne();
    if (!wh || wh.cartons_num < cartons_sold) {
      return res.status(400).send('Insufficient cartons');
    }

    const sale = new Sale({
      cartons_sold,
      DateTime: new Date(DateTime),
      Buyer
    });
    await sale.save();

    wh.cartons_num -= cartons_sold;
    await wh.save();

    res.json(sale);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding sale');
  }
});

// POST /tx/cartons — add cartons and increment count
router.post('/cartons', /*authenticateToken,*/ async (req, res) => {
  const { cartons_produced, DateTime } = req.body;
  if (typeof cartons_produced !== 'number' || !DateTime) {
    return res.status(400).send('Invalid fields');
  }
  try {
    const addition = new Cartons({
      cartons_produced,
      DateTime: new Date(DateTime)
    });
    await addition.save();

    // increment (or create) the single Warehouse doc
    const wh = await Warehouse.findOneAndUpdate(
      {},
      { $inc: { cartons_num: cartons_produced } },
      { new: true, upsert: true }
    );

    res.json({ addition, cartons_num: wh.cartons_num });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding cartons');
  }
});

module.exports = router;
