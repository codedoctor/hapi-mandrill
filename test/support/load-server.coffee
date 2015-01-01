index = require '../../lib/index'
Hapi = require "hapi"
_ = require 'underscore'

module.exports = loadServer = (cb) ->
    server = new Hapi.Server()
    server.connection
      port: 5675
      host: "localhost"

    pluginConf = [
        register: index
        options:
          senderName: "John Smith"
          senderEmail: "john@smith.com"
          key : null # Keep null for testing
          templateNameMapping: 
            "from" : "toInMandrill"
            "passwordReset" : 'passwordreset'
    ]

    server.register pluginConf, (err) ->
      cb err,server