jade-dynamic-includes
=====================

Dynamic includes support for Jade rendering engine

Usage
=====

1. Process the templates with initTemplates call like this:

        jadeDynamicIncludes.initTemplates(__dirname + '/views/templates').done(function() {
            app.listen(app.get('port'), function(){
                console.log('Express server listening on port ' + app.get('port'));
            });
        });

2. Add a hook to express or connect pipeline (express example below):

        app.use(jadeDynamicIncludes.attachTemplatesToRequest);

NOTE: make 'use' call before any of route setup calls are made.



