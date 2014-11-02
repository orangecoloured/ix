angular.module('IX.services')

.service('Modal', function($ionicModal, $rootScope) {

    return {
        init: function($scope, obj) {

            $scope = $scope || $rootScope.$new();
            $scope.data = obj.data || {};

            var promise = $ionicModal.fromTemplateUrl('templates/modals/' + obj.template + '.html', {

                scope: $scope,
                animation: 'slide-in-right'
            }).then(function (modal) {

                $scope.modal = modal;
                return modal;
            });

            $scope.openModal = function() {
               $scope.modal.show();
            }

            $scope.closeModal = function() {
                $scope.modal.hide();
                $scope.modal.remove();
            }

            $scope.$on('$destroy', function() {
                $scope.modal.remove();
            });

            return promise;
        }
    }
});