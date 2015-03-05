var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = {};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/commands', function(req, res){
  res.sendFile(__dirname + '/commands.html');
});

io.on('connection', function(socket){

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });

  socket.on('disconnect', function(){
    io.emit('disconnected', "a user has disconnected");
  });

  socket.on('show_red', function(username){
    if(username != "") {
      var s = users[username];
      s.emit('show_red');
    } else {
      io.emit('show_red');
    }
  });

  socket.on('hide_red', function(username){
    if(username != "") {
      var s = users[username];
      s.emit('hide_red');
    } else {
      io.emit('hide_red');
    }
  });

  socket.on('new_user', function(username){
    socket.username = username;
    users[username] = socket;
    io.emit('new_user', username + ' has entered!');
    console.log(users);
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});
