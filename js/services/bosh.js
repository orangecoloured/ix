angular.module('IX.services')

.service('BOSH', function($rootScope, $localStorage, SharedProperties) {
    
    var sharedData = SharedProperties.sharedObject;
    
    return{

        getMyJid : function(obj) {

            var jid = sharedData.connection ? (sharedData.connection.jid || sharedData.connection._proto.jid) : $localStorage.session.jid;

            if (obj.bare) {
                return jid.split('/')[0];
            } else {
                return jid;
            }
        },

        hasPreviousSession : function() {
            if ($localStorage.session) {
                return true;
            } else {
                return false;
            }
        },

        setSession : function() {
            $localStorage.session = {};
            $localStorage.session.url = sharedData.connection.service;
            $localStorage.session.jid = sharedData.connection.jid || sharedData.connection._proto.jid;
            $localStorage.session.sid = sharedData.connection.sid || sharedData.connection._proto.sid;
            $localStorage.session.rid = sharedData.connection.rid || sharedData.connection._proto.rid;
        },

        deleteSession : function() {
            $localStorage.session = null;
        },

        storeSessionData : function() {
            if (sharedData.connection) {
                this.setSession();
            } else {
                this.deleteSession();
            }
        },

        attach : function() {

            sharedData.connection = new Strophe.Connection($localStorage.session.url);
            sharedData.connection.attach($localStorage.session.jid, $localStorage.session.sid, $localStorage.session.rid, this.checkStatus);
        },

        connect : function(obj) {

            sharedData.connection = new Strophe.Connection(obj.url);
            sharedData.connection.connect(obj.jid + sharedData.resource, obj.password, this.checkStatus);
        },

        disconnect : function() {

            sharedData.connection.flush();
            sharedData.connection.options.sync = true;
            sharedData.connection.disconnect();
        },

        checkConnection : function () {
            return sharedData.connection != null ? sharedData.connection.connected : false;
        },

        checkStatus : function(status) {

            switch (status) {
                case Strophe.Status.CONNECTING:
                    sharedData.connectionStatus = 'Connecting';
                    break;
                case Strophe.Status.CONNECTED:
                    $rootScope.$broadcast('connected');
                    break;
                case Strophe.Status.CONNFAIL:
                    sharedData.connectionStatus = 'Failed to connect';
                    break;
                case Strophe.Status.AUTHENTICATING:
                    sharedData.connectionStatus = 'Authenticating';
                    break;
                case Strophe.Status.AUTHFAIL:
                    sharedData.connectionStatus = 'Failed to authenticate';
                    break;
                case Strophe.Status.DISCONNECTING:
                    sharedData.connectionStatus = 'Disconnecting';
                    break;
                case Strophe.Status.DISCONNECTED:
                    sharedData.connectionStatus = 'Disconnected';
                    break;
                case Strophe.Status.ATTACHED:
                    $rootScope.$broadcast('connected');
                    break;
                case Strophe.Status.ERROR:
                    sharedData.connectionStatus = 'Error';
                    break;
                default:
                    break;
            }
        }

    }
});