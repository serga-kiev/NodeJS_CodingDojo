var util = require('util');
var cronJob = require('cron').CronJob;
var dbInterface = require('./mongodb-native-driver-interface.js');
var customUtils = require('./utils.js');

// "Constants"
var _FRONT_PORT = '3000';

/* Deprecated */
var usersScores = new Object();
var usersQuestions = new Object();
/*******************/
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
).listen(_FRONT_PORT);


/* DB interaction example */
dbInterface.open(
    dbInterface.createGame("22332233", "1:30") // ID of the game simultaneously is the "unique pass, for users to register in game"
    );

dbInterface.registerUserInGame("4f78bf358f7148f819000002", {name: 'vanya12', language: 'JavaScript', score: 10});
dbInterface.getAllUsers("22332233");
dbInterface.getUser("Titan", "4f7dcaeafa6ec5f01c000002");
dbInterface.updateUserScore("Titan", "4f7dcaeafa6ec5f01c000002", 5);


/* SocketIO server instance */
var _SERVER_IP = '10.0.104.233'; // IP of the server, where nodejs is being run. Hardcoded at the moment
var serverPort = 8080;
var io = require('socket.io').listen(serverPort);
io.set('log level', 1);

io.sockets.on('connection', function (socket) {
    util.log('Attempt to connect was emitted');
    var userId;
    var time = (new Date).toLocaleTimeString();
    var questionIntervalPattern = '*/5 * * * * *';


    socket.on('createGame', function (serializedForm) {
        //var formData = querystring.parse(serializedForm);
        var gameName = serializedForm[0].value;
        var gameDuration = serializedForm[1].value;

        console.log("Create game event was emitted");
        console.log("Game name: " + gameName);
        console.log("Game duration: " + gameDuration);

        dbInterface.createGame(gameName, gameDuration, function(err, gameId) {
            if (err) {
                socket.json.send({'event':'gameCreationFailed', 'name':gameName, 'errorMessage': err.err});
                console.warn(err.err);
            } else {
                socket.json.send({'event':'gameCreated', 'name':gameName, '_id': gameId, 'adminUrl': 'http://' + _SERVER_IP + ':' + _FRONT_PORT + '/admin-page.html?gameId=' + gameId});
            }
        });
    });

    socket.on('joinGame', function (serializedForm) {
        var gamePass = serializedForm[0].value;
        var userName = serializedForm[1].value;
        var userLanguage = serializedForm[2].value;
        var jsonUser = {'nickname': userName,
                        'language': userLanguage,
                        'score':0};

        console.log("Connect game event was emitted");
        console.log("Game pass: " + gamePass);
        console.log("User language: " + userLanguage);

        dbInterface.registerUserInGame(gamePass, jsonUser, function(err, userId) {
            if (err) {
                socket.json.send({'event':'userRegisteringFailed', 'name':userName, 'errorMessage': err.err});
                console.warn(err.err);
            } else {
                socket.json.send({'event':'userRegistered', 'name':userName, 'clientUrl': 'http://' + _SERVER_IP + ':' + _FRONT_PORT + '/temp/' + userId + '/coding-dojo-client.zip'});
                customUtils.generateZipPackage({'gameName': gamePass, 'name':userName, 'language': userLanguage, 'userId':userId,
                    'serverIp': _SERVER_IP, 'serverPort': serverPort});
            }
        });
    });

    socket.on('getPlayersList', function (gameId) {
        dbInterface.getAllUsers(gameId, function(err, gameName, users){
            socket.json.send({'event': 'playersList', 'gameName': gameName, 'users': users});
        });
    });


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