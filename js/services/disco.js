angular.module('IX.services')

.service('Disco', function($q, $rootScope, SharedProperties, XML) {
    
    var sharedData = SharedProperties.sharedObject;

    function storeServices(obj) {

        sharedData.services[obj.type] = obj.data;
    }

    function getInfo(obj) {

        var deferred = $q.defer(),
            parse = function(data) {

                var info = XML.parse(data);

                if (info.hasOwnProperty('query')) {
                    deferred.resolve({
                        jid: obj.jid,
                        pos: obj.pos,
                        data: info
                    });
                } else {
                    deferred.reject();
                }
            },
            requestId = sharedData.connection.getUniqueId('info'),
            iq = $iq({
                type: 'get',
                to: obj.jid,
                id: requestId
            }).c('query', {
                xmlns: Strophe.NS.DISCO_INFO
            }).tree();

        sharedData.connection.sendIQ(iq, parse);

        return deferred.promise;

    }

    return{

        processServices : function(services) {

            services = services.query.item;

            var deferred = $q.defer(),
                deferres = [],
                promises = [],
                processedServices = {};

            for (var i = services.length - 1; i >= 0; i--) {
                deferres.push($q.defer());
            }

            for (var k = deferres.length - 1; k >= 0; k--) {
                promises.push(deferres[k].promise);
            }

            for (var i = services.length - 1; i >= 0; i--) {

                getInfo({
                    jid: services[i]['@attributes'].jid,
                    pos: i
                })
                .then(function(obj) {

                    processedServices[obj.jid] = {
                        jid: obj.jid,
                        info: obj.data
                    }
                    
                    deferres[obj.pos].resolve();

                }, function(info) {
                    deferred.reject();
                    console.log('Error getting the service');
                });
            }

            $q.all(promises).then(function() {

                storeServices({
                    type: 'processed',
                    data: processedServices
                });

                deferred.resolve();
            });

            return deferred.promise;
        },

        getServices : function() {

            var _this = this,
                deferred = $q.defer(),
                parse = function(data) {

                    var services = XML.parse(data);

                    $rootScope.$apply(function() {
                        storeServices({
                            type: 'clean',
                            data: services
                        });
                    });

                    if (services.query.hasOwnProperty('item')) {
                        _this.processServices(services)
                        .then(function() {
                            deferred.resolve();
                        }, function() {
                            deferred.reject();
                        });
                    } else {
                        deferred.reject();
                    }

                },
                requestId = sharedData.connection.getUniqueId('services'),
                iq = $iq({
                    type: 'get',
                    to: sharedData.connection.domain,
                    id: requestId
                }).c('query', {
                    xmlns: Strophe.NS.DISCO_ITEMS
                }).tree();

            sharedData.connection.sendIQ(iq, parse);

            return deferred.promise;

        },

        checkForService : function(obj) {

            //loop1:
            for (var key in sharedData.services.processed) {

                var featureArray = sharedData.services.processed[key].info.query.feature;

                //loop2:
                for (var i = 0; i < featureArray.length; i++) {

                    if (featureArray[i]['@attributes'].var === obj.service) {
                        console.log(obj.service);
                        return true;
                        //break loop1;
                    }
                }
            }
            return false;
        }
        
    }

});