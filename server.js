var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 3000;

var users = {};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/jquery-1.11.1.js', function(req, res){
  res.sendFile(__dirname + '/jquery-1.11.1.js');
});

app.get('/commands', function(req, res){
  res.sendFile(__dirname + '/commands.html');
});

io.on('connection', function(socket){
  socket.on('message_all', function(input) {
    sendMessageToAll(input.message);
  });

  socket.on('new_user_connected', function(input) {
    addUser(input.username, socket);
  });

  socket.on('disconnect', function() {
    disconnected(socket.username);
  });

  socket.on('show_color', function(input) {
    show_color(input);
  });

  socket.on('hide_color', function(input) {
    hide_color(input.username);
  });
});

function sendMessageToAll(message, sender) {
  var input = {
    "message": message,
    "sender": sender
  };
  io.emit('message_all', input);
}

function addUser(username, socket) {
  socket.username = username;
  users[username] = socket;
  sendMessageToAll(username + " has connected.", username);
}

function returnUser(username) {
  return users[username];
}

function removeUser(username) {
  delete users[username];
}

function show_color(input) {
  var user = returnUser(input.username);
  user.emit('show_color', input);
}

function hide_color(username) {
  var user = returnUser(username);
  user.emit('hide_color');
}

function disconnected(username) {
  removeUser(username);
  sendMessageToAll(username + " has disconnected.", username);
}

http.listen(port, function(){
  console.log('listening on http://localhost:' + port);
});

