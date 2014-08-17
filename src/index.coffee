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

  if options.key
    mandrillClient = new mandrill.Mandrill options.key
  else
    console.log "Email sending DISABLED - missing 'key' options"

  send = (receiverName,receiverEmail,payload = {},subject,templateName,cb = ->) ->
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
      plugin.log ['mandrill','email-sent'],"Email queued", result
      cb null,result

    error = (err) ->
      plugin.log ['mandrill','email-not-sent','error'],"Failed to queue email.", err
      cb err

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

