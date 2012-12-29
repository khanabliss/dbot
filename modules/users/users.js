/**
 * Name: Users
 * Description: Track known users
 */
var users = function(dbot) {
    var knownUsers = dbot.db.knownUsers;
    var getServerUsers = function(event) {
        if(!knownUsers.hasOwnProperty(event.server)) {
            knownUsers[event.server] = { 'users': [], 'aliases': {} };
        }
        return knownUsers[event.server];    
    };

    dbot.instance.addListener('366', 'users', function(event) {
        var knownUsers = getServerUsers(event);
        for(var nick in event.channel.nicks) {
            if(!knownUsers.users.include(nick) && !knownUsers.aliases.hasOwnProperty(nick) &&
                    event.channel.nicks.hasOwnProperty(nick)) {
                knownUsers.users.push(nick);
            }
        }
    });

    var commands = {
        '~alias': function(event) {
            var knownUsers = getServerUsers(event);
            var alias = event.params[1].trim();
            if(knownUsers.aliases.hasOwnProperty(alias)) {
                event.reply(alias + ' is an alias of ' + knownUsers.aliases[alias]);
            } else {
                event.reply(alias + ' is not known as an alias to me.');
            }
        },

        '~setaliasparent': function(event) {
            if(dbot.config.admins.include(event.user)) {
                var knownUsers = getServerUsers(event);
                var newParent = event.params[1];

                if(knownUsers.aliases.hasOwnProperty(newParent)) {
                    var newAlias = knownUsers.aliases[newParent]; 

                    // Replace users entry with new primary user
                    var usersIndex = knownUsers.users.indexOf(newAlias);
                    knownUsers.users[usersIndex] = newParent;

                    // Remove alias for new parent & add alias for new alias
                    delete knownUsers.aliases[newParent];
                    knownUsers.aliases[newAlias] = newParent;

                    // Update aliases to point to new primary user
                    for(var alias in knownUsers.aliases) {
                        if(knownUsers.aliases.hasOwnProperty(alias)) {
                            if(knownUsers.aliases[alias] === newAlias) {
                                knownUsers.aliases[alias] = newParent;
                            }
                        }
                    }

                    event.reply(newParent + ' is now the parent user, and ' +
                        newAlias + ' is an alias.');
                } else {
                    event.reply('Given new parent does not currently exist as an alias.');
                }
            }
        }
    };

    return {
        'name': 'users',
        'ignorable': false,
        'commands': commands,
            
        'listener': function(event) {
            var knownUsers = getServerUsers(event); 
            if(event.action == 'JOIN') {
                if(!knownUsers.users.include(event.user)) {
                    knownUsers.users.push(event.user);
                }
            } else if(event.action == 'NICK') {
                var newNick = event.params.substr(1);
                if(!knownUsers.users.include(newNick)) {
                    knownUsers.aliases[newNick] = event.user;
                }
            }
        },
        'on': ['JOIN', 'NICK'],
        
        'onLoad': function() {
            // Trigger updateNickLists to stat current users in channel
            var connections = dbot.instance.connections;
            for(var conn in connections) {
                if(connections.hasOwnProperty(conn)) {
                    connections[conn].updateNickLists();
                }
            }
        }
    };
};

exports.fetch = function(dbot) {
    return users(dbot);
};