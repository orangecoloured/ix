angular.module('IX.services')

.service('Roster', function($q, $rootScope, SharedProperties, XML, Profile, Popup) {
    
    var sharedData = SharedProperties.sharedObject;

    function storeRoster(obj) {

        sharedData.roster[obj.type] = obj.data;
    }

    function sortContactsAlphabeticallyReverse(a, b) {
        a = a['@attributes'].name || a['@attributes'].jid;
        b = b['@attributes'].name || b['@attributes'].jid;

        if (a < b) {
            return 1;
        }
        
        if (a > b) {
            return -1;
        }
        
        return 0;
    }

    function sortGroupsAlphabetically(a, b) {
            
        if (a > b) {
            return 1;
        }
        
        if (a < b) {
            return -1;
        }
        
        return 0;
    }
    
    function getGroup(obj) {

        var roster = sharedData.roster.clean.query.item;

        for (var i = roster.length - 1; i >= 0; i--) {
            if (roster[i]['@attributes'].jid == obj.jid) {
                if (roster[i].group) {
                    return roster[i].group['#text'];
                } else {
                    return false;
                }
            }

        }
    }

    function refreshContacts(obj) {
        var roster = sharedData.roster.clean.query.item;
        
        for (var i = roster.length - 1; i >= 0; i--) {
            if (roster[i]['@attributes'].jid == obj.jid) {
                if (obj.group) {
                    if (obj.group !== 1) {
                        roster[i].group = {
                            '#text': obj.group
                        }
                    } else {
                        delete roster[i].group;
                    }
                }

                if (obj.name) {
                    roster[i]['@attributes'].name = obj.name;
                }

                if (obj.subscription && obj.subscription == 'remove') {
                    roster.splice(i, 1);
                }
            }
        }
    }

    function updateGroupInput(obj) {
        if (!obj.selected) {
            obj.ungroup = true;
            obj.group = '';
        } else {
            obj.ungroup = false;
            obj.group = obj.selected;
        }
    }
    
    return{

        getSubscription: function(obj) {

            var roster = sharedData.roster.clean.query.item;

            for (var i = roster.length - 1; i >= 0; i--) {
                if (roster[i]['@attributes'].jid == obj.jid) {
                    return roster[i]['@attributes'].subscription;
                }
            }
        },

        showGroupPopup : function(obj) {

            obj.scope.updateInput = updateGroupInput;

            obj.scope.customGroup = {
                group: sharedData.roster.groupsArray[1].group,
                ungroup: false,
                groups: sharedData.roster.groupsArray,
                selected: sharedData.roster.groupsArray[1].value
            }

            Popup.show({
                title: 'Group Options',
                subTitle: 'Choose a group for <b>' + obj.contactName + '</b>',
                templateUrl: 'templates/modals/group.html',
                scope: obj.scope,
                buttons: [
                    {
                        text: 'Cancel',
                        type: 'button-clear button-assertive'
                    },
                    {
                        text: 'Save',
                        type: 'button-clear button-royal',
                        onTap: function(e) {
                            
                            if (obj.scope.customGroup.ungroup) {
                                return function() {
                                    obj.callback({
                                        jid: obj.jid,
                                        group: 1
                                    });
                                }
                            }
                            
                            if (!obj.scope.customGroup.group) {
                                e.preventDefault();
                            } else {
                                return function() {
                                    obj.callback({
                                        jid: obj.jid,
                                        group: obj.scope.customGroup.group
                                    });
                                }
                            }
                        }
                    }
                ]
            });
        },

        showAddPopup : function(obj) {

            obj.scope.updateInput = updateGroupInput;

            obj.scope.addContactData = {
                jid: obj.jid || '',
                name: '',
                ungroup: false,
                group: sharedData.roster.groupsArray[1].group,
                groups: sharedData.roster.groupsArray,
                selected: sharedData.roster.groupsArray[1].value
            }

            Popup.show({
                title: 'Add Contact',
                subTitle: 'Name and Group are optional',
                templateUrl: 'templates/modals/addContact.html',
                scope: obj.scope,
                buttons: [
                    { 
                        text: 'Cancel',
                        type: 'button-clear button-assertive'
                    },
                    {
                        text: 'Add',
                        type: 'button-clear button-royal',
                        onTap: function(e) {

                            if (!obj.scope.addContactData.jid) {
                                e.preventDefault();
                            } else {
                                return function() {
                                    obj.callback(obj.scope.addContactData);
                                }
                            }
                        }
                    }
                ]
            });
        },

        isInRoster : function(obj) {

            var roster = sharedData.roster.clean.query.item;

            for (var i = roster.length - 1; i >= 0; i--) {
                if (roster[i]['@attributes'].jid == obj.jid) {
                    return true;
                }
            }

            return false;
        },

        changeSubscription : function(obj) {
            var roster = sharedData.roster.clean.query.item;

            for (var i = roster.length - 1; i >= 0; i--) {
                if (roster[i]['@attributes'].jid == obj.jid) {

                    var subscription = this.getSubscription(obj),
                        item = roster[i];
                    
                    if (obj.direction == 'incoming') {
                        if (obj.type.indexOf('un') < 0) {
                            if (obj.type.indexOf('ed') > -1) {
                                if (subscription == 'none') {
                                    item['@attributes'].subscription = 'to';
                                } else {
                                    item['@attributes'].subscription = 'both';
                                }
                            }
                        } else {
                            if (obj.type.indexOf('ed') < 0) {
                                if (subscription == 'both') {
                                    item['@attributes'].subscription = 'to';
                                } else {
                                    item['@attributes'].subscription = 'none';
                                }
                            } else {
                                if (subscription == 'both') {
                                    item['@attributes'].subscription = 'from';
                                } else {
                                    item['@attributes'].subscription = 'none';
                                }
                            }
                        }
                    } else {
                        if (obj.type.indexOf('un') < 0) {
                            if (obj.type.indexOf('ed') > -1) {
                                if (subscription == 'none') {
                                    item['@attributes'].subscription = 'from';
                                } else {
                                    item['@attributes'].subscription = 'both';
                                }
                            }
                        } else {
                            if (obj.type.indexOf('ed') < 0) {
                                if (subscription == 'both') {
                                    item['@attributes'].subscription = 'from';
                                } else {
                                    item['@attributes'].subscription = 'none';
                                }
                            } else {
                                if (subscription == 'both') {
                                    item['@attributes'].subscription = 'to';
                                } else {
                                    item['@attributes'].subscription = 'none';
                                }
                            }
                        }
                    }
                }
            }
        },

        addToRoster : function(obj) {
            var contact = {
                '@attributes': {
                    jid: obj.jid,
                    name: obj.name || null,
                    subscription: obj.subscription || 'none'
                },
                group: obj.group || null
            }

            sharedData.roster.clean.query.item.push(contact);
        },
        
        set : function(obj) {

            var deferred = $q.defer(),
                requestId = sharedData.connection.getUniqueId('roster'),
                item = {
                    name: obj.name || '',
                    jid: obj.jid
                },
                iq = $iq({
                    type: 'set',
                    id: requestId
                });

            if (obj.subscription && obj.subscription == 'remove') {
                
                iq.c('query', {
                    xmlns: Strophe.NS.ROSTER
                }).c('item', {
                    subscription: obj.subscription,
                    jid: obj.jid
                });
            } else {
                
                if (!this.isInRoster(obj)) {
                    this.addToRoster(obj);
                }

                if (obj.subscription) {
                    item.subscription = obj.subscription;
                }
                
                iq.c('query', {
                    xmlns: Strophe.NS.ROSTER
                }).c('item', item);

                if (obj.group) {
                    if (obj.group !== 1) {
                        iq.c('group').t(obj.group);
                    }
                } else {
                    var group = getGroup(obj);

                    if (group) {
                        iq.c('group').t(group);
                    }
                }
            }

            iq.tree();

            sharedData.connection.sendIQ(iq, obj.callback);

            refreshContacts(obj);
            
            deferred.resolve(this.group(sharedData.roster.clean));
            /*deferred.reject(roster);*/
            return deferred.promise;
        },

        get : function(obj) {

            var deferred = $q.defer(),
                parse = function(data) {

                    var roster = XML.parse(data);

                    $rootScope.$apply(function() {
                
                        storeRoster({
                            type: 'clean',
                            data: roster
                        });
                        
                        if (roster.query.item.length) {
                            deferred.resolve(roster);
                        } else {
                            deferred.reject(roster);
                        }

                    });
                },
                requestId = sharedData.connection.getUniqueId('roster'),
                iq = $iq({
                    type: 'get',
                    id: requestId
                }).c('query', {
                    xmlns: Strophe.NS.ROSTER
                }).tree();

            sharedData.connection.sendIQ(iq, parse);

            return deferred.promise;
        },

        group : function(roster) {

            roster = roster.query.item;

            var groupNames = [],
                groupsArray = [],
                tempRosterObject = {},
                ungrouppedObject = {
                    contacts : []
                },
                tempRosterGroupped = [],
                rosterCollection = [];

            for (var i = roster.length - 1; i >= 0; i--) {
                var groupName = roster[i].group != null ? roster[i].group['#text'] : null;

                if (groupName != null) {

                    if (groupNames.indexOf(groupName) < 0) {
                        groupNames.push(groupName);
                    }
                    
                    tempRosterObject[groupName] = tempRosterObject[groupName] || [];
                    tempRosterObject[groupName].push(roster[i]);
                } else {
                    ungrouppedObject.contacts.push(roster[i]);
                }
            }

            groupNames.sort(sortGroupsAlphabetically);

            for (var i = groupNames.length - 1; i >= 0; i--) {
                var groupName = groupNames[i];

                groupsArray.push({
                    group: groupName,
                    value: groupName
                });
                
                tempRosterGroupped.push({
                    group: groupName,
                    contacts: tempRosterObject[groupName].sort(sortContactsAlphabeticallyReverse)
                });
            }

            if (ungrouppedObject.contacts.length) {
                ungrouppedObject.contacts.sort(sortContactsAlphabeticallyReverse)
                tempRosterGroupped.push(ungrouppedObject);
            }
            
            groupsArray.unshift({
                group: 'No Group',
                value: false
            });

            storeRoster({
                type: 'groupsArray',
                data: groupsArray
            });

            for (var i = tempRosterGroupped.length - 1; i >= 0; i--) {

                if (tempRosterGroupped[i].group) {
                    rosterCollection.push({
                        isGroupName: true,
                        groupName: tempRosterGroupped[i].group
                    });
                }

                for (var j = tempRosterGroupped[i].contacts.length - 1; j >= 0; j--) {
                    rosterCollection.push(tempRosterGroupped[i].contacts[j]);
                }
            };

            storeRoster({
                type: 'collection',
                data: rosterCollection
            });

            return rosterCollection;
        }
    }
});