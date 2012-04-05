// "Constants"
var FRONT_IP = '10.0.104.233';
var fs = require('fs');
var zip = require('node-native-zip');
var folder = require('./folder.js');

var CLEAN_CLIENT_FOLDER = __dirname + '\\clients\\Coding-dojo-java-client';

exports.generateZipPackage = function (jsonUser, propertiesFilePath) {
    var USER_FOLDER = 'temp/' + jsonUser.gameName + '/' + jsonUser.name;
    generatePropertiesFile(jsonUser, function () {
        zipUpAFolder(CLEAN_CLIENT_FOLDER, USER_FOLDER, function (err, data) {
            if (!err) {
                console.log('Zip package created!');
            }
        });

    });
};

var generatePropertiesFile = function (jsonUser, callback) {
    var USER_FOLDER = 'temp/' + jsonUser.gameName + '/' + jsonUser.name;
    var PROPERTIES_FILENAME = 'dojo-client.properties';
    var propertiesStrings = [
        '#Coding dojo client properties',
        'Game Pass=' + jsonUser.gameName,
        'User Name=' + jsonUser.name,
        'Programming Language=' + jsonUser.language
    ];
    mkdir_p(USER_FOLDER, function (err) {
        if (err) console.log(err);
        fs.writeFile(__dirname + '\\' + USER_FOLDER + '\\' + PROPERTIES_FILENAME, propertiesStrings.join('\n'), function (err) {
            if (err) throw err;
            console.log('Properties file is saved!');
            if (callback && typeof(callback) === 'function') callback();
        });
    });
};


/* Creates folder tree recursively */
function mkdir_p(path, callback, position) {
    var mode = 0777;
    if (!position) position = 0;
    var parts = path.split('/');
    if (position >= parts.length) {
        if (callback) {
            return callback();
        } else {
            return true;
        }
    }
    var directory = parts.slice(0, position + 1).join('/');
    console.log(__dirname + '\\' + directory);
    fs.stat(__dirname + '\\' + directory, function (err) {
        if (err === null) {
            mkdir_p(path, callback, position + 1);
        } else {
            fs.mkdir(__dirname + '\\' + directory, mode, function (err) {
                if (err) {
                    if (callback) {
                        return callback(err);
                    } else {
                        throw err;
                    }
                } else {
                    mkdir_p(path, callback, position + 1);
                }
            })
        }
    })
}

function zipUpAFolder(dir, destinationDir,callback) {
    var archive = new zip();
    var splited = dir.split('\\');
    var originFolderName = splited[splited.length-1];
    console.log('Origin folder: ' + originFolderName);
    // map all files in the approot through this function
    folder.mapAllFiles(dir, function (path, stats, callback) {
        // prepare for the .addFiles function
        callback({
            name:path.replace(dir, "").substr(1),
            path:path
        });
    }, function (err, data) {
        if (err) return callback(err);
        // add the files to the zip
        archive.addFiles(data, function (err) {
            if (err) return callback(err);

            // write the zip file
            fs.writeFile(destinationDir+ '\\' + originFolderName + ".zip", archive.toBuffer(), function (err) {
                if (err) return callback(err);

                callback(null, destinationDir+ '\\' + originFolderName + ".zip");
            });
        });
    });
}


exports.generateClientUrl = function () {   // Make it a part of generateZipPackage function!!!!!
};


/* This block of code is deprecated */
function getRandomNumber(maxvalue) {
    if (arguments.length < 1) {
        maxvalue = 10;
    }
    return Math.floor(Math.random() * (maxvalue + 1));
}

exports.generateQuestionId = function (usrId) {
    var newDate = new Date();
    return newDate.getTime() + usrId.toString();
};

exports.generateQuestionMessage = function () {
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

exports.generateVerification = function (quest) {
    var verification = eval(quest);
    console.log(verification);
    return verification;
};

/**************************************************************/