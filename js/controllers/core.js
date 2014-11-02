angular.module('IX.controllers')

.controller('Core', function($scope, $rootScope, $location, $localStorage, $ionicSideMenuDelegate, Modal, BOSH, vCard, Receipt, Presence, Message, Chatstate, SharedProperties, Roster, Profile) {

    var sharedData = SharedProperties.sharedObject;
    $scope.connected = BOSH.checkConnection;
    $scope.unread = sharedData.unread;
    $scope.requests = sharedData.subscriptions;
    /*$scope.subscription = null;*/

    $scope.$on('refreshUnread', function() {
        $scope.unread = sharedData.unread;
    });

    $scope.$on('subscriptionRequest', function() {
        $scope.requests = sharedData.subscriptions;
    });

    $scope.getRequestName = function(obj) {
        return Profile.getName({
            jid: obj['@attributes'].from
        });
    }

    function rosterCallback(data) {
        //console.log(data);
    }

    function addContact(obj) {

        Presence.send({
            jid: obj.jid,
            type: 'subscribed'
        });

        angular.extend(obj, {
            subscription : 'from',
            callback: rosterCallback
        });

        removeSubscriptionRequest({
            jid: obj.jid
        });

        Roster.set(obj)
        .then(function(roster) {
            sharedData.roster.collection = Roster.group(sharedData.roster.clean);
            $rootScope.$broadcast('rosterRefresh');
        }, function(roster) {
            console.log('Error getting roster');
        });
    }

    function removeSubscriptionRequest(obj) {

        var subscriptionsArray = sharedData.subscriptions;
        
        for (var i = subscriptionsArray.length - 1; i >= 0; i--) {
            if (subscriptionsArray[i]['@attributes'].from == obj.jid) {
                subscriptionsArray.splice(i, 1);
            }
        }

        $scope.requests = sharedData.subscriptions;

        if (!$scope.requests.length) {
            $scope.closeModal();
            $ionicSideMenuDelegate.toggleRight();
        }
    }

    function approveSubscription(obj) {

        var jid = obj['@attributes'].from;

        if (!Roster.isInRoster({jid: jid})) {
            
            Roster.showAddPopup({
                scope: $scope,
                jid: jid,
                callback: addContact
            });
        
        } else {

            removeSubscriptionRequest({
                jid: jid
            });
            
            Presence.send({
                jid: jid,
                type: 'subscribed'
            });

            Roster.changeSubscription({
                jid: jid,
                direction: 'outgoing',
                type: 'subscribed'
            });
        }
    }

    $scope.subscriptionAction = function(obj, type) {

        if (type) {
            
            approveSubscription(obj);
        } else {
            removeSubscriptionRequest({
                jid: obj['@attributes'].from
            });
            
            Presence.send({
                jid: obj['@attributes'].from,
                type: 'unsubscribed'
            });
        }
    }

    $scope.openRequestsModal = function() {
        Modal.init($scope, {template: 'requests'}).then(function(modal) {
            modal.show();
        });
    }

    $scope.logOut = function() {

        BOSH.disconnect();
        BOSH.deleteSession();
        sharedData.connection = null;
        $location.path('/IX/index/');
        $rootScope.$broadcast('loggedOut');
    }

    function onMessage(message) {

        $scope.$apply(function(){
            Message.process(message);
        });

        return true;
    }

    function onChatstate(message) {

        $scope.$apply(function(){
            Chatstate.process(message);
        });

        return true;
    }

    function onPresence(presence) {

        $scope.$apply(function(){
            Presence.process(presence);
        });

        return true;
    }

    function onReceipt(message) {

        $scope.$apply(function(){
            Receipt.process(message);
        });

        return true;
    }

    function bindXMLOutputTrigger() {
        sharedData.connection.xmlOutput = function (elem) {
            BOSH.storeSessionData();
        }
    }

    var connectionListenerOff = $scope.$on('connected', function() {

        bindXMLOutputTrigger();
        sharedData.connection.xmlInput = function (elem) {
            console.log('INPUT');
            console.log(elem);
        }
        sharedData.connection.addHandler(onMessage, null, 'message');
        sharedData.connection.addHandler(onChatstate, Strophe.NS.CHATSTATES, 'message');
        sharedData.connection.addHandler(onReceipt, Strophe.NS.RECEIPTS, 'message');
        sharedData.connection.addHandler(onPresence, null, 'presence');
        
        Presence.send();

        Roster.get()
        .then(function(roster) {
            Roster.group(roster);
            Profile.getAll(roster);
        }, function(roster) {
            console.log('Error getting roster');
        });

        $rootScope.$broadcast('present');
        
        if (window.plugin) {
            window.plugin.backgroundMode.enable();
        }
    });
});