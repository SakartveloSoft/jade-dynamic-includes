/**
 * Created by konstardiy on 2014-04-30.
 */
"use strict";
var Q = require('Q');
var fs = require('fs');
var path = require('path');
var jade = require('jade');
if (!String.prototype['replaceAll']) {
    String.prototype.replaceAll = function(a, b) {
        var str = this;
        while(str.indexOf(a) >= 0) {
            str = str.replace(a, b);
        }
        return str;
    };
}

/**
 *
 * @param dirPath {String} the path to folder to start from
 * @param fileCallback {function(name, data, stat)} callback to process a file
 */
function scanFolder(dirPath, fileCallback) {
    var promises = [];
    process.nextTick(function() {
        fs.readdir(dirPath, function(err, names) {
            if (err) {
                throw new Error(err);
            }
            if (!names)
            {
                return;
            }
            names.forEach(function(name) {
                var subDefer = Q.defer();
                var filePath = path.resolve(dirPath, name);
                process.nextTick(function() {
                    fs.stat(filePath, function(err, stat) {
                        if (err) {
                            subDefer.reject(err);
                        }
                        if (stat) {
                            if (stat.isDirectory()) {
                                promises.push(scanFolder(name, fileCallback));

                            }
                            else if (stat.isFile()) {
                                process.nextTick(function() {
                                    fs.readFile(filePath, {},function(err, data) {
                                        if (err) {
                                            subDefer.reject(err);
                                        }
                                        else {
                                            try {
                                                fileCallback(name, data, stat);
                                                subDefer.resolve();
                                            }
                                            catch(err) {
                                                console.error(err);
                                                subDefer.reject(err);
                                            }
                                        }
                                    });
                                });
                            }
                        }
                    });
                    promises.push(subDefer.promise);
                });
            });
        });
    });
    return Q.allSettled(promises);
}


module.exports = {
    /**
     * @field template {Object} Map of compiled templates
     */
    templates : {},
    knownTemplates : [],

    /**
     * Attaches the 'templates' property to 'locals' pf request and response objects. if no 'locals' found, it is created on demand.
     * @param req {IncomingMessage}
     * @param res {ServerResponse}
     * @param next {Function}
     * @returns {function} configured middleware function
     * @api public
     */
    attachTemplatesToRequest : function() {
        var self = this;
        return function (req, res, next) {
            req.templates = self.templates;

            if (!req.locals) {
                req.locals = {};
            }
            req.locals.templates = self.templates;
            req.locals.knownTemplates = self.knownTemplates;
            if (!res.locals) {
                res.locals = {};
            }
            res.locals.templates = self.templates;
            req.locals.knownTemplates = self.knownTemplates;
            return next();
        };
    },
    /**
     *
     * @param dirPath
     * @param callback {Function} optional callback to be invoked when a file compiled into a template
     * @returns {Q} promise that will be fulfilled if all templates are compiled successfully
     */
    initTemplates : function(dirPath, callback) {
        var self = this;
        if (dirPath.prototype === Function) {
            callback = dirPath;
            dirPath = '/views/templates';
        }
        dirPath = path.resolve(dirPath);
        var d = Q.defer();
        scanFolder(dirPath, function (filePath, fileData) {
            var funcName = path.basename(filePath, ".jade");
            self.templates[funcName] = jade.compile(fileData);
            self.knownTemplates.push(funcName);
        }).done(
            function() {
                if (callback) {
                    d.resolve(callback());
                }
                else {
                    d.resolve();
                }
            },
            function () {
                d.reject();
                throw new Error("Unable to process all templates files as desired");
            });
        return d.promise;
    }
};