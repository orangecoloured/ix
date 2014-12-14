angular.module('IX.controllers')

.controller('Profile', function($scope, $location, $stateParams, Roster, Profile, Presence, SharedProperties, Modal, Map, base64) {

    var sharedData = SharedProperties.sharedObject;

    $scope.userJid = $stateParams.jid;
    $scope.profile = sharedData.profiles[$scope.userJid];
console.log($scope.profile);
    $scope.getName = function(obj) {
        return Profile.getName(obj);
    }

    $scope.mapCreated = function(map) {
        
        $scope.map = map;
        
        if ($scope.profile.geo && $scope.profile.geo.lat['#text'] && $scope.profile.geo.lon['#text']) {
            
            setTimeout(function(){

                Map.centerOnLocation({
                    map: map,
                    lat: parseFloat($scope.profile.geo.lat['#text']),
                    lon: parseFloat($scope.profile.geo.lon['#text'])
                });
                
                $scope.userMarker = Map.createMarker({
                    draggable: false,
                    position: $scope.map.getCenter(),
                    map: $scope.map
                });
            }, 100);
        }
    }

    $scope.openMap = function() {
        Modal.init($scope, {template: 'profileMap'}).then(function(modal) {
            modal.show();
        });
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