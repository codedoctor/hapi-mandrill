_ = require 'underscore'
mandrill = require 'mandrill-api/mandrill'
Hoek = require 'hoek'
i18n = require './i18n'

###
Registers the plugin.  
###
module.exports.register = (server, options = {}, cb) ->
  Hoek.assert options.senderName, i18n.optionsSenderNameRequired
  Hoek.assert options.senderEmail, i18n.optionsSenderEmailRequired

  defaults = 
    templateNameMap : {}
    verbose : false

  options = Hoek.applyToDefaults defaults, options

  mandrillClient = null
  templateNameMapping = options.templateNameMap

  ###
  This is lenient to simplify testing.
  ###
  if options.key
    mandrillClient = new mandrill.Mandrill options.key
    server.log ['info','plugin','startup','hapi-mandrill'], "Email send ENABLED with key #{options.key}"  if options.verbose
  else
    server.log ['info','plugin','startup','hapi-mandrill'], "Email send DISABLED - missing 'key' in options - success callback will still be invoked but no emails go out."  if options.verbose

  send = (receiverName,receiverEmail,payload = {},subject,templateName,cb2 = ->) ->
    # NOT SURE ABOUT receiver name
    Hoek.assert _.isString(receiverEmail),"The required parameter receiverEmail is missing or not a string."
    Hoek.assert _.isString(subject),"The required parameter subject is missing or not a string."
    Hoek.assert _.isString(templateName),"The required parameter templateName is missing or not a string."
    Hoek.assert _.isFunction(cb2), "The required parameter cb2 is missing or not a function"    

    global_merge_vars = payload.global_merge_vars
    merge_vars = payload.merge_vars

    delete payload.global_merge_vars
    delete payload.merge_vars

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

    sendTemplateOptions.message.global_merge_vars = global_merge_vars if global_merge_vars
    sendTemplateOptions.message.merge_vars = merge_vars if merge_vars

    server.log ['info','plugin','email-send','hapi-mandrill'],"Attempting to send email to #{options.senderEmail}", sendTemplateOptions if options.verbose

    success = (result) ->
      server.log ['info','plugin','email-sent','hapi-mandrill','success'],"Successfully sent email to #{options.senderEmail}", result if options.verbose
      cb2 null,result

    error = (err) ->
      server.log ['error','plugin','email-not-sent','hapi-mandrill','failure'],"Failed to send email to #{options.senderEmail} for reason #{err}",err if options.verbose
      cb2 err

    if mandrillClient
      mandrillClient.messages.sendTemplate sendTemplateOptions, success,error
    else
      success {} # Mock mode, need to think about result

  server.expose 'mandrillClient', mandrillClient
  server.expose 'send', send
  server.expose 'templateNameMapping', templateNameMapping

  cb()

module.exports.register.attributes =
  pkg: require '../package.json'

