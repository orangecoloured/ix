angular.module('IX.services')

.service('ActionSheet', function($ionicActionSheet) {

    return{

        show : function(obj) {

            // Show the action sheet
            var hideSheet = $ionicActionSheet.show({
                buttons: obj.buttons,
                destructiveText: obj.destructiveText,
                titleText: obj.titleText,
                cancelText: obj.cancelText || 'Cancel',
                cancel: obj.cancel || function() {
                    //cancel code
                },
                destructiveButtonClicked : function() {
                    obj.destructiveAction();
                    return true;
                },
                buttonClicked: function(index, buttonObject) {
                    buttonObject.callback();
                    return true;
                }
            });
        }
    }
});