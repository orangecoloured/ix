angular.module('IX.services')

.service('Webcam', function($rootScope, SharedProperties) {

    var sharedData = SharedProperties.sharedObject,
        data = {
            streaming: false,
            video: null,
            canvas: null,
            width: 0,
            height: 160
        }

    function initWebcam() {

        data.videoWrapper = document.getElementsByClassName('videoWrapper')[0];
        data.pictureWrapper = document.getElementsByClassName('pictureWrapper')[0];
        data.video = document.querySelector('#video');
        data.canvas = document.querySelector('#canvas');

        navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
        navigator.getMedia(
            {
                video: true,
                audio: false
            },
            function(stream) {
                if (navigator.mozGetUserMedia) {
                    data.video.mozSrcObject = stream;
                } else {
                    var vendorURL = window.URL || window.webkitURL;
                    data.video.src = vendorURL.createObjectURL(stream);
                }
                data.video.play();
            },
            function(err) {
                console.log("An error occured!");
                console.log(err);
            }
        );

        data.video.addEventListener('canplay', function(event) {
            if (!data.streaming) {
                data.width = data.video.videoWidth / (data.video.videoHeight/data.height);
                data.video.setAttribute('width', data.width);
                data.video.setAttribute('height', data.height);
                data.video.style.margin = '0 0 0 -' + ((data.width - 160) / 2) + 'px' ;
                data.canvas.setAttribute('width', 160);
                data.canvas.setAttribute('height', data.height);
                data.streaming = true;
            }
        }, false);
    }
    
    return {

        init : function(obj) {

            data.scope = obj.scope;

            initWebcam();

        },

        takePicture : function () {
            data.canvas.width = 160;
            data.canvas.height = data.height;
            /*data.canvas.getContext('2d').translate(data.canvas.width, 0);
            data.canvas.getContext('2d').scale(-1, 1);*/
            data.canvas.getContext('2d').drawImage(data.video, -((data.width - 160) / 2), 0, data.width, data.height);
            /*data.photo.setAttribute('src', data.canvas.toDataURL('image/jpeg'));*/
            data.videoWrapper.classList.add('pictureTaken');
            data.pictureWrapper.classList.add('pictureTaken');
        },

        retakePicture : function() {
            data.videoWrapper.classList.remove('pictureTaken');
            data.pictureWrapper.classList.remove('pictureTaken');
        },

        acceptPicture : function() {
            sharedData.profiles[sharedData.myJid].photo = {
                type:{
                    '#text': 'image/jpeg'
                },
                binval: {
                    '#text': data.canvas.toDataURL('image/jpeg').split(',')[1]
                }
            }

            data.scope.closeModal();
        }
    }
});