const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const detectionsRouter = require('./routes/detection');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/detections', detectionsRouter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB connection established successfully");
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
