// room banao
// by default room mein ghusna hai connected user ko
// and everyone inside the room should receive that message


const io = require('socket.io')(3000);
const users = {}
// {} initializes the variable 'users' as an empty javascript object
// this object will be used to store a mapping of 'socket.id' (socket.id is the unique ID for each connected client)


// everytime a user loads up the website, this function will be called
// and this function is going to give each of the users their own socket
io.on('connection', socket => {
    // 'connection' event is built in
    // 'socket' is an arrow function and acts as a callback
    // executed every time a new client connects


    socket.on('join-room', roomId => {
        socket.join(roomId) // adds the user to the room with the specified roomId
        socket.emit('chat-message', 'You joined room: ' + roomId) // sends a message to the user that they have joined the room
        socket.broadcast.to(roomId).emit('chat-message', 'A new user has joined the room: ' + users[socket.id]) // sends a message to all other users in the room that a new user has joined
    })

    // this function runs when the event 'new-user' event is received from this client
    socket.on('new-user', name => {
        users[socket.id] = name // maps the client's connection ID to their name
        console.log(users)
        socket.broadcast.emit('user-connected', name) // sends a message to all other client saying a new user has connected except the sender
    })


    socket.emit('chat-message', 'Hello world')
    // emits the event 'chat-message' to the client who is associated with the 'socket'
    // 'Hello world' is the data that is sent

    // when the event 'send-chat-message' is received
    socket.on('send-chat-message', message => {
        const roomId = Array.from(socket.rooms)[1]; // gets the room ID from the socket's rooms
        console.log(socket.rooms); // logs the rooms the socket is currently in
        console.log(roomId); // logs the room ID to the server's console
        
        console.log(message); // logs the received message to the server's console
        socket.broadcast.to(roomId).emit('chat-message', {message : message, name : users[socket.id] }) // sends the message to all the connected users except the sender
        // {message : message, name : users[socket.id]} - data being sent, it's an object containing the actual message text and the name of the user
    })

    // fires automatically when a user disconnects from the server
    socket.on('disconnect', () => {
        socket.broadcast.emit('user-disconnected', users[socket.id])
        delete users[socket.id]
    })
})