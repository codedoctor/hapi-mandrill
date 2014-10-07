assert = require 'assert'
should = require 'should'
index = require '../lib/index'
_ = require 'underscore'

loadServer = require './support/load-server'

describe 'WHEN index has been loaded', ->
  server = null
  mandrillPlugin = null

  describe 'with server setup', ->
    beforeEach (cb) ->
      loadServer (err,serverResult) ->
        return cb err if err
        server = serverResult
        mandrillPlugin = server.pack.plugins['hapi-mandrill']
        cb null

    it 'should send email', (cb) ->
      payload = 
        resetlink: "<a href=\"http://test.com\">Reset Password</a>"
        token: "<span>\"123456789\"</span>"
      mandrillPlugin.send "Martin Wawrusch","martin@wawrusch.com", payload,"Password Reset","passwordReset", (err,result) ->

        should.not.exist err
        should.exist result

        cb null

