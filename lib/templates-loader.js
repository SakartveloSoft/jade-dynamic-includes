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
    this._count++;
    if (!this[name]) {
        this[name] = func;
    }
}

function RequestTemplates(res, appTemplates) {
    this._items = {};
    this._count = appTemplates._count;
    this.renderTemplate = invokeRenderTemplate.bind(appTemplates, res.locals);
    this.knownTemplates = knownTemplates.slice();
    for(var templateId in appTemplates.items) {
        if (appTemplates.items.hasOwnProperty(templateId)) {
            this._items[templateId] = invokeRenderTemplate.bind(this, res.locals, templateId);
        }
    }
}

function getTemplates(res) {
    return new RequestTemplates(res, templates);
}


function invokeRenderTemplate(requestOptons, name, options) {
    var opts = {};
    for(var p in requestOptons) {
        opts[p] = requestOptons[p];
    }
    if (options) {
        for (var p in options) {
            opts[p] = requestOptons[p];
        }
    }
    return templates.items[name](opts);
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
            var requestTemplates = getTemplates(res);
            req.locals.templates = requestTemplates;
            req.locals.knownTemplates = knownTemplates;
            if (!res.locals) {
                res.locals = {};
            }
            res.locals.templates = requestTemplates;
            res.locals.knownTemplates = knownTemplates;
            res.locals.renderTemplate = invokeRenderTemplate.bind(null, res.locals);

            return next();
        };
    },
    /**
     *
     * @param {String} dirPath
     * @param {Boolean=} devMode - if this parameter is trueful, file is being loaded every time from disk
     * on render time. Use rhis option for development purposes only
     * @param {String} filesExt - views files extension
     * @param {Function=} compileCallback  optional callback to be invoked when a file compiled into a template. Used if devMode set to true
     */
    initTemplates : function(dirPath, devMode, filesExt, compileCallback) {
        dirPath = path.resolve(dirPath);

        var allFiles = [];

        scanFolder(dirPath, allFiles);
        allFiles.forEach(function (filePath) {
            var funcName = path.basename(filePath, filesExt || '.jade');
            var data = fs.readFileSync(filePath)
            var functor;
            if (devMode) {
                functor = compileCallback || function RenderFileSync(options) {
                    return jade.renderFile(filePath, options);
                }
            }
            else {
                functor = jade.compile(data);
            }
            templates.addTemplate(funcName, functor);
            knownTemplates.push(funcName);

        });
    }
};