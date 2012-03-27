var util = require('util');
var cronJob = require('cron').CronJob;
var dbInterface = require('./mongodb-native-driver-interface.js');
var customUtils = require('./utils.js');

//var fs = require('fs');
var usersScores = new Object();
var usersQuestions = new Object();

//fs.mkdir('d:/df');


/* Express server instance
var expressServer = require('express').createServer();
expressServer.get('/', function (req, res) {
    res.send('Hello, world!');
});
expressServer.get('/:id', function (req, res) {
    res.send('Hello, ' + req.params.id);
});
expressServer.listen('3000');
 */

/* Connect server instance */
var connect = require('connect');
var oneDay = 86400000; //Cache life duration

connect(
    connect.static(__dirname + '/public', { maxAge: oneDay })
).listen(3000);


/* DB interaction example */
dbInterface.open(
    dbInterface.createGame("22332233", 'TitanWar1') // ID of the game simultaneously is the "unique pass, for users to register in game"
    );

dbInterface.registerUserInGame("22332233", 2, 'vanya12', 'JavaScript', 10);
dbInterface.getAllUsers("22332233");
dbInterface.updateUserScore("22332233", 2, 5);


/* SocketIO server instance */
var io = require('socket.io').listen(8080);
io.set('log level', 1);

io.sockets.on('connection', function (socket) {
    util.log('Attempt to connect was emitted');
    var ID = (socket.id).toString().substr(0, 5);
    var userId;
    var time = (new Date).toLocaleTimeString();
    var questionIntervalPattern = '*/5 * * * * *';

    socket.on('userGreet', function (usrId) {
        if (usersScores[usrId] != undefined) {
            util.log('Greetings, ' + usrId);
            userId = usrId;
            socket.json.send({'event':'connected', 'name':userId, 'time':time});
            cronJob(questionIntervalPattern, function () {
                    var questionId = customUtils.generateQuestionId(userId);
                    var questionMessage = customUtils.generateQuestionMessage();
                    socket.json.send({'event':'questionFromServer', 'name':userId, 'time':time, 'questionId':questionId, 'message':questionMessage});
                    if (usersQuestions[userId] == undefined) {
                        usersQuestions[userId] = new Array();
                    }
                    usersQuestions[userId][questionId] = new Array();
                    usersQuestions[userId][questionId].push(questionMessage);
                    usersQuestions[userId][questionId].push(customUtils.generateVerification(questionMessage));
                }
            );
        } else {
            util.log('There is no registered users with ID ' + usrId);
        }
    });

    socket.on('message', function (msg) {
        var isCorrect;
        if (msg) {
            try {
                isCorrect = (msg.message == (usersQuestions[msg.name][msg.questionId][1]));
                util.log('Message received ' + msg.message + '. Correct: ' + isCorrect);
                var time = (new Date).toLocaleTimeString();
                //socket.json.send({'event':'messageSent', 'name':userId, 'text':'Your answer: ' + msg.message + '. Correct: ' + isCorrect, 'time':time});
            } catch (Exception) {
                util.log('Invalid message was received');
            }
        }
    });

    socket.on('disconnect', function () {
        console.log('User ' + userId + ' has disconnected!');
        //console.log('Listener ' + socket.listeners('userGreet'));
        //socket.removeAllListeners('userGreet');
    });

    socket.on('error', function (msg) {
        util.log('Error event occurred ' + msg);
    });
});
