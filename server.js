var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 3000;

var players = {};


app.get('/game', function(req, res){
  res.sendFile(__dirname + '/player.html');
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/jquery-1.11.1.js', function(req, res){
  res.sendFile(__dirname + '/jquery-1.11.1.js');
});

app.get('/md5.js', function(req, res){
  res.sendFile(__dirname + '/md5.js');
});

app.get('/commands', function(req, res){
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










// function playersSize() {
//   return Object.keys(players).length;
// }

// function inGame() {
//   var in_game = 0;
//   for (var username in players) {
//      var player = players[username];
//      if(player.in_game) {
//       in_game++;
//      }
//   }
//   return in_game;
// }


// function sendNonGameReadyGameUsers() {
//   for (var username in players) {
//     var player = players[username];
//     if(!player.game_ready) {
//       io.sockets.connected[player.socket_id].emit('load_players', players);
//     }
//   }
// }

// function sendInGameUsers() {
//   for (var username in players) {
//     var player = players[username];
//     if(!player.in_game) {
//       io.sockets.connected[player.socket_id].emit('load_in_game_players', players);
//     }
//   }
// }

// function sendMessageToAll(message, sender) {
//   var input = {
//     "message": message,
//     "sender": sender
//   };
//   io.emit('message_all', input);
// }

// function addUser(username, socket) {
//   socket.username = username;
//   users[username] = socket;
//   sendMessageToAll(username + " has connected.", username);
// }

// function returnUser(username) {
//   return users[username];
// }

// function removeUser(username) {
//   delete users[username];
// }

// function show_color(input) {
//   var user = returnUser(input.username);
//   user.emit('show_color', input);
// }

// function hide_color(username) {
//   var user = returnUser(username);
//   user.emit('hide_color');
// }

// function disconnected(username) {
//   removeUser(username);
//   sendMessageToAll(username + " has disconnected.", username);
// }

http.listen(port, function(){
  console.log('listening on http://localhost:' + port);
});

