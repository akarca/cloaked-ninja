var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var GSDL = require('gs-dl').GSDL;
var util = require('util');
var md5 = require("blueimp-md5").md5;
var lodash = require("lodash");

var gsdl = {};

var Message = function (type, msg) {
    this.type = type;
    this.msg = msg;
};

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');

    var base_url = req.url.split('f=')[1];
    var url = decodeURIComponent(base_url.replace(/\+/g, " "));
    var key = md5(base_url);

    if (!(key in gsdl)) {
        gsdl[key] = {
            obj: new GSDL(),
            messages: [],
            done: false,
            socs: []
        };
        gsdl[key].obj.getInfoFromToken(gsdl[key].obj.getTokenFromURL(url), function (err, info) {
            if (err) {
                console.error(err);
                soc.emit("info", err);
                return err;
            }
            var msg = "\n[INFO] Downloading... " + url;

            gsdl[key].messages.push(new Message("info", msg));
            gsdl[key].obj.download(info, gsdl[key].obj.buildFilenameFromInfo(info));

            console.log(msg);

            lodash.each(gsdl[key].socs, function (soc) {
                soc.emit('info', msg);
            });
        });

        gsdl[key].obj.on('info', function (message) {
            var msg = "\n[INFO] " + message;
            gsdl[key].messages.push(new Message("info", msg));
            lodash.each(gsdl[key].socs, function (soc) {
                soc.emit('info', msg);
            });
        });
        gsdl[key].obj.on('end', function () {
            var msg = new Message("info", "\n[INFO] Download finished");
            gsdl[key].done = true;
            gsdl[key].socs = [];
            gsdl[key].messages.push(msg);
            console.log(msg.msg);
            lodash.each(gsdl[key].socs, function (soc) {
                soc.emit(msg.type, msg.info);
            });
        });
        gsdl[key].obj.on('progress', function (info) {
            var message = util.format("\r[INFO] %s -> %s% (%s/%s)", info.filename, info.percentage.toFixed(2), info.completed, info.total);
            gsdl[key].messages.push(new Message("progress", message));
            lodash.each(gsdl[key].socs, function (soc) {
                soc.emit('progress', message);
            });
        });
    }
});

io.on('connection', function (socket) {
    var soc = socket.broadcast.to(socket.id);
    socket.on('register', function (key) {
        lodash.each(gsdl[key].messages, function (message) {
            soc.emit(message.type, message.msg);
        });
        if (!gsdl[key].done) {
            gsdl[key].socs.push(soc);
        }
    });
});

server.listen(3142, function () {
    console.log('listening on *:3142');
});
