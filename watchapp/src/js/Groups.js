var functions = require('functions');
var ajax = require('ajax');
var UI = require('ui');
var events = require('Events');
var members = require('Members');

var Groups = module.exports;

var locationOptions = {
    enableHighAccuracy: true, maximumAge: 10000, timeout: 10000
};

var loading = null;
var eventIndex = -1;

function getGroups(lon, lat, customTopics) {
    console.log('lat= ' + lat + ' lon= ' + lon);
    ajax({
            url: functions.getAPIURL(), type: 'json', method: 'post', data: {
                lat: lat,
                lon: lon,
                categories: customTopics,
                units: functions.getSetting('units', 'm'),
                method: (customTopics ? 'customgroups' : 'groups')
            }, cache: false
        }, function (data) {
            if (data.error) {
                functions.showErrorCard(data.error, loading);
            } else {
                loading.hide();
                var menuItems = [data.length];
                for (var i = 0; i < data.length; i++) {
                    menuItems[i] = {
                        title: data[i].name,
                        subtitle: "Distance: " + data[i].distance,
                        city: data[i].city,
                        state: data[i].state,
                        country: data[i].country,
                        id: data[i].id,
                        who: data[i].who,
                        members: data[i].members
                    };
                }
                var optionItems = [{
                    title: 'Get Info', subtitle: 'Group info.', icon: 'IMAGE_INFO_ICON'
                }, {
                    title: 'Members', subtitle: 'Group\'s members.', icon: 'IMAGE_MEMBERS_ICON'
                }, {
                    title: 'Find Events', subtitle: 'Group\'s events.', icon: 'IMAGE_EVENT_ICON'
                }];
                if (typeof Pebble.timelineSubscriptions == 'function') {
                    optionItems.push({
                        title: 'Toggle Timeline', subtitle: 'Group Timeline', icon: 'IMAGE_SUBSCRIBE_ICON'
                    });
                }
                var menu = new UI.Menu({
                    sections: [{
                        title: 'Groups - ' + data.length, items: menuItems
                    }]
                });
                var options = new UI.Menu({
                    sections: [{
                        title: 'Options', items: optionItems
                    }]
                });
                options.on('select', function (event) {
                    if (eventIndex < 0 || eventIndex > menuItems.length - 1) {
                        return;
                    }
                    if (event.itemIndex === 0) {
                        functions.showCard(null, menuItems[eventIndex].title, '', 'Location: ' + menuItems[eventIndex].city + ', ' + (menuItems[eventIndex].state ? menuItems[eventIndex].state : menuItems[eventIndex].country ) + '\n' + menuItems[eventIndex].subtitle + '\nWe\'re ' + menuItems[eventIndex].members + ' ' + menuItems[eventIndex].who, functions.getColorOptions('DATA'));
                    } else if (event.itemIndex == 1) {
                        members.fetchFor(menuItems[eventIndex].id, menuItems[eventIndex].members, menuItems[eventIndex].who);
                    } else if (event.itemIndex == 2) {
                        events.fetchFor(menuItems[eventIndex].id);
                    } else if (event.itemIndex === 3 && typeof Pebble.timelineSubscriptions == 'function') {
                        var subscribing = functions.showLoadingCard('Subscription',(optionItems[3].title.indexOf('Toggle') < 0 ? optionItems[3].title.substring(0, optionItems[3].title.length - 1) + 'ing' : 'Toggling Subscription'));
                        Pebble.timelineSubscriptions(function (topics) {
                                if (topics.indexOf(menuItems[eventIndex].id.toString()) > 0) {
                                    Pebble.timelineUnsubscribe(menuItems[eventIndex].id.toString(), function () {
                                            functions.showCard('IMAGE_UNSUBSCRIBE_ICON', 'Success!', '', 'You have unsubscribed from upcoming notifications about upcoming events with ' + menuItems[eventIndex].title + '.',functions.getColorOptions('SUCCESS'), subscribing);
                                            optionItems[3].title = 'Subscribe';
                                            options.items(0, optionItems);
                                        }, function (errorString) {
                                            functions.showErrorCard('Error unsubscribing from the group ' + menuItems[eventIndex].title + '.', subscribing);
                                            console.log('Error unsubscribing from group ' + menuItems[eventIndex].title + ' error code: ' + errorString);
                                        });
                                } else {
                                    if (customTopics !== undefined) {
                                        ajax({
                                                url: functions.getAPIURL(), type: 'json', method: 'post', data: {
                                                    method: 'addeventlistener',
                                                    groupID: menuItems[eventIndex].id.toString()
                                                }, cache: false
                                            }, function (data) {
                                                if (data.error) {
                                                    functions.showErrorCard(data.error, subscribing);
                                                } else {
                                                    Pebble.timelineSubscribe(menuItems[eventIndex].id.toString(), function () {
                                                            functions.showCard('IMAGE_SUBSCRIBE_ICON', 'Success!', '', 'You have subscribed for timeline notifications about upcoming events with ' + menuItems[eventIndex].title + '.', functions.getColorOptions('SUCCESS'), subscribing);
                                                            optionItems[3].title = 'Unsubscribe';
                                                            options.items(0, optionItems);
                                                        }, function (errorString) {
                                                            functions.showErrorCard('Error subscribing to the group ' + menuItems[eventIndex].title + '. Error: ' + errorString, subscribing);
                                                            console.log('Error subscribing to group ' + menuItems[eventIndex].title + ' error code: ' + errorString);
                                                        });
                                                }
                                            }, function (error) {
                                                functions.showErrorCard('Error subscribing to the group ' + menuItems[eventIndex].title + '. Error: ' + error, subscribing);
                                            });
                                    } else {
                                        Pebble.timelineSubscribe(menuItems[eventIndex].id.toString(), function () {
                                                functions.showCard('IMAGE_SUBSCRIBE_ICON', 'Success!', '', 'You have subscribed for timeline notifications about upcoming events with ' + menuItems[eventIndex].title + '.', functions.getColorOptions('SUCCESS'), subscribing);
                                                optionItems[3].title = 'Unsubscribe';
                                                options.items(0, optionItems);
                                            }, function (errorString) {
                                                functions.showErrorCard('Error subscribing to the group ' + menuItems[eventIndex].title + '. Error: ' + errorString, subscribing);
                                                console.log('Error subscribing to group ' + menuItems[eventIndex].title + ' error code: ' + errorString);
                                            });
                                    }
                                }
                            }, function (errorString) {
                                functions.showErrorCard('Error determining subscription status!', subscribing);
                                console.log('Error getting subscriptions to toggle subscription for group ' + menuItems[eventIndex].title + ' error code: ' + errorString);
                            });
                    }
                });
                menu.on('select', function (event) {
                    options.hide();
                    eventIndex = event.itemIndex;
                    if (typeof Pebble.timelineSubscriptions == 'function') {
                        optionItems[3].title = 'Subscribe';
                        optionItems[3].icon = 'IMAGE_SUBSCRIBE_ICON';
                        options.items(0, optionItems);
                        var subscriptions = functions.showLoadingCard('Group', 'Determining group subscription status');
                        Pebble.timelineSubscriptions(function (topics) {
                                if (topics.indexOf(menuItems[eventIndex].id.toString()) > 0) {
                                    optionItems[3].title = 'Unsubscribe';
                                    optionItems[3].icon = 'IMAGE_UNSUBSCRIBE_ICON';
                                    options.items(0, optionItems);
                                }
                                subscriptions.hide();
                                options.show();
                            }, function (errorString) {
                                console.log('Error determining subscription stats for group ' + menuItems[eventIndex].title + ' error code: ' + errorString);
                                subscriptions.hide();
                                options.show();
                            });
                    } else {
                        options.show();
                    }
                });
                menu.show();
            }
        }, function (error) {
            functions.showErrorCard('Error contacting server.', loading);
            console.log('Error loading groups ' + error)
        });
}

function locationSuccess(pos) {
    getGroups(pos.coords.longitude, pos.coords.latitude);
}

function locationSuccessCustom(pos) {
    getGroups(pos.coords.longitude, pos.coords.latitude, functions.getSetting('customgroups'));
}

function locationError(err) {
    if (typeof err !== undefined) {
        functions.showErrorCard('Could not determine your location.\nIf you keep receiving this message, a manual location can be set in the settings.', loading);
        console.log('location error (' + err.code + '): ' + err.message);
    } else {
        functions.showErrorCard('App not connected to the internet! This app requires an internet or data connection.', loading);
    }
}


// Make an asynchronous request

Groups.fetch = function () {
    loading = functions.showLoadingCard('Groups', 'Populating groups list');
    if (!functions.getSetting('location', false)) {
        navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
    } else {
        var lon = functions.getSetting('lon', 0);
        var lat = functions.getSetting('lat', 0);
        if (lon && lat) {
            getGroups(lon, lat);
        } else {
            functions.showErrorCard('Error using custom location.', loading);
        }
    }
};

Groups.fetchCustom = function () {
    if (functions.getSetting('customgroups')) {
        loading = functions.showLoadingCard('Groups', 'Populating groups list');
        if (!functions.getSetting('location', false)) {
            navigator.geolocation.getCurrentPosition(locationSuccessCustom, locationError, locationOptions);
        } else {
            var lon = functions.getSetting('lon', 0);
            var lat = functions.getSetting('lat', 0);
            console.log('loading groups for ' + functions.getSetting('customgroups'));
            if (lon && lat) {
                getGroups(lon, lat, functions.getSetting('customgroups'));
            } else {
                functions.showErrorCard('Error using custom location.', loading);
            }
        }
    } else {
        functions.showErrorCard('You have no custom groups configured! Please add some in the settings!');
    }

};