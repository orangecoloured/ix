angular.module('IX.controllers', [])

.controller('IX', function($scope) {

    // Create the login modal that we will use later
    /*$ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });*/

    // Triggered in the login modal to close it
    /*$scope.closeLogin = function() {
        $scope.modal.hide();
    }*/

    // Open the login modal
    /*$scope.login = function() {
        $scope.modal.show();
    }*/
})

.controller('Bar', function($scope, $ionicSideMenuDelegate, SharedProperties) {

    var sharedData = SharedProperties.sharedObject;
    
    $scope.unread = sharedData.unread;

    $scope.$on('refreshUnread', function() {
        $scope.unread = sharedData.unread;
    });

    $scope.toggleRight = function() {
        $ionicSideMenuDelegate.toggleRight();
    }

});