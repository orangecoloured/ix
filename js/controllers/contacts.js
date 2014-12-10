angular.module('IX.controllers')

.controller('Contacts', function($scope, $location, Roster, Profile, SharedProperties, base64, Presence, ActionSheet, Confirm, Popup, Modal) {

    var sharedData = SharedProperties.sharedObject;

    $scope.roster = sharedData.roster.collection;

    $scope.customName = {text: null}

    $scope.getItemHeight = function(item) {
        return item.isGroupName ? 40 : 64;
    }

    $scope.getPresence = function(item) {
        return Presence.getStatus(item);
    }

    $scope.getStatusText = function(item) {
        return Presence.getStatusText(item);
    }

    $scope.getPhoto = function(obj) {
        return base64.imgSrc(obj);
    }

    $scope.getName = function(obj) {
        return Profile.getName(obj);
    }

    $scope.getSubscriptionType = function(obj) {

        switch (obj['@attributes'].subscription) {
            case 'to': {
                return 'ion-arrow-up-c';
            }
            case 'from': {
                return 'ion-arrow-down-c';
            }
            case 'none': {
                return 'ion-close-round';
            }
            default: {
                return 'bothSubscribed';
            }
        }
    }

    function showProfile(obj) {
        $location.path('/IX/profile/' + obj['@attributes'].jid);
    }

    function requestSubscription(obj) {
        Presence.send({
            jid: obj['@attributes'].jid,
            type: 'subscribe'
        });
    }

    function unsubscribe(obj) {
        Presence.send({
            jid: obj['@attributes'].jid,
            type: 'unsubscribe'
        });

        Roster.changeSubscription({
            jid: obj['@attributes'].jid,
            direction: 'outgoing',
            type: 'unsubscribe'
        });
    }

    function revokeSubscription(obj) {
        Presence.send({
            jid: obj['@attributes'].jid,
            type: 'unsubscribed'
        });

        Roster.changeSubscription({
            jid: obj['@attributes'].jid,
            direction: 'outgoing',
            type: 'unsubscribed'
        });
    }

    function addContact(obj) {

        angular.extend(obj, {
            callback: rosterCallback
        });

        Roster.set(obj)
        .then(function(roster) {
            $scope.roster = roster;
        }, function(roster) {
            console.log('Error getting roster');
            $scope.roster = [];
        });
    }

    $scope.clickRosterItem = function(item) {
        if (item['@attributes']) {
            $location.path('/IX/chat/' + item['@attributes'].jid);
        }
    }

    function rosterCallback(data) {
        //console.log(data);
        //$scope.roster = sharedData.roster.collection;
    }

    function changeGroup(obj) {
        Roster.set({
            jid: obj.jid,
            group: obj.group,
            callback: rosterCallback
        })
        .then(function(roster) {
            $scope.roster = roster;
        }, function(roster) {
            console.log('Error getting roster');
            $scope.roster = [];
        });
    }

    function renameContact(obj) {
        Roster.set({
            jid: obj.jid,
            name: obj.name,
            callback: rosterCallback
        });

        $scope.customName.text = null;
    }

    function removeContact(obj) {
        Roster.set({
            jid: obj['@attributes'].jid,
            subscription: 'remove',
            callback: rosterCallback
        })
        .then(function(roster) {
            Presence.remove({
                jid: obj['@attributes'].jid
            });
            $scope.roster = roster;
        }, function(roster) {
            console.log('Error getting roster');
            $scope.roster = [];
        });
    }

    function renamePopup(obj) {

        var contactName = Profile.getName({jid: obj['@attributes'].jid});

        Popup.show({
            title: 'Rename Contact',
            subTitle: 'Enter a new name for <b>' + contactName + '</b>',
            template: '<label class="item item-input"><input type="text" ng-model="customName.text" placeholder="New Name"></label>',
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
                        if (!$scope.customName.text) {
                            e.preventDefault();
                        } else {
                            return function() {
                                renameContact({
                                    jid: obj['@attributes'].jid,
                                    name: $scope.customName.text
                                });
                            }
                        }
                    }
                }
            ]
        });
    }

    $scope.showAddContact = function() {

        Roster.showAddPopup({
            scope: $scope,
            callback: addContact
        });
    }

    function groupPopup(obj) {

        Roster.showGroupPopup({
            scope: $scope,
            contactName: Profile.getName({jid: obj['@attributes'].jid}),
            jid: obj['@attributes'].jid,
            callback: changeGroup
        });
    }

    $scope.holdRosterItem = function(obj) {

        if (obj.isGroupName) {
            return;
        }

        var contactName = Profile.getName({jid: obj['@attributes'].jid}),
            buttons = [
                {
                    text: 'Show Profile',
                    callback: function() {
                        showProfile(obj);
                    }
                },
                {
                    text: 'Rename',
                    callback: function() {
                        renamePopup(obj);
                    }
                },
                {
                    text: 'Group Options',
                    callback: function() {
                        groupPopup(obj);
                    }
                }
            ];

        if (obj['@attributes'].subscription == 'both' || obj['@attributes'].subscription == 'from') {

            buttons.push({
                text: 'Revoke Subscription',
                callback: function() {
                    revokeSubscription(obj);
                }
            });
        }
        
        if (obj['@attributes'].subscription == 'none' || obj['@attributes'].subscription == 'from') {
            buttons.push({
                text: 'Subscribe',
                callback: function() {
                    requestSubscription(obj);
                }
            });
        }

        if (obj['@attributes'].subscription == 'both' || obj['@attributes'].subscription == 'to') {

            buttons.push({
                text: 'Unsubscribe',
                callback: function() {
                    unsubscribe(obj);
                }
            });
        }

        ActionSheet.show({
            titleText: contactName,
            buttons: buttons,
            destructiveText: 'Remove',
            destructiveAction: function() {
                Confirm.show({
                    title: 'Remove Contact',
                    template: 'Are you sure you want to remove <b>' + contactName + '</b> from your contact list?',
                    cancelText: 'No',
                    cancelType: 'button-clear button-default',
                    okText: 'Yes',
                    okType: 'button-clear button-assertive',
                    positiveCallback: function() {
                        removeContact(obj);
                    }
                });
            }
        });
    }

    $scope.refresh = function() {
        Roster.get()
        .then(function(roster) {
            Profile.getAll(roster);
            $scope.roster = Roster.group(roster);

            $scope.$broadcast('scroll.refreshComplete');
        }, function(roster) {
            console.log('Error getting roster');
            $scope.roster = [];
            $scope.$broadcast('scroll.refreshComplete');
        });
    }

    $scope.$on('rosterRefresh', function() {
        $scope.roster = sharedData.roster.collection;
    });
});