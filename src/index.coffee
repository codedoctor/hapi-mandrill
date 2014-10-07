_ = require 'underscore'
mandrill = require 'mandrill-api/mandrill'
Hoek = require 'hoek'
i18n = require './i18n'

###
Registers the plugin.  
###
module.exports.register = (plugin, options = {}, cb) ->
  Hoek.assert options.senderName, i18n.optionsSenderNameRequired
  Hoek.assert options.senderEmail, i18n.optionsSenderEmailRequired

  defaults = 
    templateNameMap : {}

  options = Hoek.applyToDefaults defaults, options

  mandrillClient = null
  templateNameMapping = options.templateNameMap

  ###
  This is lenient to simplify testing.
  ###
  if options.key
    mandrillClient = new mandrill.Mandrill options.key
  else
    plugin.log ['configuration','warning'], i18n.emailSendDisabled 

  send = (receiverName,receiverEmail,payload = {},subject,templateName,cb2 = ->) ->

    templateContent = []
    for k in _.keys payload
      templateContent.push 
        name : k
        content: payload[k]

    templateName = templateNameMapping[templateName] || templateName # If it is mapped, take the mapped one, otherwise pass it 1:1


    sendTemplateOptions = 
      template_name: templateName
      template_content: templateContent
      async: true
      message: 
        subject: subject
        from_email: options.senderEmail
        from_name: options.senderName
        to: [
            email: receiverEmail
            name: receiverName
          ] 
        track_opens: true
        auto_text: true
        auto_html: true
        inline_css: true

    success = (result) ->
      plugin.log ['mandrill','email-sent'],i18n.emailQueuedSuccess, result
      cb2 null,result

    error = (err) ->
      plugin.log ['mandrill','email-not-sent','error'],i18n.emailNotQueuedFailure, err
      cb2 err

    if mandrillClient
      mandrillClient.messages.sendTemplate sendTemplateOptions, success,error
    else
      success {} # Mock mode, need to think about result

  plugin.expose 'mandrillClient', mandrillClient
  plugin.expose 'send', send
  plugin.expose 'templateNameMapping', templateNameMapping

  cb()

module.exports.register.attributes =
  pkg: require '../package.json'

