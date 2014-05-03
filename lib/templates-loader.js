/**
 * Created by konstardiy on 2014-04-30.
 */
"use strict";
var fs = require('fs');
var path = require('path');
var jade = require('jade');

/**
 *
 * @param dirPath {String} the path to folder to start from
 * @param fileCallback {function(name, data, stat)} callback to process a file
 */
function scanFolder(dirPath, files) {
    var names = fs.readdirSync(dirPath);
    names.forEach(function (name) {
        var filePath = path.resolve(dirPath, name);
        var stat = fs.statSync(filePath);
        if (stat) {
            if (stat.isDirectory()) {
                scanFolder(name, files);
            }
            else if (stat.isFile()) {
                files.push(filePath)
            }
        }
    });
}

function TemplatesCollection() {
    this._count = 0;
    this.items = { };
}

var templates = new TemplatesCollection();

TemplatesCollection.prototype.isEmpty = function() {
    return this._count > 0;
}

TemplatesCollection.prototype.addTemplate = function(name, func) {
    this.items[name] = func;
    this.count++;
    if (!this[name]) {
        this[name] = func;
    }
}

function getTemplates() {
    return templates;
}

function renderTemplate(name, options) {
    options = options || {};
    if (!options.renderTemplate) {
        options.renderTemplate = renderTemplate;
    }
    if (!options.templates) {
        options.templates = getTemplates();
    }
    return templates.items[name](options);
}

TemplatesCollection.prototype.render = function(name, options) {
    return renderTemplate(name, options);
}


var knownTemplates = [];

module.exports = {

    /**
     * Attaches the 'templates' property to 'locals' pf request and response objects. if no 'locals' found, it is created on demand.
     * @param req {IncomingMessage}
     * @param res {ServerResponse}
     * @param next {Function}
     * @returns {function} configured middleware function
     * @api public
     */
    attachTemplatesToRequest : function() {
        return function (req, res, next) {

            if (!req.locals) {
                req.locals = {};
            }
            req.locals.templates = getTemplates();
            req.locals.knownTemplates = knownTemplates;
            if (!res.locals) {
                res.locals = {};
            }
            res.locals.templates = getTemplates();
            res.locals.knownTemplates = knownTemplates;
            res.locals.renderTemplate = renderTemplate;

            return next();
        };
    },
    /**
     *
     * @param dirPath
     * @param callback {Function} optional callback to be invoked when a file compiled into a template
     */
    initTemplates : function(dirPath) {
        dirPath = path.resolve(dirPath);

        var allFiles = [];

        scanFolder(dirPath, allFiles);
        allFiles.forEach(function (filePath) {
            var funcName = path.basename(filePath, '.jade');
            var data = fs.readFileSync(filePath)
            templates.addTemplate(funcName, jade.compile(data));
            knownTemplates.push(funcName);

        });
    }
};