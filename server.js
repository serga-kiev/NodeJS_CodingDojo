var serverMessage = '2+2';
var verificationMessage = 4;

var io = require('socket.io').listen(8080);
io.set('log level', 1);
io.sockets.on('connection', function (socket) {
	var ID = (socket.id).toString().substr(0, 5);
	var time = (new Date).toLocaleTimeString();
	socket.json.send({'event': 'connected', 'name': ID, 'time': time});
	socket.json.send({'event': 'messageFromServer', 'name': ID, 'time': time, 'message': serverMessage});
    socket.on('message', function (msg) {
        var isCorrect;
        if (msg){
            console.log('Message received');
            isCorrect = (verificationMessage == parseInt(msg));
		var time = (new Date).toLocaleTimeString();
		socket.json.send({'event': 'messageSent', 'name': ID, 'text': 'Your answer: ' + msg + '. Correct: ' + isCorrect, 'time': time});
        }
	});
});