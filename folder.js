var fs = require("fs");
var path = require("path");

/**
 * Copy the content of a folder and all it's subfolder to a new folder
 */
function copyFolder(src, target, callback) {
    path.exists(target, function (exists) {
        if (!exists) {
            fs.mkdir(target, 04777, function (err) {
                if (err) return callback(err);

                doCopy();
            });
        }
        else {
            doCopy();
        }
    });

    var doCopy = function () {
        fs.readdir(src, function (err, files) {
            if (err) return callback(err);

            files = files && files.filter(function (f) { return !f.match(/^(\.git)/); });

            if (!files || !files.length) {
                callback(null);
                return;
            }

            var fileIx = 0;
            function onFileCopied() {
                fileIx += 1;

                if (fileIx === files.length) {
                    callback(null, src);
                }
            }

            files.forEach(function (file) {
                fs.stat(path.join(src, file), function (err, stats) {
                    if (err) return callback(err);

                    if (stats.isFile()) {
                        copyFile(path.join(src, file), path.join(target, file), onFileCopied);
                    }
                    else if (stats.isDirectory()) {
                        copyFolder(path.join(src, file), path.join(target, file), onFileCopied);
                    }
                });
            });

        });
    };
}

/**
 * Mapping function on all files in a folder and it's subfolders
 * @param dir {string} Source directory
 * @param action {Function} Mapping function in the form of (path, stats, callback), where callback is Function(result)
 * @param callback {Function} Callback fired after all files have been processed with (err, aggregatedResults)
 */
function mapAllFiles(dir,  action, callback) {
    var output = [];

    fs.readdir(dir, function (err, files) {
        if (err) return callback(err);

        files = files && files.filter(function (f) { return !f.match(/^(\.git)/); });

        if (!files || !files.length) {
            return callback(null, output);
        }


        var fileIx = 0;
        var fileErr = null, dirErr = null;

        function onFolderComplete(err, data) {
            if (err) {
                dirErr = err;
            }

            fileIx += 1;

            if (data) {
                data.forEach(function (d) { output.push(d); });
            }

            if (fileIx === files.length) {
                return callback(dirErr, output);
            }
        }

        function onFileComplete(err) {
            if (err) {
                fileErr = err;
            }

            fileIx += 1;

            if (fileIx === files.length) {
                return callback(fileErr, output);
            }
        }

        files.forEach(function (file) {
            fs.stat(path.join(dir, file), function (err, stats) {
                if (err) return onFileComplete(err);

                if (stats.isFile()) {
                    action(path.join(dir, file), stats, function (res) {
                        if (res) {
                            output.push(res);
                        }
                        onFileComplete(null);
                    });
                }
                else if (stats.isDirectory()) {
                    mapAllFiles(path.join(dir, file), action, onFolderComplete, output);
                }
            });
        });

    });
}


/**
 * Copy one file
 */
function copyFile(src, target, callback) {
    // is there a native copyFile available? use that, otherwise do it ourselves
    if (fs.copyFile) {
        fs.copyFile(src, target, callback);
    }
    else {
        var srcFile = fs.createReadStream(src);
        var targetFile = fs.createWriteStream(target);

        targetFile.on("close", function () {
            callback(null, src);
        });

        srcFile.pipe(targetFile);
    }
}

/**
 * Do a recursive remove on a folder and all it's subfolders
 */
function rmrf(dir, callback) {
    fs.stat(dir, function(err, stats) {
        if (err) {
            return callback(err);
        }

        if (!stats.isDirectory()) {
            return fs.unlink(dir, callback);
        }

        var count = 0;
        fs.readdir(dir, function(err, files) {
            if (err) {
                return callback(err);
            }

            if (files.length < 1) {
                return fs.rmdir(dir, callback);
            }

            files.forEach(function(file) {
                var sub = path.join(dir, file);

                rmrf(sub, function(err) {
                    if (err) {
                        return callback(err);
                    }

                    if (++count == files.length) {
                        fs.rmdir(dir, callback);
                    }
                });
            });
        });
    });
}

module.exports = { copy: copyFolder, remove: rmrf, mapAllFiles: mapAllFiles, copyFile: copyFile };