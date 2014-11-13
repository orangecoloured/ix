angular.module('IX', ['ionic', 'ngStorage', 'IX.services', 'IX.directives', 'IX.controllers'])

.config(function($stateProvider, $urlRouterProvider) {
    
    $stateProvider.state('IX', {
        url: '/IX',
        abstract: true,
        templateUrl: 'templates/core.html',
        controller: 'IX'
    })

    .state('IX.index', {
        url : '/index',
        views: {
            'menuContent': {
                templateUrl : 'templates/index.html',
                controller : 'Index'
            }
        }
    })

    .state('IX.contacts', {
        url: '/contacts',
        views: {
            'menuContent': {
                templateUrl: 'templates/contacts.html',
                controller: 'Contacts'
            }
        }
    })

    .state('IX.chat', {
        url: '/chat/:jid',
        views: {
            'menuContent': {
                templateUrl: 'templates/chat.html',
                controller: 'Chat'
            }
        }
    })

    .state('IX.chats', {
        url: '/chats',
        views: {
            'menuContent': {
                templateUrl: 'templates/chats.html',
                controller: 'Chats'
            }
        }
    })

    .state('IX.profile', {
        url: '/profile/:jid',
        views: {
            'menuContent': {
                templateUrl: 'templates/profile.html',
                controller: 'Profile'
            }
        }
    });

    $urlRouterProvider.otherwise('/IX/index');
})

.run(function($rootScope, $location, SharedProperties) {

    Strophe.addNamespace('VCARD', 'vcard-temp');
    Strophe.addNamespace('CHATSTATES', 'http://jabber.org/protocol/chatstates');
    Strophe.addNamespace('RECEIPTS', 'urn:xmpp:receipts');

    SharedProperties.sharedObject = {
        myJid: null,
        connection : null,
        profiles : {},
        roster : {},
        presences : {},
        messagePool : {},
        unread : 0,
        subscriptions : [],
        activeChat : null,
        defaultPhoto: 'img/ix.png',
        resource: '/IX',
        connectionStatus: '',
        selfPresence: {
            show: 'online',
            priority: 2,
            status: ''
        }
    }

    $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
        if (fromState.name == 'IX.chat') {
            SharedProperties.sharedObject.activeChat = null;
        }
    });

    $location.path('/IX/index/');

    /*$ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        
        if(window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });*/
});