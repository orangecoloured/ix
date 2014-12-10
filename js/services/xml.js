angular.module('IX.services')

.service('XML', function(SharedProperties) {

    var sharedData = SharedProperties.sharedObject;

    return{

        parse: function(xml) {

            var obj = {}

            if (xml.nodeType == 1) { // Element
                
                // Process attributes
                if (xml.attributes.length > 0) {
                
                    obj['@attributes'] = {}
                    
                    for (var j = xml.attributes.length - 1; j >= 0; j--) {
                        var attribute = xml.attributes.item(j);
                        obj['@attributes'][attribute.nodeName.toLowerCase()] = attribute.value || attribute.nodeValue;
                    }
                }
            } else if (xml.nodeType == 3) { // Text

                obj = xml.value || xml.nodeValue;

                if (!obj.trim().length) {
                    obj = '';
                }
            }

            // Process children
            if (xml.hasChildNodes()) {
                
                for (var i = 0; i < xml.childNodes.length; i++) {
                    var item = xml.childNodes.item(i),
                        nodeName = item.nodeName.toLowerCase();

                    if (typeof(obj[nodeName]) == 'undefined') {
                    
                        obj[nodeName] = this.parse(item);
                    } else {

                        if (typeof(obj[nodeName].push) == 'undefined') {
                    
                            var old = obj[nodeName];
                            obj[nodeName] = [];
                            obj[nodeName].push(old);
                        }
                    
                        obj[nodeName].push(this.parse(item));
                    }
                }
            }

            return obj;
        }

    }
});