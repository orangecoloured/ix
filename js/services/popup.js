angular.module('IX.services')

.service('Popup', function($ionicPopup) {

    return{

        show : function(obj) {

            var popup = $ionicPopup.show({
                title: obj.title || 'Popup',
                subTitle: obj.subTitle || null,
                template: obj.template || null,
                templateUrl: obj.templateUrl || null,
                scope: obj.scope || null,
                buttons: obj.buttons
            });
            
            popup.then(function(res) {
                if (typeof(res) == 'function') {
                    res();
                }
            });
        }
    }

});