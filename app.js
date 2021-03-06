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
    var data = '';
    req.setEncoding('utf8');
    req.on('data', function (chunk) {
        data += chunk;
    });

    req.on('end', function () {
        req.text = data;
        next();
    });
}

var resStack = [];
var bodyResStack = [];
var resTemp = null;
var bodyResTemp = null;

app.get('/*', function (req, res) {
    res.render('pages/index');
});

app.post('/*', getBodyTextMiddleware, function (req, res) {
    var query_index = req.originalUrl.indexOf('?');
    var query_string = (query_index>=0)?req.originalUrl.slice(query_index+1):'';
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    io.emit('log', "Request url: \n" + fullUrl);
    io.emit('log', "Request params: \n" + query_string);
    io.emit('log', "Request body: \n" + req.text);
    io.emit('post', req.text);
    resStack.push(res);
});

function loopResBody() {
    setTimeout(function () {
        if (resTemp === null) {
            if (resStack.length > 0) {
                resTemp = resStack.pop();
            }
        }
        if (bodyResTemp === null) {
            if (bodyResStack.length > 0) {
                bodyResTemp = bodyResStack.pop();
            }
        }

        if ((resTemp !== null) && (bodyResTemp !== null)) {
            let splitString = bodyResTemp.split("_");
            if (splitString[0] === "STATUS") { 
                let statusCode = parseInt(splitString[1]);
                io.emit('log', bodyResTemp);
                resTemp.status(statusCode).send("Server error 500");
            }
            else if (bodyResTemp === "TIMEOUT") {
                io.emit('log', bodyResTemp);
            }
            else {
                io.emit('log', "Response body: \n" + bodyResTemp);
                resTemp.send(bodyResTemp);
            }

            resTemp = null;
            bodyResTemp = null;
        }

        loopResBody();
    }, 10);
}

loopResBody();

function clearBodyResStack() {
    while (bodyResStack.length > 0) {
        bodyResStack.pop();
    }
    bodyResTemp = null;
}

io.on('connect', function (socket) {
    socket.on('response', function (bodys) {
        clearBodyResStack();
        io.emit('log', "Stack body response");
        bodyResStack = bodyResStack.concat(bodys);
        bodyResStack.reverse();
    })
});

server.listen(PORT, function (err) {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Server start port: ' + PORT);
});
