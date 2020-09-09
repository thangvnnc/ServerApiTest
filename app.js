const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const PORT = 80;

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

var resStack = [];

app.get('/*', function(req, res) {
    res.render('pages/index');
});

app.post('/*', function (req, res) {
    io.emit('post', JSON.stringify(req.body));
    resStack.push(res);
});

io.on('connect', function (socket) {
    socket.on('response', function (body) {
        if (resStack.length > 0) {
            var res = resStack.pop();
            res.send(body);
        }
    })
});

server.listen(PORT, function (err) {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Server start port: ' + PORT);
});
