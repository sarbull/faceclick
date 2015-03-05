var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/commands', function(req, res){
  res.sendFile(__dirname + '/commands.html');
});

io.on('connection', function(socket){
  socket.broadcast.emit('new_user', 'a new user has entered!');

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });

  socket.on('disconnect', function(){
    io.emit('disconnected', "a user has disconnected");
  });

  socket.on('show_red', function(){
    console.log('show_red');
    io.emit('show_red');
  });

  socket.on('hide_red', function(){
    console.log('hide_red');
    io.emit('hide_red');
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});
