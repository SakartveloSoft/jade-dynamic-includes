jade-dynamic-includes
=====================

Dynamic includes support for Jade rendering engine

Code changes in your app
========================

1. Process the templates with initTemplates call like this:

        jadeDynamicIncludes.initTemplates(__dirname + '/views/templates');

If you in development, and plan edit the views files after app started, set the `devMode` to `true`.

        jadeDynamicIncludes.initTemplates(__dirname + '/views/templates', true);


2. Add a hook to express or connect pipeline (express example below):

        app.use(jadeDynamicIncludes.attachTemplatesToRequest());

NOTE: make `use` call before any of route setup calls are made.

Usage in templates
==================

There are two constructs you can use two constructs to render templates - ___renderTemplates___ function and methods
of the ___templates___ object.

Use this construct to render templates with __renderTemplate__ method:

        != renderTemplate(templateId, options_are_optional)

where ___templateId___ is a variable, e. g. from an ___each___ loop or current view locals. Or use

        != renderTemplate("templateName", options_are_optional)

where ___"templateName"___ is an actual template name, e. g. __"items-list"__.

With methods of __template__ object can be used with this construct:

        |= render.__templateId__(___options___)

where __templateId__ is template name, same as name of method and __options__ are optional object, that is used
by most of templates.

You can enumerate list of known templates by __knownTemplates__ property which is array of templates names.

These methods and objects are available within templates, rendered using the constructs, listed above.

Known limitations
=================

By convention, template will be named as file without an extension ___(".jade")___. This means that form folders tree:

        views/templates/a.jade
        views/templates/b.jade
        /views/templates/beta/b.jade

the following templates will be available to views:

        views/templates/a.jade as a
        /views/templates/beta/b.jade as b

___NOTE___: Nested templates are available, but currently recursive templates can result to stack overflow or an infinite loop.

Changes history
===============
0.2.1 - request locals made available in templates among with local per-template changes
0.2.0 - first "stable" version with "recursive" templates rendering support.
