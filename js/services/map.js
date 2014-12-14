angular.module('IX.services')

.service('Map', function() {

    return {

        centerOnLocation : function(obj) {

            obj.map.setCenter({lat: parseFloat(obj.lat), lng: parseFloat(obj.lon)});
        },

        createMarker : function(obj) {

            return new google.maps.Marker({
                draggable: obj.draggable,
                position: obj.position,
                map: obj.map,
                title: obj.title || null
            });
        }
    }
});