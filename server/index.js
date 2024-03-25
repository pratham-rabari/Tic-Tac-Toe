const express = require('express');
const { createServer } = require('node:http');
const cors = require("cors")
const { Server } = require('socket.io');
const { Socket } = require('node:dgram');
const { Console } = require('node:console');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    // https://tic-tac-toe-pr.netlify.app/
    cors: {
        origin: "https://tic-tac-toe-pr.netlify.app/",
        methods: ["GET", "POST"],
        credentials: true
    }
});
app.use(cors())

app.get('/', (req, res) => {
    res.send("hello")
});

const allUsers = {};

io.on('connection', (socket) => {
    allUsers[socket.id] = {
        socket: socket,
        online: true,
        playing: false,
    }

    socket.on("request-to-play", (data) => {
        const CurrentPlayer = allUsers[socket.id]
        CurrentPlayer.username = data.username?data.username:""
        let oppenentplayer;
        let oid;

        for (const i in allUsers) {
            const user = allUsers[i];
            if (user.online && !user.playing && socket.id !== i) {
                oppenentplayer = user;
                oid = i
                break;
            }
        }
        if (oppenentplayer) {
            oppenentplayer.playing = true;
            CurrentPlayer.playing = true;
            CurrentPlayer.socket.emit("oppenent-found", {
                name: oppenentplayer.username?oppenentplayer.username:"",
                curr: oid,
                playingas: 'circle'
            })

            oppenentplayer.socket.emit("oppenent-found", {
                name: CurrentPlayer.username?CurrentPlayer.username:"",
                curr: socket.id,
                playingas: 'cross'
            })

            CurrentPlayer.socket.on("playermovefromclient", (data) => {
                oppenentplayer.socket.emit("playerMoveFromServer", {
                    ...data
                })
            })

            oppenentplayer.socket.on("playermovefromclient", (data) => {
                CurrentPlayer.socket.emit("playerMoveFromServer", {
                    ...data
                })
            })

        }
        else {
            CurrentPlayer.socket.emit("opponenet-not-found")
        }
    })

    // via room
    

    socket.on("Send-Message", (data) => {
        socket.to(data.oppoId).emit("recive-message", { data })
    })

    socket.on('disconnect', function () {
        const currentuser = allUsers[socket.id]
        currentuser.online = false;
        currentuser.playing = false;
    }
    )
});



server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});