(function() {
  var Hoek, i18n, mandrill, _;

  _ = require('underscore');

  mandrill = require('mandrill-api/mandrill');

  Hoek = require('hoek');

  i18n = require('./i18n');


  /*
  Registers the plugin.
   */

  module.exports.register = function(plugin, options, cb) {
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
        console.log("Mandrill active with " + options.key);
      }
    } else {
      if (options.verbose) {
        console.log("Mandrill disabled - no key");
      }
      plugin.log(['configuration', 'warning'], i18n.emailSendDisabled);
    }
    send = function(receiverName, receiverEmail, payload, subject, templateName, cb2) {
      var error, global_merge_vars, k, merge_vars, sendTemplateOptions, success, templateContent, _i, _len, _ref;
      if (payload == null) {
        payload = {};
      }
      if (cb2 == null) {
        cb2 = function() {};
      }
      if (options.verbose) {
        console.log("Sending to: " + receiverName + " / " + receiverEmail + " / " + templateName);
      }
      if (options.verbose) {
        console.log("Payload: " + (JSON.stringify(payload)));
      }
      if (options.verbose) {
        console.log("Subject: " + subject);
      }
      global_merge_vars = payload.global_merge_vars;
      merge_vars = payload.merge_vars;
      delete payload.global_merge_vars;
      delete payload.merge_vars;
      templateContent = [];
      _ref = _.keys(payload);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        k = _ref[_i];
        templateContent.push({
          name: k,
          content: payload[k]
        });
      }
      templateName = templateNameMapping[templateName] || templateName;
      if (options.verbose) {
        console.log("Mapped templateName: " + templateName);
      }
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
      success = function(result) {
        if (options.verbose) {
          console.log("Mandrill success: " + (JSON.stringify(result)));
        }
        plugin.log(['mandrill', 'email-sent'], i18n.emailQueuedSuccess, result);
        return cb2(null, result);
      };
      error = function(err) {
        if (options.verbose) {
          console.log("Mandrill error: " + (JSON.stringify(err)));
        }
        plugin.log(['mandrill', 'email-not-sent', 'error'], i18n.emailNotQueuedFailure, err);
        return cb2(err);
      };
      if (mandrillClient) {
        if (options.verbose) {
          console.log("Sending to Mandrill: " + (JSON.stringify(sendTemplateOptions)));
        }
        return mandrillClient.messages.sendTemplate(sendTemplateOptions, success, error);
      } else {
        if (options.verbose) {
          console.log("Faking mandrill send");
        }
        return success({});
      }
    };
    plugin.expose('mandrillClient', mandrillClient);
    plugin.expose('send', send);
    plugin.expose('templateNameMapping', templateNameMapping);
    return cb();
  };

  module.exports.register.attributes = {
    pkg: require('../package.json')
  };

}).call(this);

//# sourceMappingURL=index.js.map
