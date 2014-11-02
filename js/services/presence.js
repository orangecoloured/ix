angular.module('IX.services')

.service('Presence', function($rootScope, SharedProperties, XML, Roster) {
    var sharedData = SharedProperties.sharedObject;

    return{

        send : function(obj) {

            var presence = null;

            if (obj) {
                
                if (obj.type && obj.type.indexOf('subscribe') > -1) {
                    
                    presence = $pres({
                        to: obj.jid,
                        type: obj.type
                    });
                } else if (obj.show || obj.status) {
                    console.log(obj);
                    presence = $pres();

                    if (obj.show && obj.show !== 1) {
                        presence.c('show').t(obj.show).up();
                    }

                    if (obj.priority) {
                        presence.c('priority').t(obj.priority).up();
                    }

                    if (obj.status && obj.status != '') {
                        presence.c('status').t(obj.status).up();
                    }
                }
            } else {

                presence = $pres();
            }

            presence.tree();
        
            sharedData.connection.send(presence);
        },

        remove : function(obj) {
            if (sharedData.presences[obj.jid]) {
                delete sharedData.presences[obj.jid];
            }
        },

        process : function(presence) {

            var parsedPresence = XML.parse(presence),
                from = parsedPresence['@attributes'].from.split('/')[0],
                type = parsedPresence['@attributes'].type;

            if (type && type.indexOf('subscribe') > -1) {
                if (type == 'subscribe') {
                    sharedData.subscriptions.push(parsedPresence);
                    $rootScope.$broadcast('subscriptionRequest');
                } else {
                    Roster.changeSubscription({
                        jid: from,
                        direction: 'incoming',
                        type: type
                    });
                }
            } else {
                sharedData.presences[from] = parsedPresence;
            }
        },

        getStatus : function(obj) {

            var presence = sharedData.presences[obj['@attributes'].jid],
                status = null;

            if (presence != null) {
                status = presence['@attributes'].type || (presence.show != null ? presence.show['#text'] : 'online');
            }

            switch (status) {
                case 'chat':
                case 'online': {
                    return 'energized';
                }
                case 'away':
                case 'xa': {
                    return 'calm';
                }
                case 'dnd': {
                    return 'assertive';
                }
                case 'unavailable':
                default: {
                    return 'stable';
                }
            }
        },

        getStatusText : function(obj) {

            var presence = sharedData.presences[obj['@attributes'].jid],
                statusText = presence && presence.status ? presence.status['#text'] : '';

            return statusText;
        }
    }
});