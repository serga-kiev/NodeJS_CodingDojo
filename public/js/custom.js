var socket;

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

window.onload = function () {
    if (navigator.userAgent.toLowerCase().indexOf('chrome') !== -1) {
        socket = io.connect('http://10.0.104.233:8080', {'transports':['xhr-polling']});
    } else {
        socket = io.connect('http://10.0.104.233:8080');
    }
};

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
                socket.emit('connectGame', connectGameForm);
                break;
        }

        socket.on('message', function (msg) {
            if (msg.event) {
                switch (msg.event) {
                    case 'gameCreated':
                        //alert('Game ' + msg.name + ' was successfully created! ');
                        $('#create-status').text('Game "' + msg.name + '" was successfully created!');
                        $('#game-pass').val(msg._id);
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
                        break;
                    case 'userRegisteringFailed':
                        //alert('User ' + msg.name + ' failed to register! Error message: ' + msg.errorMessage);
                        $('#connect-status').text('User "' + msg.name + '" failed to register! Error message: ' + msg.errorMessage);
                        break;
                }
                //socket.disconnect();
            }
        });
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

$('#client-url').click(function() {
    if($(this).val()){
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
