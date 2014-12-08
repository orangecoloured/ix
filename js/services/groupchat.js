angular.module('IX.services')

.service('Groupchat', function($q, $rootScope, SharedProperties, XML, Disco) {
    
    var sharedData = SharedProperties.sharedObject;

    function storeRooms(obj) {

        sharedData.rooms[obj.type] = obj.data;
    }

    return{

        makeObject : function (rooms) {

            var roomsObject = {};

            for (var i = rooms.length - 1; i >= 0; i--) {

                roomsObject[rooms[i]['@attributes'].jid] = rooms[i];
            }

            storeRooms({
                type: 'object',
                data: roomsObject
            });
        },

        process : function (rooms) {

            rooms = rooms.query.item;

            for (var i = rooms.length - 1; i >= 0; i--) {
                var paticipantsNumber = {
                        start: rooms[i]['@attributes'].name.lastIndexOf('(') + 1,
                        end: rooms[i]['@attributes'].name.lastIndexOf(')')
                    },
                    participants = rooms[i]['@attributes'].name.substr(paticipantsNumber.start, paticipantsNumber.end - paticipantsNumber.start),
                    lastOccurrance = rooms[i]['@attributes'].name.lastIndexOf(' (' + participants + ')');
                
                rooms[i]['@attributes'].participants = participants;
                rooms[i]['@attributes'].name = rooms[i]['@attributes'].name.substring(0, lastOccurrance);
            }
            
            storeRooms({
                type: 'array',
                data: rooms
            });

            this.makeObject(rooms);
        },

        getRooms : function() {

            var deferred = $q.defer(),
                parse = function(data) {

                    var rooms = XML.parse(data);

                    $rootScope.$apply(function() {
                
                        storeRooms({
                            type: 'clean',
                            data: rooms
                        });
                        
                        if (rooms.query.hasOwnProperty('item')) {
                            deferred.resolve(rooms);
                        } else {
                            deferred.reject();
                        }

                    });
                },
                requestId = sharedData.connection.getUniqueId('rooms'),
                iq = $iq({
                    type: 'get',
                    to: 'conference.' + sharedData.connection.domain,
                    id: requestId
                }).c('query', {
                    xmlns: Strophe.NS.DISCO_ITEMS
                }).tree();

            sharedData.connection.sendIQ(iq, parse);

            return deferred.promise;
        },

        init : function() {

            var _this = this;

            if(Disco.checkForService({service: Strophe.NS.MUC})) {
                this.getRooms()
                .then(function(rooms) {
                    _this.process(rooms);
                }, function(rooms) {
                    console.log('Error getting rooms');
                });
            }


        }
        
    }

});