// connect database
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',      // or your DB host
    user: 'root',           // your DB username
    password: 'root', // your DB password
    database: 'history'  // your DB name
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});




// API SETUP
const express = require('express');
const app = express();
app.use(express.json()); // to parse JSON bodies

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`HTTP API server listening on port ${PORT}`);
});

// get data from the database - GET API
app.get('/chat/history/:roomId', (req, res) => {
    const roomId = req.params.roomId; // retrieves the room ID from the request parameters

    // pagination
    const page = parseInt(req.query.page) || 1; // retrieves the page number from the query parameters ('?page=2'), defaults to 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // retrieves the limit of messages per page from the query parameters, defaults to 10 if not provided
    const offset = (page - 1) * limit; // calculates how many messages to skip based on the page number and limit
    // if page = 1 and limit = 10, offset will be 0 (no messages skipped)
    // if page = 2 and limit = 10, offset will be 10 (skip the first 10 messages)
    // if page = 3 and limit = 10, offset will be 20 (skip the first 20 messages)

    const sql = 'SELECT * FROM messages WHERE room_id = ? LIMIT ? OFFSET ?'

    db.query(sql, [roomId,limit,offset], (err,result) => {
        if (err) {
            console.error('Error fetching messages from database:', err);
            res.status(500).send('Internal Server Error');
        }
        res.json(result); // sends the result as a JSON response
    });
});



// SOCKET.IO SERVER

// room banao
// by default room mein ghusna hai connected user ko
// and everyone inside the room should receive that message

const io = require('socket.io')(3000);
const users = {} // maps socket.id to user names
const userRooms = {}; // maps socket.id to room IDs

// {} initializes the variable 'users' as an empty javascript object
// this object will be used to store a mapping of 'socket.id' (socket.id is the unique ID for each connected client)


// everytime a user loads up the website, this function will be called
// and this function is going to give each of the users their own socket
io.on('connection', socket => {
    // 'connection' event is built in
    // 'socket' is an arrow function and acts as a callback
    // executed every time a new client connects

    console.log('A new user has connected: ' + (users[socket.id],socket.id)); // logs (name,socketId) of the newly connected user to the server's console

    socket.on('join-room', (data) => {
        const { name, roomId } = JSON.parse(data); // destructures the data object to get the name and roomId
        // parse converts the JSON string into a JavaScript object
        // console.log(name, roomId); // logs the name and roomId to the server's console
        // console.log(data, typeof data);

        users[socket.id] = name; // maps the client's connection ID to their name
        userRooms[socket.id] = roomId; // maps the client's connection ID to the room ID

        socket.join(roomId); // adds the user to the room with the specified roomId

        socket.emit('chat-message', {
            // sends a message to the user that they have joined the room
            name: 'Server', // name : 'Server' is the name of the sender, which is the server in this case
            message: `You joined ${roomId}` // message : 'You joined room ${roomId}' is the message that is sent to the user
        });


        // sends a message to all other users in the room that a new user has joined
        socket.broadcast.to(roomId).emit('chat-message', {
            name: 'Server',
            message: `A new user has joined the room: ${users[socket.id]}`
        });

        console.log(users, roomId); // logs the users and roomId to the server's console
    });

    socket.emit('chat-message', 'Hello world');
    // emits the event 'chat-message' to the client who is associated with the 'socket'
    // 'Hello world' is the data that is sent


    // when the event 'send-chat-message' is received
    socket.on('send-chat-message', message => {
        const roomId = userRooms[socket.id]; // retrieves the room ID for the socket
        const name = users[socket.id]; // retrieves the name of the user who sent the message

        // userRooms[socket.id] is used to get the room ID that the user is currently in
        // socket.rooms is a Set that contains the rooms the socket is currently in

        if (roomId) {
            socket.broadcast.to(roomId).emit('chat-message', {
                name : name,
                message : message
            });
            // sends the message to all the connected users except the sender
            // {message : message, name : users[socket.id]} - data being sent, it's an object containing the actual message text and the name of the user
        }
        // const roomId = Array.from(socket.rooms)[1]; // gets the room ID from the socket's rooms

        // store the message sent by the user in the database
        db.query(
            'INSERT INTO messages (room_id, sender_id, message) VALUES (?,?,?)',
            [roomId, name, message],
            (err, results) => {
                if (err) {
                    console.error('Error inserting message into database:', err);
                } else {
                    console.log('Message inserted into database:', results);
                }
            }
        );

        console.log()

        console.log(socket.rooms); // logs the rooms the socket is currently in
        console.log(roomId); // logs the room ID to the server's console
        
        console.log(message); // logs the received message to the server's console
    });

    // fires automatically when a user disconnects from the server
    socket.on('disconnect', () => {
        const name = users[socket.id]; // retrieves the name of the user who disconnected
        const roomId = userRooms[socket.id]; // retrieves the room ID of the user who disconnected

        if (roomId && name) {
            socket.broadcast.to(roomId).emit('user-disconnected', name); // sends a message to all other users in the room that the user has disconnected
            // 'user-disconnected' is the event that is emitted to the other users in the room
            // name is the name of the user who disconnected

            console.log(`${name} has left the room ${roomId}`); // logs the name of the user who disconnected and the room they were in
        }

        delete users[socket.id];
        delete userRooms[socket.id];
    });
});




// TODO


// 1 - table banani hai jo chat room ka message store kregi
// 2 - create an API to get the messages from the database
// 3 - connect database to the server





// horizontal scaling
// vertical scaling
// socket.io redis adapter
// load balancer