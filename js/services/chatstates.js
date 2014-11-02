angular.module('IX.services')

.service('Chatstate', function($rootScope, SharedProperties, XML) {
    
    var sharedData = SharedProperties.sharedObject;

    return{

        addActive : function(message) {
            return message.c('active', {xmlns: Strophe.NS.CHATSTATES});
        },

        process : function(message) {

            var parsedMessage = XML.parse(message),
                from = parsedMessage['@attributes'].from.split('/')[0],
                chatstates = ['active', 'composing', 'paused', 'inactive', 'gone'];

            if (sharedData.messagePool[from]) {

                for (var i = chatstates.length - 1; i >= 0; i--) {
                    if (parsedMessage[chatstates[i]]) {
                        sharedData.messagePool[from].chatstate = chatstates[i];
                        return;
                    }
                }
            }
        },

        sendState : function(obj) {

            var msg = $msg({
                    to: obj.jid,
                    type: obj.type || 'chat'
                }).c(obj.state, {xmlns: Strophe.NS.CHATSTATES}).tree();

            sharedData.connection.send(msg);
        }
    }
});