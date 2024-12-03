const router = require('express').Router();
const Detection = require('../models/Detection');

// Get all detections
router.get('/', async (req, res) => {
  try {
    const detections = await Detection.find()
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(detections);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});


router.post('/add', async (req, res) => {
  try {
    const { objectType, confidence } = req.body;
    
    const newDetection = new Detection({
      objectType,
      confidence,
      timestamp: new Date()
    });

    const savedDetection = await newDetection.save();
    res.json(savedDetection);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});



router.get('/stats', async (req, res) => {
  try {
    const stats = await Detection.aggregate([
      {
        $group: {
          _id: '$objectType',
          avgConfidence: { $avg: '$confidence' },
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

module.exports = router;