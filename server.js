const dotenv = require('dotenv');
const http = require('http');
const path = require('path');
const express = require('express');
const compression = require('compression');

dotenv.config();

let wss;
let server;

const ip = process.env.IP || '0.0.0.0';
const port = process.env.PORT || 8080;

const app = express();
app.enable('trust proxy');
app.use(compression());
app.use(function(req, res, next) {
    if (process.env.NODE_ENV != 'development' && req.protocol !== 'https') {
       return res.redirect('https://' + req.headers.host + req.url);
    }

    next();
});
app.use(express.static(path.join(__dirname, './dist')));
app.get('*', function response(req, res) {
    console.log(req.secure);
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

server = new http.createServer(app);

server.on('error', err => console.log('Server error:', err));
server.listen(port);
console.log('Server started - '+ip+':'+port);