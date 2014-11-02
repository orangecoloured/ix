angular.module('IX.services')

.service('Message', function($sce, $ionicScrollDelegate, $rootScope, SharedProperties, XML, Chatstate, Receipt) {
    var sharedData = SharedProperties.sharedObject;

    function appendMessage(obj) {
        
        sharedData.messagePool[obj['@attributes'].to].messages.push(obj);
        $ionicScrollDelegate.scrollBottom(true);
    }

    function incomingMessage() {
        $rootScope.$broadcast('incomingMessage');
    }

    return{

        refreshUnread : function() {

            var unreadNumber = 0;
            
            for (var key in sharedData.messagePool) {
                if (sharedData.messagePool[key].unread) {
                    unreadNumber += 1;
                }
            }

            sharedData.unread = unreadNumber;

            $rootScope.$broadcast('refreshUnread');
        },

        convertToPlainText : function(str) {
            return str.replace(/[&<>"']/g, function($0) {
                return "&" + {"&":"amp", "<":"lt", ">":"gt", '"':"quot", "'":"#39"}[$0] + ";";
            });
        },

        stripHTML : function(str) {
            var newStr = str.replace(/<(?:.|\n)*?>/gm, '');
            
            return newStr != '' ? newStr : 'This message was potentially harmful.';
        },

        extractTime : function(date) {

            return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
        },

        process: function(message) {

            var parsedMessage = XML.parse(message),
                from = parsedMessage['@attributes'].from.split('/')[0];

            if (parsedMessage.body == null && parsedMessage.html == null) {

                /*if (sharedData.messagePool[from] != null) {
                    sharedData.messagePool[from].typing = parsedMessage.composing != null ? true : false;
                }*/
            } else {

                /*if (window.plugin) {
                    window.plugin.notification.local.add({
                        autoCancel: true,
                        id: 1,
                        title: from,
                        message: parsedMessage.body['#text']
                        //icon: 'ic_notification',
                        //smallIcon: 'ic_notification_small',
                    });
                }*/

                parsedMessage.body['#text'] = $sce.trustAsHtml(Autolinker.link(this.parseNewLines(this.convertToPlainText(parsedMessage.body['#text']))));

                // This shit is not safe
                /*if (parsedMessage.html) {
                    parsedMessage.html.body['#text'] = $sce.trustAsHtml(Autolinker.link(message.querySelector('html').innerHTML));
                }*/

                if (parsedMessage.delay) {
                    parsedMessage.delay['@attributes'].time = this.extractTime(new Date(parsedMessage.delay['@attributes'].stamp));
                } else {
                    parsedMessage.delay = {
                        '@attributes' : {
                            time : this.extractTime(new Date())
                        }
                    }
                }
                
                sharedData.messagePool[from] = sharedData.messagePool[from] || {};
                sharedData.messagePool[from].messages = sharedData.messagePool[from].messages || [];

                sharedData.messagePool[from].messages.push(parsedMessage);
                
                if (sharedData.activeChat == from) {
                    
                    sharedData.messagePool[from].unread = false;
                    incomingMessage();
                } else {
                    
                    sharedData.messagePool[from].unread = true;
                    this.refreshUnread();
                }
            }
        },

        parseNewLines : function(text) {
            text = text.replace(/\n\r/g, '<br>');
            text = text.replace(/\n/g, '<br>');

            return text;
        },

        send : function(obj) {
            var requestId = sharedData.connection.getUniqueId('message'),
                msg = $msg({
                    to: obj.jid,
                    type: 'chat',
                    id: requestId
                }).c('body', {}, obj.message);

            Chatstate.addActive(msg);
            Receipt.addRequest(msg.up());
            
            msg.tree();

            sharedData.connection.send(msg);

            appendMessage({
                self: true,
                '@attributes': {
                    from: sharedData.myJid,
                    to: obj.jid,
                    type: "chat",
                    xmlns: "jabber:client",
                    id: requestId
                },
                body: {
                    '#text': $sce.trustAsHtml(Autolinker.link(this.parseNewLines(this.convertToPlainText(obj.message))))
                },
                delay: {
                    '@attributes' : {
                        time: this.extractTime(new Date())
                    }
                }
            });
        }
    }
});