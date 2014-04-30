jade-dynamic-includes
=====================

Dynamic includes support for Jade rendering engine

Code changes in your app
========================

1. Process the templates with initTemplates call like this:

        jadeDynamicIncludes.initTemplates(__dirname + '/views/templates').done(function() {
            app.listen(app.get('port'), function(){
                console.log('Express server listening on port ' + app.get('port'));
            });
        });

2. Add a hook to express or connect pipeline (express example below):

        app.use(jadeDynamicIncludes.attachTemplatesToRequest);

NOTE: make 'use' call before any of route setup calls are made.

Usage in templates
==================

There are two ways to use these templates:

    != templates[templateId](arg1, arg2,...)

where ___templateId___ is a variable, e. g. from an ___each___ loop or current view locals.

    != templates.templateId(arg1, arg2,...)

where ___templateId___ is an actual template name, e. g. __items-list__

Known limitations
=================

By convention, template will be named as file without an extension ___(".jade")___. This means that form folders tree:

    views/templates/a.jade
    views/templates/b.jade
    /views/templates/beta/b.jade

the following templates will be available to views:

    views/templates/a.jade as a
    /views/templates/beta/b.jade as b

