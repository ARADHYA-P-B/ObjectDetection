const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const detectionSchema = new Schema({
  objectType: { type: String, required: true,enum:['book','pen','paper'] },
  confidence: { type: Number, required: true,min:0,max:100 },
  timestamp: { type: Date, default: Date.now },
});

const Detection = mongoose.model('Detection', detectionSchema);

module.exports = Detection;