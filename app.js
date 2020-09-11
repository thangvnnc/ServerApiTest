const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const PORT = 80;

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static(path.join(__dirname, 'public')));

function getBodyTextMiddleware(req, res, next) {
    var data='';
    req.setEncoding('utf8');
    req.on('data', function(chunk) { 
       data += chunk;
    });

    req.on('end', function() {
        req.text = data;
        next();
    });
}

var resStack = [];

app.get('/*', function(req, res) {
    res.render('pages/index');
});

app.post('/*', getBodyTextMiddleware, function (req, res) {
    io.emit('post', req.text);
    resStack.push(res);
});

io.on('connect', function (socket) {
    socket.on('response', function (body) {
        if (resStack.length > 0) {
            var res = resStack.pop();
            res.send(body);
            res.end();
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
