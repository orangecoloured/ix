angular.module('IX.services', [])

.service('SharedProperties', function() {
    return{
        sharedObject: {}
    }
})

.service('base64', function(SharedProperties) {

    var sharedData = SharedProperties.sharedObject;

    function removeLineBreaks(string) {
        return string.replace(/(\r\n|\n|\r)/gm,'');
    }

    return{

        encode : function() {},

        decode : function(string) {},

        checkIfArray : function(str) {
            if (str instanceof Array) {
                return str.join('');
            } else {
                return str;
            }
        },

        imgSrc : function(obj) {

            var profile = sharedData.profiles[obj.jid];

            if (!profile) {
                return sharedData.defaultPhoto;
            }
            
            var src = null;

            if (profile.photo) {
                var photo = profile.photo;

                if (photo.type) {
                    src = 'data:' + photo.type['#text'] + ';base64,' + this.checkIfArray(photo.binval['#text']);
                } else {
                    src = photo.extval['#text'];
                }
            } else {
                src = sharedData.defaultPhoto;
            }

            src = removeLineBreaks(src);

            return src;
        }

    }
});