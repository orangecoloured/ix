angular.module('IX.controllers')

.controller('Room', function($scope, /*$rootScope, */$stateParams, SharedProperties/*, $ionicScrollDelegate, $timeout, Message, Chatstate, Profile*/) {

    var sharedData = SharedProperties.sharedObject,
        roomJid = $stateParams.jid;

    $scope.getRoomName = function() {
        return sharedData.rooms.object[roomJid]['@attributes'].name;
    }
    
    /*var sharedData = SharedProperties.sharedObject,
        pausedTimeout = null,
        inactiveTimeout = null,
        pausedSeconds = 5000,
        inactiveSeconds = 120000;

    sharedData.activeChat = $scope.userJid;

    sharedData.messagePool[$scope.userJid] = sharedData.messagePool[$scope.userJid] || {};
    sharedData.messagePool[$scope.userJid].messages = sharedData.messagePool[$scope.userJid].messages || [];

    $scope.chat = sharedData.messagePool[$scope.userJid];
    $scope.user = sharedData.profiles[$scope.userJid];
    $scope.myMessage = '';

    $scope.getName = function(obj) {
        return Profile.getName(obj);
    }

    $scope.sendMessage = function($event) {

        if ($scope.myMessage.replace(/(\r\n|\n|\r|\s)/gm,'') == '') {
            $scope.myMessage = '';
            return;
        }
        
        Message.send({
            jid: $scope.userJid,
            message: $scope.myMessage
        });

        $scope.myMessage = '';

        $timeout(function(){
            $event.target.parentElement.querySelector('textarea').focus();
        },0);

        $timeout.cancel(inactiveTimeout);
        inactiveTimeout = null;
        $timeout.cancel(pausedTimeout);
        pausedTimeout = null;
    }

    function sendInactive() {
        Chatstate.sendState({
            jid: $scope.userJid,
            state: 'inactive'
        });

        $timeout.cancel(inactiveTimeout);
        inactiveTimeout = null;
    }

    function sendPaused() {
        Chatstate.sendState({
            jid: $scope.userJid,
            state: 'paused'
        });

        $timeout.cancel(inactiveTimeout);
        inactiveTimeout = null;
        $timeout.cancel(pausedTimeout);
        pausedTimeout = null;
        inactiveTimeout = $timeout(sendInactive, inactiveSeconds);
    }

    $scope.changeState = function() {
        
        if (!pausedTimeout) {
            Chatstate.sendState({
                jid: $scope.userJid,
                state: 'composing'
            });

            pausedTimeout = $timeout(sendPaused, pausedSeconds);
            $timeout.cancel(inactiveTimeout);
            inactiveTimeout = null;
        } else {
            $timeout.cancel(pausedTimeout);
            pausedTimeout = null;
            pausedTimeout = $timeout(sendPaused, pausedSeconds);
        }
    }

    var DisableLoadListener = $scope.$on('$viewContentLoaded', function() {
        
        DisableLoadListener();
        $ionicScrollDelegate.scrollBottom(false);
    });

    $scope.$on('incomingMessage', function() {
        $scope.chat = sharedData.messagePool[$scope.userJid];
        $ionicScrollDelegate.scrollBottom(true);
    });

    sharedData.messagePool[$scope.userJid].unread = false;
    Message.refreshUnread();
    Chatstate.sendState({
        jid: $scope.userJid,
        state: 'active'
    });

    $scope.$on('$destroy', function() {

        $timeout.cancel(inactiveTimeout);
        inactiveTimeout = null;
        $timeout.cancel(pausedTimeout);
        pausedTimeout = null;
        
        Chatstate.sendState({
            jid: $scope.userJid,
            state: 'inactive'
        });
    });

    $timeout(function(){
        document.querySelector('textarea').focus();
    },0);*/
});