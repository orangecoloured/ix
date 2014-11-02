angular.module('IX.services')

.service('Receipt', function($rootScope, SharedProperties, XML) {
    
    var sharedData = SharedProperties.sharedObject;

    return{

        addRequest : function(message) {
            return message.c('request', {xmlns: Strophe.NS.RECEIPTS});
        },

        markDelivered : function(obj) {

            var from = obj['@attributes'].from.split('/')[0],
                messageId = obj.received['@attributes'].id;

            if (sharedData.messagePool[from]) {

                var messageArr = sharedData.messagePool[from].messages;

                for (var i = messageArr.length - 1; i >= 0; i--) {

                    if (messageArr[i]['@attributes'].id == messageId) {
                        messageArr[i].delivered = true;
                        return;
                    }
                }
            }
        },

        process : function(message) {

            var parsedMessage = XML.parse(message);

            if (parsedMessage.received) {
                this.markDelivered(parsedMessage);
            }

            if (parsedMessage.request) {
                this.sendReceived(parsedMessage);
            }
        },

        sendReceived : function(obj) {

            var messageId = obj['@attributes'].id,
                to = obj['@attributes'].from.split('/')[0],
                msg = $msg({
                    to: to
                }).c('received', {
                    xmlns: Strophe.NS.RECEIPTS,
                    id: messageId
                }).tree();

            sharedData.connection.send(msg);
        }
    }
});