const express = require("express");
const app = express();
let http = require('http').Server(app);

const port = process.env.PORT || 3000;
let io = require('socket.io')(http)

app.use(express.static('public'));
let numClients = 0;

http.listen(port, () => {
    console.log('listening on', port);
});

io.on('connection', socket => {
    console.log('a user connected');

    socket.on('create or join', room => {
        console.log('create or join to room', room);
        // console.log("ROOM", io.sockets.adapter.rooms[room]);
        // const myRoom = io.sockets.adapter.rooms[room] || {length: 0};
        // const numClients = myRoom.length;
        console.log(room, 'has', numClients, 'clients');

        if (numClients == 0) {
            socket.join(room);
            numClients++;
            socket.emit('created', room);
        } else if (numClients == 1) {
            socket.join(room);
            numClients++;
            socket.emit('joined', room);
        } else {
            socket.emit('full', room);
        }
    });

    socket.on('ready', room => {
        socket.broadcast.to(room).emit('ready');
    });

    socket.on('candidate', event => {
        socket.broadcast.to(event.room).emit('candidate', event);
    });

    socket.on('offer', event => {
        console.log("offer", event);
        socket.broadcast.to(event.room).emit('offer', event.sdp);
    });

    socket.on('answer', event => {
        socket.broadcast.to(event.room).emit('answer', event.sdp);
    })
})

