/**
 * Name: Log
 * Description: Log commands to a channel.
 */
var _ = require('underscore')._;

var log = function(dbot) {
    this.api = {
        'log': function(server, user, message) {
            var logChannel = this.config.logChannel[event.server];
            dbot.say(server, logChannel, dbot.t('log_message', {
                'time': new Date().toUTCString(),
                'command': message,
                'user': user
            }));
        }
    };

    this.onLoad = function() {
        dbot.api.event.addHook('command', function(event) {
            var logChannel = this.config.logChannel[event.server];
            if(logChannel) {
                dbot.say(event.server, logChannel, dbot.t('log_message', {
                    'time': new Date().toUTCString(),
                    'command': event.message,
                    'user': event.user
                }));
            }
        }.bind(this));
    }.bind(this);
};

exports.fetch = function(dbot) {
    return new log(dbot);
};
