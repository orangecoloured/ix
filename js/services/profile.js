angular.module('IX.services')

.service('Profile', function($q, $rootScope, SharedProperties, vCard, XML, base64) {

    var sharedData = SharedProperties.sharedObject;

    function storeCard(obj) {

        sharedData.profiles[obj.jid] = obj.card;
    }

    function buildVcard(obj, parent) {

        var builder;
        console.log(parent);
        if (typeof parent === 'undefined') {
            builder = $build('vCard', {xmlns: Strophe.NS.VCARD, version: '2.0', prodid: '-//HandGen//NONSGML vGen v1.0//EN'});
        } else {
            builder = $build(parent.toUpperCase());
        }

        for (var key in obj) {
            if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                builder.cnode(buildVcard(obj[key], key)).up();
            } else if (obj[key]) {
                if (!Array.isArray(obj[key])) {
                    builder.t(obj[key]);
                }
            } else if (key != '#text') {
                builder.c(key).up();
            }
        }

        return builder.tree();
    }

    return{

        getName : function(obj) {

            var roster = sharedData.roster.clean.query.item,
                nickname = sharedData.profiles[obj.jid] ? (sharedData.profiles[obj.jid].nickname ? sharedData.profiles[obj.jid].nickname['#text'] : null) : null;

            for (var i = roster.length - 1; i >= 0; i--) {
                if (roster[i]['@attributes'].jid == obj.jid) {
                    var customName = roster[i]['@attributes'].name;
                    
                    if (customName) {
                        return customName;
                    } else if (nickname) {
                        return nickname;
                    }
                }

            }
            
            return obj.jid;
        },

        getAll : function() {
            var roster = sharedData.roster.clean.query.item;

            for (var i = roster.length - 1; i >= 0; i--) {
                this.get({jid: roster[i]['@attributes'].jid});
            }
        },

        set : function(obj) {
            sharedData.profiles[sharedData.myJid] = angular.copy(obj);
            
            var myVcard = angular.copy(obj);
            delete myVcard['@attributes'];

            var requestId = sharedData.connection.getUniqueId('vCard'),
                iq = $iq({
                    type: 'set',
                    id: requestId
                }).cnode(buildVcard(myVcard));

            sharedData.connection.sendIQ(iq, function(data) {console.log(data);});
        },

        get : function(obj) {

            var deferred = $q.defer(),
                card = {},
                processVCard = function(data) {

                    data = data.querySelector('vCard');

                    $rootScope.$apply(function() {
                
                        if (!data) {
                            console.log('Error getting vCard');
                            deferred.reject();
                        } else {
                            card = XML.parse(data);

                            deferred.resolve(card);
                        }

                        storeCard({
                            jid : obj.jid,
                            card: card
                        });
                    });
                }
            
            vCard.get({
                jid: obj.jid,
                callback: processVCard
            });

            return deferred.promise;
        }
    }

});