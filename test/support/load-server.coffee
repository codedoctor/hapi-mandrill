index = require '../../lib/index'
Hapi = require "hapi"
_ = require 'underscore'

module.exports = loadServer = (cb) ->
    server = new Hapi.Server 5675,"localhost",{}

    pluginConf = [
        plugin: index
        options:
          senderName: "John Smith"
          senderEmail: "john@smith.com"
    ]

    server.pack.register pluginConf, (err) ->
      cb err,server