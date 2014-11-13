angular.module('IX.services')

.service('CropResize', function($rootScope, SharedProperties) {

    var sharedData = SharedProperties.sharedObject,
        data = {
        container: null,
        component: null,
        orig_src: new Image(),
        image_target: null,
        event_state: {},
        min_width: null, //image_target.width,
        min_height: null, //image_target.height,
        max_width: 4096,
        max_height: 4096,
        resize_canvas: document.createElement('canvas')
    }
    
    function saveEventState(e) {
        data.event_state.container_width = data.container.clientWidth;
        data.event_state.container_height = data.container.clientHeight;
        data.event_state.container_left = data.container.offsetLeft;
        data.event_state.container_top = data.container.offsetTop;
        data.event_state.mouse_x = (e.clientX || e.pageX) + window.scrollX;
        data.event_state.mouse_y = (e.clientY || e.pageY) + window.scrollY;
        data.event_state.event = e;
    }

    function resizeImage(width, height) {
        data.resize_canvas.width = width;
        data.resize_canvas.height = height;
        data.resize_canvas.getContext('2d').drawImage(data.orig_src, 0, 0, width, height);
        /*data.resize_canvas.getContext('2d').translate(data.resize_canvas.width/2,data.resize_canvas.height/2);
        data.resize_canvas.getContext('2d').rotate(90*Math.PI/180);
        data.resize_canvas.getContext('2d').drawImage(orig_src, -width/2, -height/2, width, height);*/
        data.image_target.src = data.resize_canvas.toDataURL('image/png');
    }
    
    function resizing(e) {
        var mouse = {},
            width,
            height,
            left,
            top;

        mouse.x = (e.clientX || e.pageX) + window.scrollX - data.component.getBoundingClientRect().left;
        mouse.y = (e.clientY || e.pageY) + window.scrollY - data.component.getBoundingClientRect().top;

        if (data.event_state.event.target.classList.contains('resize-handle-se')) {
            width = mouse.x - data.event_state.container_left;
            height = mouse.y - data.event_state.container_top;
            left = data.event_state.container_left;
            top = data.event_state.container_top;
        } else if (data.event_state.event.target.classList.contains('resize-handle-sw')) {
            width = data.event_state.container_width - (mouse.x - data.event_state.container_left);
            height = mouse.y - data.event_state.container_top;
            left = mouse.x;
            top = data.event_state.container_top;
        } else if (data.event_state.event.target.classList.contains('resize-handle-nw')) {
            width = data.event_state.container_width - (mouse.x - data.event_state.container_left);
            height = data.event_state.container_height - (mouse.y - data.event_state.container_top);
            left = mouse.x;
            top = mouse.y - ((width / data.orig_src.width * data.orig_src.height) - height);
        } else if (data.event_state.event.target.classList.contains('resize-handle-ne')) {
            width = mouse.x - data.event_state.container_left;
            height = data.event_state.container_height - (mouse.y - data.event_state.container_top);
            left = data.event_state.container_left;
            top = mouse.y - ((width / data.orig_src.width * data.orig_src.height) - height);
        }

        height = width / data.orig_src.width * data.orig_src.height;

        if (width > data.min_width && height > data.min_height && width < data.max_width && height < data.max_height) {
            resizeImage(width, height);
            data.container.style.left = left + 'px';
            data.container.style.top = top + 'px';
        }
    }

    function startResize(e) {
        e = e || window.event;
        e.preventDefault();
        e.cancelBubble = true;
        
        saveEventState(e);
        document.addEventListener('mousemove', resizing);
        document.addEventListener('mouseup', endResize);
    }

    function endResize(e) {
        e.preventDefault();
        document.removeEventListener('mousemove', resizing);
        document.removeEventListener('mouseup', endResize);
    }

    function moving(e) {
        e = e || window.event;
        e.preventDefault();
        e.cancelBubble = true;
        
        var mouse={}
        
        mouse.x = (e.clientX || e.pageX) + window.scrollX;
        mouse.y = (e.clientY || e.pageY) + window.scrollY;
        
        data.container.style.left = mouse.x - (data.event_state.mouse_x - data.event_state.container_left) + 'px';
        data.container.style.top = mouse.y - (data.event_state.mouse_y - data.event_state.container_top) + 'px';
    }

    function startMoving(e) {
        e = e || window.event;
        e.preventDefault();
        e.cancelBubble = true;
        
        saveEventState(e);
        document.addEventListener('mousemove', moving);
        document.addEventListener('mouseup', endMoving);
    }

    function endMoving(e) {
        e.preventDefault();
    
        document.removeEventListener('mousemove', moving);
        document.removeEventListener('mouseup', endMoving);
    }

    function uploadPhoto(obj) {
        $rootScope.$apply(function(){
            sharedData.profiles[sharedData.myJid].photo = {
                type:{
                    '#text': obj.type || 'image/jpeg'
                },
                binval: {
                    '#text': obj.base64 || obj
                }
            }
        });

        data.scope.closeModal();
    }
    
    function crop() {
        var overlay = document.getElementsByClassName('overlay')[0],
            crop_canvas,
            left = overlay.offsetLeft - data.container.offsetLeft,
            top = overlay.offsetTop - data.container.offsetTop,
            width = overlay.clientWidth,
            height = overlay.clientHeight;
            
        crop_canvas = document.createElement('canvas');
        crop_canvas.width = width;
        crop_canvas.height = height;

        crop_canvas.getContext('2d').drawImage(data.image_target, left, top, width, height, 0, 0, width, height);
        //window.open(crop_canvas.toDataURL('image/jpg'));
        uploadPhoto({
            type: 'image/jpg',
            base64: crop_canvas.toDataURL('image/jpg').split(',')[1]
        });
    }
    
    return {

        init : function(obj) {

            data.scope = obj.scope;

            var cropResizeElement = document.getElementsByClassName('cropResize');
            data.component = cropResizeElement[cropResizeElement.length - 1];

            data.image_target = new Image();
            data.image_target.src = obj.dataURL;
            data.image_target.classList.add('resize-image');

            data.orig_src.src = data.image_target.src;

            var imageElement = document.createElement('div');
            imageElement.classList.add('resize-container');
            imageElement.innerHTML = '<i class="icon ion-arrow-resize dark resize-handle resize-handle-nw"></i><i class="icon ion-arrow-resize dark resize-handle resize-handle-ne"></i>' + data.image_target.outerHTML + '<i class="icon ion-arrow-resize dark resize-handle resize-handle-se"></i><i class="icon ion-arrow-resize dark resize-handle resize-handle-sw"></i>';

            data.component.appendChild(imageElement);
            data.image_target = data.component.getElementsByClassName('resize-image')[0];
            data.container = data.component.getElementsByClassName('resize-container')[0];

            var resizeHandlers = data.container.getElementsByClassName('resize-handle');
            for (i=0; i<resizeHandlers.length; i++) {
                resizeHandlers[i].addEventListener('mousedown', startResize, false);
            }
    
            data.container.addEventListener('mousedown', startMoving);
            data.component.getElementsByClassName('js-crop')[0].addEventListener('click', crop);
        }
    }
});