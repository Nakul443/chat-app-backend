// will contain all the client side job

const socket = io('http://localhost:3000'); // location where we're hosting our socket

// 'data' and the stuff inside it gets executed when the 'chat-message' event occurs
// 'data' is a callback function
socket.on('chat-message', data => {
    appendMessage('${data.name}: ${data.message}')
    console.log(data); // logs the 'data' object received to the browser's developer console
})


// code so that users can communicate back and forth with each other
// GOAL - when a user sends a message, first it is sent to the server

const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

messageForm.addEventListener('submit', e => {

    e.preventDefault()
    const message = messageInput.value
    appendMessage('${data.name}: ${data.message}')

    socket.emit('send-chat-message', message)
    // client sends the message to the server
    // it emits an event named 'send-chat-message', sending 'message' as the data
    // this event is caught by the server's socket.on('send-chat-message') listener

    messageInput.value = ''
    // clear input text field when the message has been sent
})




// we want to append the message

const messageContainer = document.getElementById('message-container')

// function that takes message string as an argument
// FRONT-END related
function appendMessage(message) {
    const messageElement = document.createElement('div') // creates a new div HTML element
    messageElement.innerText = message
    messageContainer.append(messageElement)
}

// the client-side listener (socket.on) waits for the 'user-connected' event from the server
// 'name' contains the parameter of the user that just connected
socket.on('user-connected', name => {
    appendMessage("${name} connected") // displays the message that a user has been connected
})


// the client-side listener waits for the 'user-disconnected' event from the server
socket.on('user-disconnected', name => {
    appendMessage('${name} disconnected')
})