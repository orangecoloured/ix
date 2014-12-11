angular.module('IX.controllers')

.controller('Index', function($scope, $rootScope, $ionicPlatform, Modal, ActionSheet, Popup, Confirm, Loading, BOSH, base64, SharedProperties, Profile, Presence, CropResize, Webcam) {

    /*$scope.mapCreated = function(map) {
        $scope.map = map;
    }*/

    var myMarker = null,
        dragListener = null;

    // Sets the map on all markers in the array.
    function setAllMap(map) {
        for (var i = markers.length - 1; i >= 0; i--) {
            markers[i].setMap(map);
        }
    }

    // Removes the markers from the map, but keeps them in the array.
    function clearMarkers() {
        setAllMap(null);
    }

    // Shows any markers currently in the array.
    function showMarkers() {
        setAllMap(map);
    }

    // Deletes all markers in the array by removing references to them.
    function deleteMarkers() {
        clearMarkers();
        markers = [];
    }

    function setMarkerDragListener(marker) {

        if (dragListener) {
            google.maps.event.removeListener(dragListener);
        }
        
        dragListener = google.maps.event.addListener(marker, 'dragend', function(event) {
            $scope.setGeolocation({
                lat: event.latLng.lat().toFixed(6),
                lon: event.latLng.lng().toFixed(6)
            });
        });
    }

    function placeMarker(location) {
        if (myMarker) {
            myMarker.setMap(null);
        }
        
        myMarker = new google.maps.Marker({
            /*id: '123',*/
            position: location,
            draggable: true,
            /*animation: google.maps.Animation.DROP,*/
            map: $scope.map/*,
            title: 'FUCK'*/
        });

        console.log(location);

        $scope.setGeolocation({
            lat: location.lat().toFixed(6),
            lon: location.lng().toFixed(6)
        });

        //markers.push(marker);

        infowindow.open($scope.map, myMarker);
        /*$scope.map.setCenter(location);*/

        setMarkerDragListener(myMarker);
    }

    var infowindow = new google.maps.InfoWindow({
        content: 'Hello',
        size: new google.maps.Size(50,50)
    });

    $scope.mapCreated = function(map) {
        
        setTimeout(function(){
            $scope.map = map;

            google.maps.event.addListener($scope.map, 'click', function(event) {
                placeMarker(event.latLng);
            });

            if ($scope.profile.geo && $scope.profile.geo.lat['#text'] && $scope.profile.geo.lon['#text']) {
                /*console.log($scope.profile.geo.lat['#text']);
                console.log($scope.profile.geo.lon['#text']);
                console.log(parseFloat($scope.profile.geo.lat['#text']));
                console.log(parseFloat($scope.profile.geo.lon['#text']));*/
                $scope.map.setCenter({lat: parseFloat($scope.profile.geo.lat['#text']), lng: parseFloat($scope.profile.geo.lon['#text'])});
                /*google.maps.event.trigger($scope.map, 'resize');*/
                myMarker = new google.maps.Marker({
                    draggable: true,
                    position: $scope.map.getCenter(),
                    map: $scope.map,
                    title: 'Click to zoom'
                });
                setMarkerDragListener(myMarker);
            }
        }, 100);
    }

    $scope.centerOnMe = function () {
        /*deleteMarkers();

        return;*/
        console.log("Centering");
        if (!$scope.map) {
            return;
        }

        navigator.geolocation.getCurrentPosition(function (pos) {
            $scope.setGeolocation({
                lat: pos.coords.latitude.toFixed(6),
                lon: pos.coords.longitude.toFixed(6)
            });

            if (myMarker) {
                myMarker.setMap(null);
            }

            console.log('Got pos', pos);
            console.log($scope.profile);
            $scope.map.setCenter({lat: pos.coords.latitude, lng: pos.coords.longitude});
            myMarker = new google.maps.Marker({
                draggable: true,
                position: $scope.map.getCenter(),
                map: $scope.map,
                title: 'Click to zoom'
            });

            setMarkerDragListener(myMarker);
        }, function (error) {
            alert('Unable to get location: ' + error.message);
        }, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 30000
        });
    }

    /* FIX IT ^ */

    var sharedData = SharedProperties.sharedObject;

    $scope.loginData = {
        url: '',
        jid: '',
        password: ''
    }
    $scope.connected = BOSH.checkConnection;
    $scope.myJid = sharedData.myJid;
    $scope.profile = sharedData.profiles[sharedData.myJid];

    $scope.Title = $scope.connected() ? $scope.myJid : 'IX';

    $scope.selfPresence = sharedData.selfPresence;
    
    $scope.statuses = [
        {
            value: 'online',
            name: 'Online'
        },
        {
            value: 'chat',
            name: 'Chatty'
        },
        {
            value: 'away',
            name: 'Away'
        },
        {
            value: 'xa',
            name: 'Extended Away'
        },
        {
            value: 'dnd',
            name: 'Do Not Disturb'
        }
    ];

    $scope.setGeolocation = function(obj) {
        $scope.profile.geo = {
            lat: {
                '#text': obj.lat
            },
            lon: {
                '#text': obj.lon
            }
        }
    }

    $scope.getSelfPresence = function() {
        return Presence.getStatus({self: true});
    }

    $scope.updatePresence = function() {

        switch ($scope.selfPresence.show) {
            case 'dnd':
            case 'chat': {
                $scope.selfPresence.priority = 1;
                break;
            }
            case 'away': {
                $scope.selfPresence.priority = 3;
                break;
            }
            case 'xa': {
                $scope.selfPresence.priority = 4;
                break;
            }
            case 'online':
            default: {
                $scope.selfPresence.priority = 2;
            }
        }

        Presence.send($scope.selfPresence);
    }

    function statusTextPopup() {

        Popup.show({
            title: 'Status Text',
            subTitle: 'Enter your status text',
            template: '<textarea ng-model="selfPresence.status" placeholder="Status Text"></textarea>',
            scope: $scope,
            buttons: [
                { 
                    text: 'Cancel',
                    type: 'button-clear button-assertive'
                },
                {
                    text: 'Save',
                    type: 'button-clear button-royal',
                    onTap: function(e) {
                        if (!$scope.selfPresence.status) {
                            e.preventDefault();
                        } else {
                            return function() {
                                $scope.updatePresence();
                            }
                        }
                    }
                }
            ]
        });
    }

    function removeProfilePicture() {
        delete sharedData.profiles[sharedData.myJid].photo;
    }

    function getPictureFromPhone(obj) {

        navigator.camera.getPicture(
            uploadPhoto,
            function(message) { alert('get picture failed'); },
            {
                quality: 80,
                destinationType: navigator.camera.DestinationType.DATA_URL,
                sourceType: navigator.camera.PictureSourceType[obj.sourceType],
                allowEdit: true,
                encodingType: navigator.camera.EncodingType.JPEG,
                targetWidth: obj.targetWidth || null,
                targetHeight: obj.targetHeight || null,
                mediaType: navigator.camera.MediaType.PICTURE,
                correctOrientation: false,
                saveToPhotoAlbum: false,
                cameraDirection: navigator.camera.Direction.FRONT
            }
        );
    }

    function usePcCamera() {
        Modal.init($scope, {template: 'webcam'}).then(function(modal) {
            modal.show();
            Webcam.init({
                scope: $scope
            });
        });
    }

    $scope.takeWebcamPhoto = function() {
        Webcam.takePicture();
    }

    $scope.acceptWebcamPhoto = function() {
        Webcam.acceptPicture();
    }

    $scope.retakeWebcamPhoto = function() {
        Webcam.retakePicture();
    }

    function uploadPhoto(obj) {
        $scope.$apply(function(){
            sharedData.profiles[sharedData.myJid].photo = {
                type:{
                    '#text': obj.type || 'image/jpeg'
                },
                binval: {
                    '#text': obj.base64 || obj
                }
            }
        });
    }

    $scope.checkUploadedPcPicture = function() {

        var input = $scope.pictureInput;

        if (input.files && input.files[0]) {
            var file = input.files[0],
                reader = new FileReader();

            reader.onloadend = function (e) {
                Modal.init($scope, {template: 'cropResize'}).then(function(modal) {
                    modal.show();
                    CropResize.init({
                        scope: $scope,
                        dataURL: e.target.result
                    });
                });
                /*uploadPhoto({
                    type: file.type,
                    base64: e.target.result.split(',')[1]
                });*/
                console.log(e.target);
            }

            console.log(file);
            
            if (file.type.indexOf('image') > -1) {
                reader.readAsDataURL(file);
                $scope.pictureInput = null;
            }
        }
    }

    function uploadPC() {
        var body = document.getElementsByTagName('body')[0];
        $scope.pictureInput = document.createElement('input');

        $scope.pictureInput.type = 'file';
        $scope.pictureInput.onchange = $scope.checkUploadedPcPicture;
        
        $scope.pictureInput.click();
    }

    $scope.avatarOptions = function() {

        var buttons = [
            {
                text: 'Upload',
                callback: function() {

                    if(window.cordova) {
                        getPictureFromPhone({
                            targetWidth: 320,
                            targetHeight: 320,
                            sourceType: 'PHOTOLIBRARY'
                        });
                    } else {
                        uploadPC();
                    }
                }
            },
            {
                text: 'Set Link',
                callback: function() {
                    console.log('LINK');
                }
            },
            {
                text: 'Use Camera',
                callback: function() {
                    if(window.cordova) {
                        getPictureFromPhone({
                            targetWidth: 320,
                            targetHeight: 320,
                            sourceType: 'CAMERA'
                        });
                    } else {
                        usePcCamera();
                    }
                }
            }
        ];

        ActionSheet.show({
            titleText: 'Profile Picture',
            buttons: buttons,
            destructiveText: 'Remove',
            destructiveAction: function() {
                Confirm.show({
                    title: 'Remove Profile Picture',
                    template: 'Do you want to remove your profile picture?',
                    cancelText: 'No',
                    cancelType: 'button-clear button-default',
                    okText: 'Yes',
                    okType: 'button-clear button-assertive',
                    positiveCallback: function() {
                        removeProfilePicture();
                    }
                });
            }
        });
    }

    $scope.changeStatusText = function() {

        statusTextPopup();
    }

    $scope.getPhoto = function(obj) {
        return base64.imgSrc(obj);
    }

    $scope.openLogin = function() {
        if(window.Connection) {
            if(navigator.connection.type == Connection.NONE) {
                Modal.init($scope, {template: 'login'}).then(function(modal) {
                    modal.show();
                });
            }
        } else {
            Modal.init($scope, {template: 'login'}).then(function(modal) {
                modal.show();
            });
        }
    }

    $scope.openMap = function() {
        Modal.init($scope, {template: 'map'}).then(function(modal) {
            modal.show();
        });
    }

    var presentListenerOff = $scope.$on('present', function(){

        getProfile();
    });

    $scope.setProfile = function() {
        Profile.set($scope.profile);
    }

    function getProfile() {
        Profile.get({jid: sharedData.myJid})
        .then(function(card) {
            $scope.profile = card;
            console.log($scope.profile);
            loggedIn();
        }, function(card) {
            $scope.profile = card;
            loggedIn();
        });
    }

    function loggedIn() {

        $scope.myJid = sharedData.myJid;
        $scope.Title = $scope.myJid;

        if ($scope.closeModal) {
            $scope.closeModal();
        }
        Loading.hide();
    }

    $scope.login = function() {

        Loading.show({
            login: true
        });

        sharedData.myJid = $scope.loginData.jid;
        
        BOSH.connect($scope.loginData);
    }

    function showQuitSheet() {
        ActionSheet.show({
            titleText: 'Quit IX?',
            destructiveText: 'Quit',
            destructiveAction: function() {
                ionic.Platform.exitApp();
            }
        });
    }

    if (!$scope.connected() && BOSH.hasPreviousSession()) {
        ActionSheet.show({
            titleText: 'Restore Previous Session?',
            buttons: [
                {
                    text: 'Yes',
                    callback: function() {
                        Loading.show({
                            login: true
                        });
                        
                        SharedProperties.sharedObject.myJid = BOSH.getMyJid({bare: true});
                        
                        BOSH.attach();

                    }
                }
            ],
            destructiveText: ' No',
            destructiveAction: BOSH.deleteSession
        });
    }
    
    var quitListener = $ionicPlatform.registerBackButtonAction(function(e) {

        /*e.preventDefault();*/

        if (!$scope.connected()) {
            showQuitSheet();
            return false;
        }
    }, 100);

    $scope.$on('$destroy', quitListener);
    $scope.$on('loggedOut', function() {
        $scope.Title = 'IX';
    });
});