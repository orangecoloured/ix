angular.module('IX.controllers')

.controller('Profile', function($scope, $location, $stateParams, Roster, Profile, Presence, SharedProperties, base64) {

    var sharedData = SharedProperties.sharedObject;

    $scope.userJid = $stateParams.jid;
    $scope.profile = sharedData.profiles[$scope.userJid];

    $scope.getName = function(obj) {
        return Profile.getName(obj);
    }

    $scope.getPresence = function() {
        return Presence.getStatus({
            '@attributes': {
                jid: $scope.userJid
            }
        });
    }

    $scope.getSubscriptionType = function(obj) {

        var subscription = Roster.getSubscription(obj);

        switch (subscription) {
            case 'to': {
                return 'ion-arrow-up-c';
            }
            case 'from': {
                return 'ion-arrow-down-c';
            }
            case 'none': {
                return 'ion-close-round';
            }
            default: {
                return 'bothSubscribed';
            }
        }
    }

    $scope.getPhoto = function(obj) {
        return base64.imgSrc(obj);
    }

    $scope.refresh = function() {
        getProfile();
    }

    $scope.getChat = function(profile) {
        $location.path('/IX/chat/' + profile.jid);
    }

    //$scope.refresh();
});