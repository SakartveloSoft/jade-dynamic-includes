jade-dynamic-includes
=====================

Dynamic includes support for the [Jade] rendering engine

[Jade]: http://jade-lang.com/

Code changes in your app
========================

1. Process the templates with initTemplates call like this:

        var jadeDynamicIncludes = require('jade-dynamic-includes');
        jadeDynamicIncludes.initTemplates(__dirname + '/views/templates');

   If you're in development and plan to edit the views files after the app has started, set `devMode` to `true`:

        jadeDynamicIncludes.initTemplates(__dirname + '/views/templates', true);

2. Add a hook to your Express or Connect pipeline. For Express, this is:

        app.use(jadeDynamicIncludes.attachTemplatesToRequest());

NOTE: make this call to `app.use()` before any of the route setup calls (like `app.get()` or `app.post()`) are made.

Usage in templates
==================

There are two constructs you can use to render templates:

1. The `renderTemplate` function
2. Methods of the `templates` object

Use this construct to render templates with the `renderTemplate` method:

    != renderTemplate(templateId, options_are_optional)

where `templateId` is a variable, e.g. from an `each` loop or current view locals. Or use:

    != renderTemplate("templateName", options_are_optional)

where `templateName` is an actual template name, e.g. `items-list`.

Methods of `template` object can be used with this construct:

    |= render.__templateId__(___options___)

where `__templateId__` is template name, same as name of method and `__options__` are optional object, that is used
by most of templates.

You can enumerate list of known templates by __knownTemplates__ property which is array of templates names.

These methods and objects are available within templates, rendered using the constructs, listed above.

Known limitations
=================

By convention, templates will be named as files without an extension (`.jade`). This means that from this directory structure:

    views/templates/a.jade
    views/templates/b.jade
    /views/templates/beta/b.jade

the following templates will be available to views:

    views/templates/a.jade as a
    /views/templates/beta/b.jade as b

NOTE: Nested templates are available, but currently recursive templates can result in a stack overflow or an infinite loop.

Changes history
===============

- 0.2.1 - request locals made available in templates among with local per-template changes
- 0.2.0 - first "stable" version with "recursive" templates rendering support.
- 0.2.4 - updated package information and fixed verbal error in this README with suggestions of Alex Muller