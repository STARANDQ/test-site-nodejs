const express = require('express');
const bodyParser = require('body-parser');
const urlShortener = require('node-url-shortener');

const app = express();
const path = require('path');
const port = process.env.PORT || 3100;


app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.use(express.urlencoded());

app.listen(port, () => console.log(`url-shortener listening on port ${port}!`));