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

  socket.on('show_color', function(object){
    if(object.username != "") {
      var s = users[object.username];
      if(s) {
        s.emit('show_color', object.color);
      }
    } else {
      io.emit('show_color', object.color);
    }
  });

  socket.on('hide_color', function(object){
    if(object.username != "") {
      var s = users[object.username];
      if(s) {
        s.emit('hide_color', object.color);
      }
    } else {
      io.emit('hide_color', object.color);
    }
  });

  socket.on('new_user', function(username){
    socket.username = username;
    users[username] = socket;
    io.emit('new_user', username + ' has entered!');
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});
