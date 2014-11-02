angular.module('IX.services')

.service('Loading', function($ionicLoading, SharedProperties){

    return {
        show: function(obj) {
            $ionicLoading.show({
                template: '<i class="ion-loading-b"></i> ' + (obj.login ? 'Connecting' : 'Processing')
            });
        },

        hide: function() {
            $ionicLoading.hide();
        }
    }
});