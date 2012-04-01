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

$('#create-game').click(function () {
    var socket;
    var serializedForm = $(this).closest('#create-game-form').serializeArray();
    if (navigator.userAgent.toLowerCase().indexOf('chrome') != -1) {
        socket = io.connect('http://10.0.104.233:8080', {'transports':['xhr-polling']});
    } else {
        socket = io.connect('http://10.0.104.233:8080');
    }

    console.log(socket);
    socket.on('connect', function () {
        socket.emit('createGame', serializedForm);
        socket.on('message', function (msg) {
            if (msg.event){
                switch (msg.event) {
                    case 'gameCreated':
                        alert('Game ' + msg.name + ' was successfully created! ');
                        $('#game-pass').val(msg._id);
                        break;
                    case 'gameCreationFailed':
                        alert('Game ' + msg.name + ' was not created! Error message: ' + msg.errorMessage);
                }
                socket.disconnect();
            }
        });
    });
    /*onConnectFunc();
     function onConnectFunc() {
     if (socket) {
     }
     else {
     setTimeout(onConnectFunc(), 50);
     }
     }*/
    $(this).attr("disabled", "disabled");
});

$('#connect-game').click(function() {

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
