angular.module('IX.services')

.service('Loading', function($ionicLoading, SharedProperties){

    var additionalStrings = {
        login: 'Connecting',
        standard: 'Processing'
    }

    function getString(obj) {

        if (obj) {
            return additionalStrings[obj.message];
        } else {
            return additionalStrings.standard;
        }
    }

    return {
        show: function(obj) {

            obj = obj || false;

            $ionicLoading.show({
                template: '<i class="ion-loading-b"></i> ' + getString(obj)
            });
        },

        hide: function() {
            $ionicLoading.hide();
        }
    }
});