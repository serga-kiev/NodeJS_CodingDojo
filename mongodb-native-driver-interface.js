var util = require('util');

/* DataBase variables */
var mongoDb = require('mongodb');
var dataBase = mongoDb.Db;
var dbServer = mongoDb.Server;
var dataBaseName = 'coding-dojo-db';
var dataBaseHost = 'localhost';
var dataBasePort = 27017;

var client = new dataBase(dataBaseName, new dbServer(dataBaseHost, dataBasePort, {auto_reconnect:true}), {});
util.log('Connecting to database: ' + dataBaseHost + ':' + dataBasePort);

exports.open = function (callback) {
    client.open(function (err, client) {
        if (err) throw err;
    });
};

exports.close = client.close(function (err, client) {
    if (err) throw err;
});

exports.createGame = function (gameId, gameName) {
    var jsonNewGame = {_id:gameId, gameName: gameName, players: {}, startTime: {}, gameDuration:{}, timeLeft:{}};
    client.open(function (err, client) {
        if (err) throw err;
        client.collection('games', function (err, collection) {
            if (err) throw err;
            collection.insert(jsonNewGame, {safe:true}, function (err, objects) {
                if (err) console.warn(err.message);
                if (err && err.message.indexOf('E11000 ') !== -1) {
                    console.warn('Game with such id already exists!');
                }
            });
        });
    });
};

exports.registerUserInGame = function (gameId, userId, userName, userLanguage, initialScore) {
    if (!initialScore) initialScore = 0;
    var jsonUserExistsQueryKey = 'players.' + userId;
    var jsonUserExistsQuery = {};
    jsonUserExistsQuery[jsonUserExistsQueryKey] = {$exists:true};
    var jsonNewUser = {'name':userName, 'score': initialScore, language: userLanguage};
    var jsonUserQuery = {};
    jsonUserQuery[jsonUserExistsQueryKey] = jsonNewUser;
    client.open(function (err, client) {
        if (err) throw err;
        client.collection('games', function (err, collection) {
            if (!collection) {
                console.warn('There is no registered game with specified id!');
            } else {
                collection.findOne(jsonUserExistsQuery, function (err, cursor) {
                    if (cursor) {
                        console.warn('User is already registered in this game!');
                    } else {
                        collection.update({_id:gameId}, {$set:jsonUserQuery}, {safe:true}, function (err, objects) {
                            if (err) console.warn(err.message);
                        });
                    }
                });
            }
        });
    });
};

exports.getAllUsers = function (gameId) {
    var users;
    var usersCount;
    client.open(function (err, client) {
        if (err) throw err;
        client.collection('games', function (err, collection) {
            collection.findOne({_id:gameId}, function (err, cursor) {
                if (!cursor) {
                    console.warn('There are no registered game with such id!');
                } else {
                    users = cursor.players;
                    console.dir(users);
                }
            });
        });
    });
    return users;
};

exports.updateUserScore = function (gameId, userId, updateBy) {
    var jsonUserExistsQueryKey = 'players.' + userId;
    var jsonUserExistsQuery = {};
    jsonUserExistsQuery[jsonUserExistsQueryKey] = {$exists:true};
    var jsonUserQueryKey = jsonUserExistsQueryKey + '.score';
    var jsonUserUpdate = {};
    jsonUserUpdate[jsonUserQueryKey] = updateBy;
    //console.log(jsonUserUpdate);
    client.open(function (err, client) {
        if (err) throw err;
        client.collection('games', function (err, collection) {
            collection.findOne({_id:gameId}, function (err, cursor) {
                    if (!cursor) {
                        console.warn('There is no registered game with specified id!');
                    } else {
                        collection.findOne(jsonUserExistsQuery, function (err, cursor) {
                            if (!cursor) {
                                console.warn('Such user is not registered in this game!');
                            } else {
                                collection.update({_id:gameId}, {$inc:{ 'players.2.score': 5 }}, {safe:true}, function (err, objects) {
                                    if (err) console.warn(err.message);
                                    if (err && err.message.indexOf('E11000 ') !== -1) {
                                    }
                                });
                            }
                        });
                    }
                }
            );
        });
    })
};

/* This function registers user in separate from game instance collection. Its deprecated
 function registerUser(gameId, userId, userName, initialScore) {
 if (!initialScore) initialScore = 0;
 client.open(function (err, client) {
 if (err) throw err;
 client.collection('users', function (err, collection) {
 var user = {_id: userId, name: userName, score: initialScore};
 var update = {'$push':{players: user}};
 collection.update({_id:gameId}, update);
 collection.insert({_id:userId, name:userName, score:initialScore}, {safe:true},
 function (err, objects) {
 if (err) console.warn(err.message);
 if (err && err.message.indexOf('E11000 ') !== -1) {
 console.warn('User with specified id is already registered in this game!');
 }
 });
 //client.close();
 });
 });
 }
 //registerUser(3, 1, 'vanya', 10);*/