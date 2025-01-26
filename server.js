const http = require('http');
const express = require('express');
const cors = require('cors');
const socketIO = require('socket.io');

const app = express();
require('dotenv').config();
const port = process.env.PORT || 4001;  

app.use(cors());

app.get('/', (req, res)=>{
    res.send("Server is working");
})

const server = http.createServer(app);

// Setting up a socket with the server  
const io = socketIO(server);

io.on('connection', (socket)=>{
    console.log("New connection");
    
    let users = {};

    socket.on('joined', ({user})=>{
        // an array for all the users in the chat
        users[socket.id] = user; // every socket has a unique socket id
        console.log(`${user} has joined the chat`);

        // message to the newly joined user
        socket.emit('welcome', {user:"Admin", message:`Welcome to the chat, ${user}`});

        // notify the other users that someone has joined the chat
        socket.broadcast.emit('userJoined', {user:"Admin", message:`${users[socket.id]} has joined the chat`});  
    });

    // messaging
    socket.on('message', ({message, id})=>{
        io.emit('sendMessage', {user:users[socket.id], message, id:socket.id});
    })

    socket.on('disconnected', ()=>{
        socket.broadcast.emit('leave', {user:"Admin", message:`${users[socket.id]} has left the chat`});
        console.log("User left the chat");
    })

    
    
    
})


server.listen(port, () => console.log(`Server started at port ${port}`));
