//set timezone to WIB (UTC+7)
process.env.TZ = 'Asia/Jakarta';

//import express
const express = require('express');

//import CORS
const cors = require('cors');

//import bodyParser
const bodyParser = require('body-parser');

//import router
const router = require('./routes');

//init app
const app = express();

//use cors
app.use(cors());

//use body parser
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//define port
const port = process.env.PORT || 3001;

//route
app.get('/', (req, res) => {
    res.send('Sensor Data Collection API - Running');
});

//define routes
app.use('/api', router);

//start server
app.listen(port, () => {
    console.log(`Sensor API server started on port ${port}`);
});
