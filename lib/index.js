(function() {
  var Hoek, _, i18n, mandrill;

  _ = require('underscore');

  mandrill = require('mandrill-api/mandrill');

  Hoek = require('hoek');

  i18n = require('./i18n');


  /*
  Registers the plugin.
   */

  module.exports.register = function(server, options, cb) {
    var defaults, mandrillClient, send, templateNameMapping;
    if (options == null) {
      options = {};
    }
    Hoek.assert(options.senderName, i18n.optionsSenderNameRequired);
    Hoek.assert(options.senderEmail, i18n.optionsSenderEmailRequired);
    defaults = {
      templateNameMap: {},
      verbose: false
    };
    options = Hoek.applyToDefaults(defaults, options);
    mandrillClient = null;
    templateNameMapping = options.templateNameMap;

    /*
    This is lenient to simplify testing.
     */
    if (options.key) {
      mandrillClient = new mandrill.Mandrill(options.key);
      if (options.verbose) {
        server.log(['info', 'plugin', 'startup', 'hapi-mandrill'], "Email send ENABLED with key " + options.key);
      }
    } else {
      if (options.verbose) {
        server.log(['info', 'plugin', 'startup', 'hapi-mandrill'], "Email send DISABLED - missing 'key' in options - success callback will still be invoked but no emails go out.");
      }
    }
    send = function(receiverName, receiverEmail, payload, subject, templateName, cb2) {
      var error, global_merge_vars, i, k, len, merge_vars, ref, sendTemplateOptions, success, templateContent;
      if (payload == null) {
        payload = {};
      }
      if (cb2 == null) {
        cb2 = function() {};
      }
      Hoek.assert(_.isString(receiverEmail), "The required parameter receiverEmail is missing or not a string.");
      Hoek.assert(_.isString(subject), "The required parameter subject is missing or not a string.");
      Hoek.assert(_.isString(templateName), "The required parameter templateName is missing or not a string.");
      Hoek.assert(_.isFunction(cb2), "The required parameter cb2 is missing or not a function");
      global_merge_vars = payload.global_merge_vars;
      merge_vars = payload.merge_vars;
      delete payload.global_merge_vars;
      delete payload.merge_vars;
      templateContent = [];
      ref = _.keys(payload);
      for (i = 0, len = ref.length; i < len; i++) {
        k = ref[i];
        templateContent.push({
          name: k,
          content: payload[k]
        });
      }
      templateName = templateNameMapping[templateName] || templateName;
      sendTemplateOptions = {
        template_name: templateName,
        template_content: templateContent,
        async: true,
        message: {
          subject: subject,
          from_email: options.senderEmail,
          from_name: options.senderName,
          to: [
            {
              email: receiverEmail,
              name: receiverName
            }
          ],
          track_opens: true,
          auto_text: true,
          auto_html: true,
          inline_css: true
        }
      };
      if (global_merge_vars) {
        sendTemplateOptions.message.global_merge_vars = global_merge_vars;
      }
      if (merge_vars) {
        sendTemplateOptions.message.merge_vars = merge_vars;
      }
      if (options.verbose) {
        server.log(['info', 'plugin', 'email-send', 'hapi-mandrill'], "Attempting to send email to " + options.senderEmail, sendTemplateOptions);
      }
      success = function(result) {
        if (options.verbose) {
          server.log(['info', 'plugin', 'email-sent', 'hapi-mandrill', 'success'], "Successfully sent email to " + options.senderEmail, result);
        }
        return cb2(null, result);
      };
      error = function(err) {
        if (options.verbose) {
          server.log(['error', 'plugin', 'email-not-sent', 'hapi-mandrill', 'failure'], "Failed to send email to " + options.senderEmail + " for reason " + err, err);
        }
        return cb2(err);
      };
      if (mandrillClient) {
        return mandrillClient.messages.sendTemplate(sendTemplateOptions, success, error);
      } else {
        return success({});
      }
    };
    server.expose('mandrillClient', mandrillClient);
    server.expose('send', send);
    server.expose('templateNameMapping', templateNameMapping);
    return cb();
  };

  module.exports.register.attributes = {
    pkg: require('../package.json')
  };

}).call(this);

//# sourceMappingURL=index.js.map
