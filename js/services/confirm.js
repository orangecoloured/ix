angular.module('IX.services')

.service('Confirm', function($ionicPopup) {

    return{

        show : function(obj) {
            
            var confirmPopup = $ionicPopup.confirm({
                title: obj.title || 'Confirm Popup',
                subTitle: obj.subTitle || null,
                template: obj.template || null,
                templateUrl: obj.templateUrl || null,
                cancelText: obj.cancelText || 'Cancel',
                cancelType: obj.cancelType || 'button-clear button-default',
                okText: obj.okText || 'OK',
                okType: obj.okType || 'button-clear button-royal'
            });
            
            confirmPopup.then(function(res) {
                if(res) {
                    if (obj.positiveCallback) {
                        obj.positiveCallback();                    
                    }
                } else {
                    if (obj.negativeCallback) {
                        obj.negativeCallback();
                    }
                }
            });
        }
    }
});