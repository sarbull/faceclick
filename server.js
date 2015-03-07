var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 3000;

var players = {};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/player.html');
});

app.get('/css/stylesheet.css', function(req, res){
  res.sendFile(__dirname + '/css/stylesheet.css');
});

app.get('/js/app.js', function(req, res){
  res.sendFile(__dirname + '/js/app.js');
});

app.get('/js/jquery-1.11.1.js', function(req, res){
  res.sendFile(__dirname + '/js/jquery-1.11.1.js');
});

app.get('/js/md5.js', function(req, res){
  res.sendFile(__dirname + '/js/md5.js');
});

app.get('/commands.html', function(req, res){
  res.sendFile(__dirname + '/commands.html');
});

io.on('connection', function(socket){
  socket.on('exit_all', function() {
    for (var username in players) {
      var player = players[username];
      player.game_ready = false;
    }
  });

  socket.on('update_player', function(input) {
    if(validateUsername(input.username)) {
      if(players[input.username] == undefined) {
        io.emit('new_player_entered', input);
      }

      players[input.username] = {
        "socket_id": input.socket_id,
        "username": input.username,
        "score": input.score,
        "game_ready": input.game_ready,
        "in_game": input.in_game,
        "game_is_on": input.game_is_on,
        "profile_picture": input.profile_picture
      };

      if(input.game_is_off) {
        io.emit('show_scores', players);
      }

      if(input.game_ready) {
        newPlayerIsReady(input);
      }

      if(gameReadyCount() == 3) {
        var only_ready_players = onlyReadyPlayers();
        for (var username in only_ready_players) {
          var player = players[username];
          if(player.game_ready) {
            io.sockets.connected[player.socket_id].emit('start_game');
          }
        }
      }
    }
  });

  socket.on('disconnect', function() {
    for (var username in players) {
      var player = players[username];
      if(player.socket_id == socket.conn.id) {
        io.emit('player_has_leaved', player);
        delete players[username];
      }
    }
  });
});


function newPlayerIsReady(input) {
  for (var username in players) {
    var player = players[username];
    if(player.game_ready) {
      io.sockets.connected[player.socket_id].emit('player_is_ready', onlyReadyPlayers());
    }
  }
}

function onlyReadyPlayers() {
  var tmp_players = {};
  for (var username in players) {
    var player = players[username];
    if(player.game_ready) {
      tmp_players[player.username] = player;
    }
  }
  return tmp_players;
}

function gameReadyCount() {
  var game_ready = 0;
  for (var username in players) {
     var player = players[username];
     if(player.game_ready) {
      game_ready++;
     }
  }
  return game_ready;
}

function validateUsername(username){
  if(username != null) {
    var usernameRegex = /^[a-zA-Z0-9]+$/;
    var validfirstUsername = username.match(usernameRegex);
    if(validfirstUsername != null) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

// function playersSize() {
//   return Object.keys(players).length;
// }

http.listen(port, function(){
  console.log('listening on http://localhost:' + port);
});

