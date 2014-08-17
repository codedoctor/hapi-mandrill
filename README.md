[![Build Status](https://travis-ci.org/codedoctor/hapi-mandrill.svg?branch=master)](https://travis-ci.org/codedoctor/hapi-mandrill)
[![Coverage Status](https://img.shields.io/coveralls/codedoctor/hapi-mandrill.svg)](https://coveralls.io/r/codedoctor/hapi-mandrill)
[![NPM Version](http://img.shields.io/npm/v/hapi-mandrill.svg)](https://www.npmjs.org/package/hapi-mandrill)
[![Dependency Status](https://gemnasium.com/codedoctor/hapi-mandrill.svg)](https://gemnasium.com/codedoctor/hapi-mandrill)
[![NPM Downloads](http://img.shields.io/npm/dm/hapi-mandrill.svg)](https://www.npmjs.org/package/hapi-mandrill)
[![Issues](http://img.shields.io/github/issues/codedoctor/hapi-mandrill.svg)](https://github.com/codedoctor/hapi-mandrill/issues)
[![HAPI 6.0](http://img.shields.io/badge/hapi-6.0-blue.svg)](http://hapijs.com)
[![API Documentation](http://img.shields.io/badge/API-Documentation-ff69b4.svg)](http://coffeedoc.info/github/codedoctor/hapi-mandrill)

(C) 2014 Martin Wawrusch

HAPI plugin that exposes mandrill api - used to send transactional emails.

The rational behind this is that every single hapi app I created needs transactional emails,
and it always involves plumbing code. With this module I provide the most common usecase with
a well defined signature, and also expose the mandrillClient.

## Usage
The key and templateNameMapping parameters are optional, but without a key nothing gets send (useful for testing).

```Coffeescript

hapiMandrill = require 'hapi-mandrill'

pluginConf = [
    plugin: hapiMandrill
    options:
      senderName: "John Smith"
      senderEmail: "john@smith.com"
      key : null # Keep null for testing
      templateNameMapping: 
        "from" : "toInMandrill"
]

server.pack.register pluginConf, (err) ->
  #...

```

## Send Mail
```Coffeescript

fnCallback = (err,result) ->
  # Do some stuff when done.

plugin = server.pack.plugins['hapi-mandrill']

plugin.send("Angelina Jolie","angelina@jolie.com", {some: "payoad"},"Hello Angelina","angelina-template", fnCallback)

```

## Logging
The plugin logs successful and failed sends. NOTE: If you want to disable this, or want different log tags let me know and I will make it customizable.

## Template Name Mapping
Mandrill templates are often managed by third parties, you don't want them to break a core functionaly without testing it first yourself. For that reason, you can define internal template names and transform them to whatever you want to use in mandrill. 
To do so, set the 'templateNameMap' object to internal : external pairs. If none is defined, or a
key is not found it will be passed verbatim.

## Exposed Properties
```Coffeescript
plugin = server.pack.plugins['hapi-mandrill']

plugin.mandrillClient # Note this is null if you do not pass a key in options
plugin.send(...)
plugin.templateNameMapping = {...}

```

## See also

* [hapi-auth-bearer-mw](https://github.com/codedoctor/hapi-auth-bearer-mw)
* [hapi-identity-store](https://github.com/codedoctor/hapi-identity-store)
* [hapi-mongoose-db-connector](https://github.com/codedoctor/hapi-mongoose-db-connector)
* [hapi-routes-authorization-and-session-management](https://github.com/codedoctor/hapi-routes-authorization-and-session-management)
* [hapi-routes-roles](https://github.com/codedoctor/hapi-routes-roles)
* [hapi-mandrill](https://github.com/codedoctor/hapi-mandrill)
* [hapi-routes-users-authorizations](https://github.com/codedoctor/hapi-routes-users-authorizations)
* [hapi-routes-oauth-management](https://github.com/codedoctor/hapi-routes-oauth-management)
* [hapi-routes-users](https://github.com/codedoctor/hapi-routes-users)

and additionally

* [mongoose-identity-store-multi-tenant](https://github.com/codedoctor/mongoose-identity-store-multi-tenant)
* [mongoose-rest-helper](https://github.com/codedoctor/mongoose-rest-helper)
* [api-pagination](https://github.com/codedoctor/api-pagination)


## Contributing
 
* Check out the latest master to make sure the feature hasn't been implemented or the bug hasn't been fixed yet
* Check out the issue tracker to make sure someone already hasn't requested it and/or contributed it
* Fork the project
* Start a feature/bugfix branch
* Commit and push until you are happy with your contribution
* Make sure to add tests for it. This is important so I don't break it in a future version unintentionally.
* Please try not to mess with the package.json, version, or history. If you want to have your own version, or is otherwise necessary, that is fine, but please isolate to its own commit so I can cherry-pick around it.

## Copyright

Copyright (c) 2014 Martin Wawrusch 
