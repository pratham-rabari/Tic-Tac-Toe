const express = require('express');
const { createServer } = require('node:http');
const cors = require("cors")
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
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
    }


    socket.on("request-to-play", (data) => {
        const CurrentPlayer = allUsers[socket.id]
        CurrentPlayer.username = data.username
             
        let oppenentplayer;
        let oid;

        for (const i in allUsers) {
            const user = allUsers[i];
            if (user.online && !user.playing && socket.id !== i) {
                oppenentplayer = user;
                oid=i
                break;
            }
        }
        if (oppenentplayer) {
            CurrentPlayer.socket.emit("oppenent-found", {
                name: oppenentplayer.username,
                curr:oid,
                playingas: 'circle'
            })

            oppenentplayer.socket.emit("oppenent-found", {
                name: CurrentPlayer.username,
                curr:socket.id,
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

     socket.on("Send-Message",(data)=>{
        socket.to(data.oppoId).emit("recive-message",{data})
     })

    socket.on('disconnect', function () {
        const currentuser = allUsers[socket.id]
        currentuser.online = false;
    }
    )
});



server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});