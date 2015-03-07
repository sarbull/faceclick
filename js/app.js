var socket   = io();
var user = {
  "socket_id": "",
  "username": "",
  "score": 0,
  "game_ready": false,
  "in_game": false,
  "game_is_on": false,
  "game_is_off": true,
  "profile_picture": "",
  "message": ""
};
var scores;
var players_array;
var total_players = 0;
var launchGameInterval;
var wait_dots;
var save_username     = $("#save-username");
var username_data     = $("#username-data");
var login_page        = $("#login");
var dashboard         = $("#dashboard");
var body              = $("body");
var players           = $("#players");
var footer            = $("#footer");
var announcer         = $("#announcer");
var connected_players = $("#connected-players");
var players_ready     = $("#players-ready");
var header            = $("#header");
var high_scores       = $("#high-scores");

save_username.click(function() {
  var username = username_data.val();
  if(validateUsername(username)) {
    user.username = username;
    var usernameHash     = CryptoJS.MD5(user.username);
    var profile_picture  = "https://www.gravatar.com/avatar/" + usernameHash + "?d=monsterid&amp;s=120";
    user.profile_picture = profile_picture;
    dashboard.prepend('<button id="ready">Ready</button>');
    dashboard.prepend('<p><img src="' + user.profile_picture + '"></p>');
    dashboard.prepend("<h1>" + user.username + "</h1>");
    login_page.hide();
    dashboard.show();

    // send socket
    user.socket_id = socket.id;
    socket.emit('update_player', user);
  } else {
    alert("Invalid username");
  }
});

body.delegate('#ready', 'click', function() {
  user.game_ready = true;
  dashboard.hide();
  announcer.hide();
  players.show();
  footer.show();
  waitingDots();

  // send socket
  socket.emit('update_player', user);
});

body.delegate('#go-to-dashboard', 'click', function() {
  user.game_is_on  = false;
  user.game_is_off = true;
  user.in_game     = false;
  user.game_ready  = false;
  user.score       = 0;
  total_players    = 0;
  scores           = [];
  announcer.hide();
  dashboard.show();
});

body.delegate('#go-to-table-scores', 'click', function() {
  var i = 0;
  var html_table_score = "";
  html_table_score += "<h1>Table scores</h1>";
  html_table_score += "<table>";
  var table_score_interval = window.setInterval(function() {
    for (var tmp_p in scores) {
      var p = scores[tmp_p];
      html_table_score += "<tr>";
      html_table_score += "<td>" + p.username + "</td>";
      html_table_score += "<td>" + p.score + "</td>";
      html_table_score += "</tr>";
      i++;
    }
    html_table_score += "</table>";
    html_table_score += '<button id="go-to-dashboard">Dashboard</button>';
    html_table_score += '<button id="go-to-table-scores">Table scores</button>';
    announcer.html(html_table_score);
    if(i == total_players) {
      window.clearInterval(table_score_interval);
    }
  }, 200);
});


// Scoring
body.delegate('#players > .player', 'click', function() {
  var name;
  var background;
  if(user.game_is_on) {
    background_player = $(this).css('background-color');
    background_header = header.css('background-color');
    if(background_player == background_header) {
      user.score = user.score + 1;
      updateScore();
    }
  } else {
    alert('Game has not started yet');
  }
});

function updateScore() {
  footer.html("<h1>Score: " + user.score + "</h1>");
}

function startGame() {
  announcer.html("");
  announcer.show();
  updateScore();
  var i = 4;
  var interval = window.setInterval(function() {
    i--;
    if(i == 0){
      window.clearInterval(interval);
      announcer.hide();
      announcer.html("");
      launchGame();
    } else {
      announcer.html("<h1>Game starts in <br>"+ i + "</h1>");
    }
  }, 1000);
}

function launchGame() {
  user.game_is_on  = true;
  user.game_is_off = false;
  user.in_game     = true;
  var colors = {
    0:'#ff0000',
    1:'#00ff00',
    2:'#0000ff',
    3:'#0000dd',
    4:'#00cc00',
    5:'#00aa00',
    6:'#0000aa',
    7:'#ccdd00',
    8:'#ddcc00'
  };
  launchGameInterval = window.setInterval(function() {
    var index = Math.floor(Math.random() * 8) + 0;
    header.css('background-color', colors[index]);
    $("#players > .player").each(function() {
      index = Math.floor(Math.random() * 8) + 0;
      $(this).css("background-color", colors[index]);
    });
  }, 1000);
}

function waitingDots() {
  wait_dots = window.setInterval( function() {
    if ($("#dots").css('color') == 'rgb(255, 255, 255)') {
        $("#dots").css('color', 'rgb(127, 140, 141)');
    } else { 
      $("#dots").css('color', 'rgb(255, 255, 255)');
    }
  }, 500);
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

function stopGame() {
  user.game_is_on  = false;
  user.game_is_off = true;
  user.game_ready  = false;
  user.in_game     = false;
  window.clearInterval(launchGameInterval);
  window.clearInterval(wait_dots);
  header.css('background-color', '#c0392b');
  players.hide();
  updateHighScores();
  announcer.show();
  $("#players > .player").each(function() {
    $(this).css("background-color", "");
  });
  footer.html('<h1>Waiting for other players<span id="dots">...</span></h1>');
  socket.emit('update_player', user);
}

function updateHighScores() {
  var html = '\
    <h1>Your score ' + user.username + ': ' + user.score + '</h1> \
    <button id="go-to-dashboard">Dashboard</button> \
    <button id="go-to-table-scores">Table scores</button> \
  ';
  announcer.html(html);
}

function stopGameAfterTime() {

}

socket.on('start_game', function(){
  startGame();
  var started = false;
  var play = window.setInterval(function() {
    if(started) {
      socket.emit('exit_all');
      stopGame();
      window.clearInterval(play);
    }
    started = true;
  }, 20000);
});

socket.on('player_is_ready', function(readyPlayers){
  players.html("");
  for (var username in readyPlayers) {
    var player = readyPlayers[username];
    players.append(' \
      <div id="'+ player.username.toLowerCase() +'" class="player"> \
        <div class="content"> \
          <img src="'+ player.profile_picture + '"> \
          <h1>'+ player.username +'</h1> \
        </div> \
      </div> \
    ');
  }
});

socket.on('player_has_leaved', function(player) {
  if(player.username != undefined) {
    var user_div = "#" + player.username.toLowerCase();
    if($(user_div)) {
      $(user_div).remove();
    }
  }
});

socket.on('show_scores', function(players){
  // $('#go-to-table-scores:visible').click();
  scores = players;
  total_players = Object.keys(players).length;
});
