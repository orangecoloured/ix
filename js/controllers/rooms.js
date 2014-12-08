angular.module('IX.controllers')

.controller('Rooms', function($scope, $location, SharedProperties/*$scope, Roster, Chatstate, Profile, ActionSheet, Confirm*/) {

    var sharedData = SharedProperties.sharedObject;

    $scope.rooms = [];

    $scope.getName = function(obj){
        return obj['@attributes'].name;
    }

    $scope.getParticipants = function(obj){
        return obj['@attributes'].participants;
    }

    $scope.clickRoomsItem = function(item) {
        $location.path('/IX/room/' + item['@attributes'].jid);
    }

    function getRooms() {

        $scope.rooms = sharedData.rooms.array;
        console.log($scope.rooms);
    }

    getRooms();

    /*$scope.chats = [];

    $scope.getChat = function(item) {
        $location.path('/IX/chat/' + item.jid);
    }

    $scope.getName = function(obj){
        return Profile.getName(obj);
    }

    function rosterCallback(data) {
        //console.log(data);
        //$scope.roster = sharedData.roster.collection;
    }

    function addContact(obj) {

        angular.extend(obj, {
            callback: rosterCallback
        });

        Roster.set(obj)
        .then(function(roster) {
            sharedData.roster.collection = Roster.group(sharedData.roster.clean);
        }, function(roster) {
            console.log('Error getting roster');
        });
    }

    function showAddContact(obj) {

        Roster.showAddPopup({
            scope: $scope,
            jid: obj.jid,
            callback: addContact
        });
    }

    $scope.holdChatsItem =function(obj) {

        var contactName = Profile.getName({jid: obj.jid}),
            buttons = [];

        if (!Roster.isInRoster({jid: obj.jid})) {

            buttons.push({
                text: 'Add to Contacts',
                callback: function() {
                    showAddContact(obj);
                }
            });
        }

        ActionSheet.show({
            titleText: contactName,
            buttons: buttons.length ? buttons : null,
            destructiveText: 'Purge Chat',
            destructiveAction: function() {
                Confirm.show({
                    title: 'Purge Chat',
                    template: 'Do you want to purge chat with <b>' + contactName + '</b>?',
                    cancelText: 'No',
                    cancelType: 'button-clear button-default',
                    okText: 'Yes',
                    okType: 'button-clear button-assertive',
                    positiveCallback: function() {
                        purgeChat(obj);
                    }
                });
            }
        });
    }

    function purgeChat(obj) {

        Chatstate.sendState({
            jid: obj.jid,
            state: 'gone'
        });

        delete sharedData.messagePool[obj.jid];
        getChats();
    }

    function getChats() {

        var chatsArr = [];
        
        for (var key in sharedData.messagePool) {
            chatsArr.push({
                jid: key,
                unread: sharedData.messagePool[key].unread
            });
        }

        $scope.chats = chatsArr;
    }

    getChats();

    $scope.$on('refreshUnread', function() {
        getChats();
    });*/
});