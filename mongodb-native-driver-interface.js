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


exports.createGame = function (gameName, gameDuration, callback) {
    if (arguments.length >= 2 && gameName != '') {
        var jsonNewGame = {name:gameName, players:{}, startTime:{}, gameDuration:gameDuration, timeLeft:{}};
        client.collection('games', function (err, collection) {
            if (err) throw err;
            //collection.ensureIndex(['name', 1], {unique: true}, function (err, indexName) {
            collection.insert(jsonNewGame, {safe:true}, function (err, objects) {
                if (callback && typeof(callback) === 'function') {
                    if (err) callback(err);
                    if (err && err.message.indexOf('E11000 ') !== -1) {
                        console.warn('Game with such name already exists!');
                        callback(err);
                    } else {
                        collection.findOne({name:gameName}, function (err, document) {
                            console.log('Game id: ' + document._id);
                            callback(null, document._id);
                        });
                    }
                }
            });
            //});
        });
    } else {
        console.warn("Illegal number of parameters: " + arguments.length);
        callback({err:'Illegal parameters'});
    }
};

exports.registerUserInGame = function (gameId, userId, userName, userLanguage, initialScore, callback) {
    if (!initialScore) initialScore = 0;
    var jsonUserExistsQueryKey = 'players.' + userId;
    var jsonUserExistsQuery = {};
    jsonUserExistsQuery[jsonUserExistsQueryKey] = {$exists:true};
    var jsonNewUser = {'name':userName, 'score':initialScore, language:userLanguage};
    var jsonUserQuery = {};
    jsonUserQuery[jsonUserExistsQueryKey] = jsonNewUser;
    client.collection('games', function (err, collection) {
        collection.findOne({_id:gameId}, function (err, cursor) {
            if (!cursor) {
                console.warn('There is no registered game with such id!');
            } else {
                collection.findOne(jsonUserExistsQuery/* {players.userId: {$exists:true}} */, function (err, cursor) {
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

exports.getUser = function (gameId, userId) {
    var user;
    var jsonUserExistsQueryKey = 'players.' + userId;
    var jsonUserExistsQuery = {};
    jsonUserExistsQuery[jsonUserExistsQueryKey] = 1;
    client.collection('games', function (err, collection) {
        collection.findOne({_id:gameId}, function (err, cursor) {
            if (!cursor) {
                console.warn('There are no registered game with such id!');
            } else {
                collection.findOne({_id:gameId}, jsonUserExistsQuery, function (err, cursor) {
                    if (!cursor) {
                        console.warn('Such user is not registered in this game!');
                    } else {
                        user = cursor;
                        console.log(user);
                    }
                });
                return user;
            }
        });
    })
};

exports.getAllUsers = function (gameId) {
    var users;
    //var usersCount;
    //client.open(function (err, client) {
    //    if (err) throw err;
    client.collection('games', function (err, collection) {
        collection.findOne({_id:gameId}, function (err, cursor) {
            if (!cursor) {
                console.warn('There are no registered game with such id!');
            } else {
                users = cursor.players;
                console.dir('Registered users in game: ' + users);
            }
        });
    });
    //});
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
    //client.open(function (err, client) {
    //    if (err) throw err;
    client.collection('games', function (err, collection) {
        collection.findOne({_id:gameId}, function (err, cursor) {
                if (!cursor) {
                    console.warn('There is no registered game with specified id!');
                } else {
                    collection.findOne(jsonUserExistsQuery, function (err, cursor) {
                        if (!cursor) {
                            console.warn('Such user is not registered in this game!');
                        } else {
                            collection.update({_id:gameId}, {$inc:jsonUserUpdate/*{ 'players.userId.score':5 }*/}, {safe:true}, function (err, objects) {
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
    //})
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