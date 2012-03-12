var util = require('util');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dburl = 'mongodb://localhost:27017';
exports.connect = function (callback) {
    mongoose.connect(dburl);
};
exports.disconnect = function (callback) {
    mongoose.disconnect(callback);
};

