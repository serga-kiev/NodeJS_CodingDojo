var socket;
var SERVER_CONNECTION_STRING = 'http://10.0.104.233:8080';

(function () {
    $("#timerButton").click(function () {
        if ($(this).hasClass("btn-primary")) {
            $(this).removeClass("btn-primary");
            $(this).text("Pause game");
        } else {
            $(this).addClass("btn-primary");
            $(this).text("Start game");
        }
    });
})();

function populatePlayersTable(JSONPlayers) {
    var playersTbody = document.getElementById('players-table');
    var tableRow = document.createElement('tr');
    var tableCellPlayerName = document.createElement('td');
    var tableCellPlayerScore = document.createElement('td');
    var tableCellPlayerLanguage = document.createElement('td');

    $.each(JSONPlayers, function (i, val) {
        tableRow = document.createElement('tr');
        tableCellPlayerName.textContent = val.nickname;
        tableCellPlayerScore.textContent = val.score;
        tableCellPlayerLanguage.textContent = val.language;

        tableRow.appendChild(tableCellPlayerName);
        tableRow.appendChild(tableCellPlayerScore);
        tableRow.appendChild(tableCellPlayerLanguage);
        playersTbody.appendChild(tableRow);
        /*tableRow = document.createElement('tr');
         tableCellPlayerName.appendChild(document.createTextNode(val.nickname));
         tableCellPlayerScore.appendChild (document.createTextNode(val.score));
         tableCellPlayerLanguage.appendChild (document.createTextNode(val.language));
         tableRow.appendChild(tableCellPlayerName);
         tableRow.appendChild(tableCellPlayerScore);
         tableRow.appendChild(tableCellPlayerLanguage);
         playersTbody.appendChild(tableRow);
         */
    });

    //$('#players-table').text(msg.users);
    return;
}


window.onload = function () {
    if (navigator.userAgent.toLowerCase().indexOf('chrome') !== -1) {
        socket = io.connect(SERVER_CONNECTION_STRING, {'transports':['xhr-polling']});
    } else {
        socket = io.connect(SERVER_CONNECTION_STRING);
    }
    socket.on('message', function (msg) {
        if (msg.event) {
            console.log('Message from server received!');
            switch (msg.event) {
                case 'gameCreated':
                    //alert('Game ' + msg.name + ' was successfully created! ');
                    $('#create-status').text('Game "' + msg.name + '" was successfully created!');
                    $('#game-pass').val(msg._id);
                    $('#link-to-admin').val(msg.adminUrl);
                    $('#create-game').attr("disabled", "disabled");
                    break;
                case 'gameCreationFailed':
                    //alert('Game ' + msg.name + ' was not created! Error message: ' + msg.errorMessage);
                    $('#create-status').text('Game "' + msg.name + '" was not created! Error message: ' + msg.errorMessage);
                    break;
                case 'userRegistered':
                    //alert('User ' + msg.name + ' was successfully registered! ');
                    $('#connect-status').text('User "' + msg.name + '" was successfully registered! ');
                    $('#client-url').val(msg.clientUrl);
                    $('#client-url').addClass('client-url-ready');
                    break;
                case 'userRegisteringFailed':
                    //alert('User ' + msg.name + ' failed to register! Error message: ' + msg.errorMessage);
                    $('#connect-status').text('User "' + msg.name + '" failed to register! Error message: ' + msg.errorMessage);
                    break;
                case 'playersList':
                    //console.dir(msg.users);
                    //console.log(msg.gameName);
                    $('#game-name-title').text(msg.gameName);
                    populatePlayersTable(msg.users);
                    break;
            }
        }
    });
    //socket.disconnect();
    getPlayersList();
};

function getPlayersList() {
    if (socket) {
        function getCurrentGameId() {
            var QueryString = function () {
                var query_string = {};
                var query = window.location.search.substring(1);
                var vars = query.split('&');
                for (var i = 0; i < vars.length; i++) {
                    var pair = vars[i].split('=');
                    // If first entry with this name
                    if (typeof query_string[pair[0]] === 'undefined') {
                        query_string[pair[0]] = pair[1];
                        // If second entry with this name
                    } else if (typeof query_string[pair[0]] === 'string') {
                        query_string[pair[0]] = [query_string[pair[0]], pair[1]];
                        // If third or later entry with this name
                    } else {
                        query_string[pair[0]].push(pair[1]);
                    }
                }
                return query_string;
            }();
            return QueryString['gameId'];
        }

        socket.emit('getPlayersList', getCurrentGameId());
    } else {
        setTimeout(getPlayersList(), 50);
    }
}

$('#create-game, #connect-game').click(function () {
    var buttonId = $(this).attr('id');
    var createGameForm = $(this).closest('#create-game-form').serializeArray();
    var connectGameForm = $(this).closest('#connect-game-form').serializeArray();

    // socket.on('connect', function () {
    switch (buttonId) {
        case 'create-game':
            socket.emit('createGame', createGameForm);
            break;
        case 'connect-game':
            socket.emit('joinGame', connectGameForm);
            break;
    }

    /*onConnectFunc();
     function onConnectFunc() {
     if (socket) {
     }
     else {
     setTimeout(onConnectFunc(), 50);
     }
     }*/
    //$(this).attr("disabled", "disabled");
});

$('#client-url').on('mouseup', function () {
    if ($(this).val()) {
        window.open($(this).val());
        return false;
    }
});

/*
 window.onload = function () {
 var socket;
 var somedata = $('#create-game').serialize();
 alert($('#create-game'));
 if (navigator.userAgent.toLowerCase().indexOf('chrome') != -1) {
 socket = io.connect('http://localhost:8080', {'transports':['xhr-polling']});
 } else {
 socket = io.connect('http://localhost:8080');
 }
 socket.on('connect', function () {
 socket.emit('createGame', somedata, function () {
 console.log('userId was sent to server')
 });
 });
 };


 $('#create-game').submit(function() {
 alert($(this).serialize());
 return false;
 });*/
