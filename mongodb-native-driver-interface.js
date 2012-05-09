var util = require('util');

/* DataBase variables */
var mongoDb = require('mongodb');
var BSON = mongoDb.BSONPure;
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
        var gameNameLower = gameName.toLowerCase();
        var timeLeft = parseInt(gameDuration)*60; // To get duration in seconds
        var jsonNewGame = {'name':gameName, 'players':{}, 'gameDuration':gameDuration, 'timeLeft':timeLeft};
        client.collection('games', function (err, collection) {
            if (err) throw err;
            //collection.ensureIndex(['name', 1], {unique: true}, function (err, indexName) {
            collection.insert(jsonNewGame, {'safe':true}, function (err, objects) {
                if (callback && typeof(callback) === 'function') {
                    if (err) callback(err);
                    if (err && err.message.indexOf('E11000 ') !== -1) {
                        console.warn('Game with such name already exists!');
                        callback(err);
                    } else {
                        collection.findOne({'name':gameName}, function (err, document) {
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

/* This function interacts with game ID, not gameName! */
exports.registerUserInGame = function (gameId, jsonUser, callback) {
    if (gameId && jsonUser.nickname && jsonUser.language) {
        if (!jsonUser.score) jsonUser.score = 0;
        var userName = jsonUser.nickname.toLowerCase();
        var userAlreadyExists;
        var userId = new BSON.ObjectID();
        console.log('BSON!!!!!!!!!!!!!!!!! ' + userId);
        var jsonUserExistsQueryKey = 'players.' + userId;
        //var jsonUserExistsQuery = {};
        //jsonUserExistsQuery[jsonUserExistsQueryKey] = {$exists:true};
        //var jsonUser = {'nickname':jsonUser.name, 'score':jsonUser.score, 'language':jsonUser.language, 'clientUrl': 'http://10.0.104.233:3000/' + gameId + '/' + userName + '.zip'}; // STUB!!! url should be generated with zip package!
        var jsonUserQuery = {};
        jsonUserQuery[jsonUserExistsQueryKey] = jsonUser;
        try {
            var gameIdObject = new BSON.ObjectID(gameId);
        } catch (Error) {
            callback({err:'There is no registered game with such id!'});
            return;
        }
        client.collection('games', function (err, collection) {
            collection.findOne({_id:gameIdObject}, function (err, document) {
                if (!document) {
                    if (callback && typeof(callback) === 'function') {
                        callback({err:'There is no registered game with such id!'});
                        console.warn('There is no registered game with such id!');
                    }
                } else {
                    console.log(document.players);
                    for (key in document.players) {
                        if (document.players.hasOwnProperty(key)) {
                            if (document.players[key].nickname.toLowerCase() == userName) {
                                console.warn('User with such name is already registered in this game: ' + document.players[key].nickname);
                                userAlreadyExists = true;
                            }
                        }
                    }
                    if (userAlreadyExists) {
                        if (callback && typeof(callback) === 'function') {
                            callback({err:'User with such name is already registered in this game!'});
                        }
                    } else {
                        collection.update({_id:gameIdObject}, {$set:jsonUserQuery}, {safe:true}, function (err, objects) {
                            if (err) console.warn(err.message);
                            if (callback && typeof(callback) === 'function') {
                                callback(null, userId);
                            }
                        });
                    }
                }
            });
        });
    } else {
        if (callback && typeof(callback) === 'function') {
            console.warn("Cannot register user " + userName + " in game. Invalid input data");
            callback({err:"Cannot register user " + userName + " in game. Invalid input data"});
        }
    }

};

exports.getUser = function (gameName, userId) {
    var user;
    var jsonUserExistsQueryKey = 'players.' + userId;
    var jsonUserExistsQuery = {};
    jsonUserExistsQuery[jsonUserExistsQueryKey] = 1;
    client.collection('games', function (err, collection) {
        collection.findOne({name:gameName}, function (err, cursor) {
            if (!cursor) {
                console.warn('there is no registered game with such id!');
            } else {
                collection.findOne({name:gameName}, jsonUserExistsQuery, function (err, cursor) {
                    if (!cursor) {
                        console.warn('Such user is not registered in this game!');
                    } else {
                        user = cursor.players;
                        console.log(user);
                    }
                });
                return user;
            }
        });
    })
};

exports.getAllUsers = function (gameId, callback) {
    var users;
    var gameName;
    //var usersCount;
    //client.open(function (err, client) {
    //    if (err) throw err;
    try {
        var gameIdObject = new BSON.ObjectID(gameId);
    } catch (Error) {
        //callback({err:'There is no registered game with such id!'});
        return;
    }
    client.collection('games', function (err, collection) {
        collection.findOne({_id:gameIdObject}, function (err, cursor) {
            if (!cursor) {
                console.warn('there is no registered game with such id!');
            } else {
                users = cursor.players;
                gameName = cursor.name;
                console.log('Registered users in game: ');
                console.dir(users);
                if (callback && typeof(callback) === 'function') {
                    callback(null, gameName, users);
                }
            }
        });
    });
    //});
    return users;
};

exports.updateUserScore = function (gameName, userId, updateBy) {
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
        collection.findOne({name:gameName}, function (err, cursor) {
                if (!cursor) {
                    console.warn('There is no registered game with specified id!');
                } else {
                    collection.findOne(jsonUserExistsQuery, function (err, cursor) {
                        if (!cursor) {
                            console.warn('Such user is not registered in this game!');
                        } else {
                            collection.update({name:gameName}, {$inc:jsonUserUpdate/*{ 'players.userId.score':5 }*/}, {safe:true}, function (err, objects) {
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

/*************DEPRICATED************/

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
 //registerUser(3, 1, 'vanya', 10);


 // This function interacts with game ID, not gameName! This function considers that users identified with their names, and don't have unique ObjectID
 exports.registerUserInGame = function (gameId, jsonUser, callback) {
 if (gameId && jsonUser.name && jsonUser.language) {
 if (!jsonUser.score) jsonUser.score = 0;
 var userName = jsonUser.name.toLowerCase();
 var jsonUserExistsQueryKey = 'players.' + userName;
 //var jsonUserExistsQuery = {};
 //jsonUserExistsQuery[jsonUserExistsQueryKey] = {$exists:true};
 //var jsonUser = {'nickname':jsonUser.name, 'score':jsonUser.score, 'language':jsonUser.language, 'clientUrl': 'http://10.0.104.233:3000/' + gameId + '/' + userName + '.zip'}; // STUB!!! url should be generated with zip package!
 var jsonUserQuery = {};
 jsonUserQuery[jsonUserExistsQueryKey] = jsonUser;
 try {
 var gameIdObject = new BSON.ObjectID(gameId);
 } catch (Error) {
 callback({err:'There is no registered game with such id!'});
 return;
 }
 client.collection('games', function (err, collection) {
 collection.findOne({_id:gameIdObject}, function (err, document) {
 if (!document) {
 if (callback && typeof(callback) === 'function') {
 callback({err:'There is no registered game with such id!'});
 console.warn('There is no registered game with such id!');
 }
 } else {
 console.log(document.players[userName]);
 if ( document.players[userName]) {
 if (callback && typeof(callback) === 'function') {
 callback({err:'User with such name is already registered in this game!'});
 }
 } else {
 collection.update({_id:gameIdObject}, {$set:jsonUserQuery}, {safe:true}, function (err, objects) {
 if (err) console.warn(err.message);
 if (callback && typeof(callback) === 'function') {
 callback(null, jsonUser.clientUrl);
 }
 });
 }
 }
 });
 });
 } else {
 if (callback && typeof(callback) === 'function') {
 console.warn("Cannot register user " + userName + " in game. Invalid input data");
 callback({err:"Cannot register user " + userName + " in game. Invalid input data"});
 }
 }

 };

 */