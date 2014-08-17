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
      templateNameMap: {}
    };
    options = Hoek.applyToDefaults(defaults, options);
    mandrillClient = null;
    templateNameMapping = options.templateNameMap;
    if (options.key) {
      mandrillClient = new mandrill.Mandrill(options.key);
    } else {
      console.log("Email sending DISABLED - missing 'key' options");
    }
    send = function(receiverName, receiverEmail, payload, subject, templateName, cb) {
      var error, k, sendTemplateOptions, success, templateContent, _i, _len, _ref;
      if (payload == null) {
        payload = {};
      }
      if (cb == null) {
        cb = function() {};
      }
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
      success = function(result) {
        plugin.log(['mandrill', 'email-sent'], "Email queued", result);
        return cb(null, result);
      };
      error = function(err) {
        plugin.log(['mandrill', 'email-not-sent', 'error'], "Failed to queue email.", err);
        return cb(err);
      };
      if (mandrillClient) {
        return mandrillClient.messages.sendTemplate(sendTemplateOptions, success, error);
      } else {
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
