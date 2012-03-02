var util = require('util');
var cronJob = require('cron').CronJob;
var usersScores = new Object();
var usersQuestions = new Object();
usersScores['222'] = 0;

function getRandomNumber(maxvalue) {
    if (arguments.length < 1) {
        maxvalue = 10;
    }
    return Math.floor(Math.random() * (maxvalue + 1));
}

var generateQuestionId = function (usrId) {
    var newDate = new Date();
    return newDate.getTime() + usrId.toString();
};

var generateQuestionMessage = function () {
    var trigger = getRandomNumber(1);
    switch (trigger) {
        case 0:
            return getRandomNumber() + ' + ' + getRandomNumber();
            break;
        case 1:
            return getRandomNumber().toString() + ' * ' + getRandomNumber().toString();
            break;
        default:
            return '2+2';
            break;
    }
};

var generateVerification = function (quest) {
    var verification = eval(quest);
    console.log(verification);
    return verification;
};


var io = require('socket.io').listen(8080);
io.set('log level', 1);

io.sockets.on('connection', function (socket) {
    var ID = (socket.id).toString().substr(0, 5);
    var userId;
    var time = (new Date).toLocaleTimeString();
    var questionInterval = 5000;

    socket.on('userGreet', function (usrId) {
        if (usersScores[usrId] != undefined) {
            util.log('greetings, ' + usrId);
            userId = usrId;
            socket.json.send({'event':'connected', 'name':userId, 'time':time});

            cronJob('* * * * * *', function () {
                    var questionId = generateQuestionId(userId);
                    var questionMessage = generateQuestionMessage();
                    socket.json.send({'event':'questionFromServer', 'name':userId, 'time':time, 'questionId':questionId, 'message':questionMessage});
                    if (usersQuestions[userId] == undefined) {
                        usersQuestions[userId] = new Array();
                    }
                    usersQuestions[userId][questionId] = new Array();

                    usersQuestions[userId][questionId].push(questionMessage);
                    usersQuestions[userId][questionId].push(generateVerification(questionMessage));
                }
            );
        } else {
            util.log('There is no registered users with ID ' + userId);
        }
    });

    socket.on('message', function (msg) {
        var isCorrect;
        if (msg) {
            util.log('Message received ' + usersQuestions[msg.name][msg.questionId][1]);
            isCorrect = (msg.message == usersQuestions[msg.name][msg.questionId][1]);
            var time = (new Date).toLocaleTimeString();
            socket.json.send({'event':'messageSent', 'name':userId, 'text':'Your answer: ' + msg.message + '. Correct: ' + isCorrect, 'time':time});
        }
    });
});

