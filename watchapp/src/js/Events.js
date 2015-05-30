var functions = require('functions');
var ajax = require('ajax');
var UI = require('ui');

var Events = module.exports;

var locationOptions = {
    enableHighAccuracy: true, maximumAge: 10000, timeout: 10000
};

var loading = null;
var groupID = -1;
var menu = null;
var options = null;
var eventIndex = -1;

function getEvents(lon, lat, topics) {
    console.log('lat= ' + lat + ' lon= ' + lon);
    console.log(topics);
    ajax({
            url: functions.getAPIURL(), type: 'json', method: 'post', data: {
                lat: lat,
                lon: lon,
                distance: functions.getSetting('radius', 250),
                groupID: groupID,
                units: functions.getSetting('units', 'm'),
                categories: topics,
                method: (topics ? 'customevents' : 'events')
            }, cache: false
        }, function (data) {
            if (data.error) {
                functions.showAndRemoveCard('Error', '', data.error, loading, 'IMAGE_ERROR_ICON');
            } else {
                loading.hide();
                var menuItems = [data.length];
                for (var i = 0; i < data.length; i++) {
                    menuItems[i] = {
                        id: data[i].id,
                        title: data[i].name,
                        subtitle: data[i].date,
                        city: data[i].venue.city,
                        state: data[i].venue.state,
                        country: data[i].venue.country,
                        date: data[i].date,
                        distance: data[i].distance,
                        location: data[i].venue.name,
                        address: data[i].venue.address_1,
                        group: data[i].group.name,
                        groupid: data[i].group.id,
                        who: data[i].group.who,
                        attending: data[i].yes_rsvp_count
                    };
                }
                var optionItems = [{
                    title: 'Get Info', subtitle: 'Retrieve the event info.', icon: 'IMAGE_INFO_ICON'
                }];
                if (typeof Pebble.getTimelineToken == 'function') {
                    optionItems.push({
                        title: 'Pin Event', subtitle: 'Add to Timeline.', icon: 'IMAGE_PIN_ICON'
                    });
                }

                menu = new UI.Menu({
                    sections: [{
                        title: 'Events - ' + data.length, items: menuItems
                    }]
                });
                options = new UI.Menu({
                    sections: [{
                        title: 'Options', items: optionItems
                    }]
                });
                options.on('select', function (event) {
                    if (eventIndex < 0 || eventIndex > menuItems.length - 1) {
                        return;
                    }
                    if (event.itemIndex === 0) {
                        functions.showCard(menuItems[eventIndex].title, '', 'Date: ' + menuItems[eventIndex].subtitle + '\nLocation: ' + menuItems[eventIndex].location + (menuItems[eventIndex].location.toLowerCase() !== 'undetermined' ? '\nDistance: ' + menuItems[eventIndex].distance + (menuItems[eventIndex].address ? '\nAddress: ' + menuItems[eventIndex].address : '') + '\n' + menuItems[eventIndex].city + ', ' + (menuItems[eventIndex].state ? (menuItems[eventIndex].state + ', ') : '') + menuItems[eventIndex].country : '') + '\nAttending: ' + menuItems[eventIndex].attending + ' ' + menuItems[eventIndex].who + '\nHost Group: ' + menuItems[eventIndex].group);
                    } else if (event.itemIndex === 1 && typeof Pebble.getTimelineToken == 'function') {
                        var pinning = functions.showCard('Events', optionItems[1].title + 'ning...', '', optionItems[1].icon);
                        Pebble.getTimelineToken(function (token) {
                                if (optionItems[1].title == 'Unpin') {
                                    ajax({
                                            url: functions.getAPIURL(), type: 'json', method: 'post', data: {
                                                userToken: token,
                                                eventID: menuItems[eventIndex].id.toString(),
                                                method: 'removeeventpin'
                                            }, cache: false
                                        }, function (data) {
                                            if (data.error) {
                                                functions.showAndRemoveCard('Error', data.error, '', pinning, 'IMAGE_ERROR_ICON');
                                            } else if (data.status.code != 200) {
                                                functions.showAndRemoveCard('Error', data.status.message, '', pinning, 'IMAGE_ERROR_ICON');
                                            } else {
                                                functions.showAndRemoveCard('Success', data.status.message, '', pinning, 'IMAGE_EVENT_ICON');
                                                optionItems[1].title = 'Pin';
                                                optionItems[1].icon = 'IMAGE_PIN_ICON';
                                                options.items(0, optionItems);
                                            }
                                        }, function (error) {
                                            functions.showAndRemoveCard('Error', 'Error unpinning event!', '', pinning, 'IMAGE_ERROR_ICON');
                                        });
                                } else {
                                    ajax({
                                            url: functions.getAPIURL(), type: 'json', method: 'post', data: {
                                                userToken: token,
                                                eventID: menuItems[eventIndex].id.toString(),
                                                method: 'eventnotify'
                                            }, cache: false
                                        }, function (data) {
                                            if (data.error) {
                                                functions.showAndRemoveCard('Error', data.error, '', pinning, 'IMAGE_ERROR_ICON');
                                            } else if (data.status.code != 200) {
                                                functions.showAndRemoveCard('Error', data.status.message, '', pinning, 'IMAGE_ERROR_ICON');
                                            } else {
                                                functions.showAndRemoveCard('Success', data.status.message, '', pinning, 'IMAGE_EVENT_ICON');
                                                optionItems[1].title = 'Unpin';
                                                optionItems[1].icon = 'IMAGE_UNPIN_ICON';
                                                options.items(0, optionItems);
                                                if (topics) {
                                                    ajax({
                                                            url: functions.getAPIURL(),
                                                            type: 'json',
                                                            method: 'post',
                                                            data: {
                                                                method: 'addeventlistener',
                                                                groupID: menuItems[eventIndex].groupid.toString()
                                                            },
                                                            cache: false
                                                        });
                                                }
                                            }
                                        }, function (error) {
                                            functions.showAndRemoveCard('Error', 'Error pinning event!', '', pinning, 'IMAGE_ERROR_ICON');
                                        });
                                }
                            }, function (error) {
                                functions.showAndRemoveCard('Error', 'Error fetching timeline token!', '', pinning, 'IMAGE_ERROR_ICON');
                            });
                    }
                });
                menu.on('select', function (event) {
                    eventIndex = event.itemIndex;
                    options.hide();
                    if (typeof Pebble.getTimelineToken == 'function') {
                        optionItems[1].title = 'Pin';
                        optionItems[1].icon = 'IMAGE_PIN_ICON';
                        options.items(0, optionItems);
                        var pinstatus = functions.showCard('Loading...', 'Determining event pin status', '', 'IMAGE_PIN_ICON');
                        Pebble.getTimelineToken(function (token) {
                                ajax({
                                        url: functions.getAPIURL(), type: 'json', method: 'post', data: {
                                            userToken: token,
                                            eventID: menuItems[eventIndex].id.toString(),
                                            method: 'checkforpin'
                                        }, cache: false
                                    }, function (data) {
                                        if (data.error) {
                                            pinstatus.hide();
                                            options.show();
                                        } else {
                                            if (data.pinned == 'true') {
                                                optionItems[1].title = 'Unpin';
                                                optionItems[1].icon = 'IMAGE_UNPIN_ICON';
                                                options.items(0, optionItems);
                                            }
                                            pinstatus.hide();
                                            options.show();
                                        }
                                    }, function (error) {
                                        pinstatus.hide();
                                        options.show();
                                    });
                            }, function (error) {
                                pinstatus.hide();
                                options.show();
                            });
                    } else {
                        options.show();
                    }
                });
                menu.show();
            }
        }, function (error) {
            functions.showAndRemoveCard('Error', 'Error contacting server.', '', loading, 'IMAGE_ERROR_ICON');
        });
}

function locationSuccess(pos) {
    getEvents(pos.coords.longitude, pos.coords.latitude);
}

function locationSuccessCustom(pos) {
    getEvents(pos.coords.longitude, pos.coords.latitude, functions.getSetting('customgroups'));
}

function locationError(err) {
    functions.showAndRemoveCard('Error', 'Error determining location.', 'If you keep recieving this message, a manual location can be set in the settings.', loading, 'IMAGE_ERROR_ICON');
    console.log('location error (' + err.code + '): ' + err.message);
}


// Make an asynchronous request

Events.fetch = function () {
    if (menu !== null) {
        menu.hide();
        menu = null;
    }
    if (options !== null) {
        options.hide();
        options = null;
    }
    if (loading !== null) {
        loading.hide();
        loading = null;
    }
    groupID = -1;
    loading = functions.showCard('Events', 'Loading...', '', 'IMAGE_EVENT_ICON');
    if (!functions.getSetting('location', false)) {
        navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
    } else {
        var lon = functions.getSetting('lon', 0);
        var lat = functions.getSetting('lat', 0);
        if (lon && lat) {
            getEvents(lon, lat);
        } else {
            functions.showAndRemoveCard('Error', 'Error using custom location.', '', loading, 'IMAGE_ERROR_ICON');
        }
    }
};

Events.fetchFor = function (gid) {
    if (menu !== null) {
        menu.hide();
        menu = null;
    }
    if (options !== null) {
        options.hide();
        options = null;
    }
    if (loading !== null) {
        loading.hide();
    }
    groupID = gid;
    loading = functions.showCard('Events', 'Loading...', '', 'IMAGE_EVENT_ICON');
    if (!functions.getSetting('location', false)) {
        navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
    } else {
        var lon = functions.getSetting('lon', 0);
        var lat = functions.getSetting('lat', 0);
        if (lon && lat) {
            getEvents(lon, lat);
        } else {
            functions.showAndRemoveCard('Error', 'Error using custom location.', '', loading, 'IMAGE_ERROR_ICON');
        }
    }
};

Events.fetchCustom = function () {
    if (functions.getSetting('customgroups')) {
        loading = functions.showCard('Events', 'Loading...', '', 'IMAGE_EVENT_ICON');
        if (!functions.getSetting('location', false)) {
            navigator.geolocation.getCurrentPosition(locationSuccessCustom, locationError, locationOptions);
        } else {
            var lon = functions.getSetting('lon', 0);
            var lat = functions.getSetting('lat', 0);
            console.log('loading events for ' + functions.getSetting('customgroups'))
            if (lon && lat) {
                getEvents(lon, lat, functions.getSetting('customgroups'));
            } else {
                functions.showAndRemoveCard('Error', 'Error using custom location.', '', loading, 'IMAGE_ERROR_ICON');
            }
        }
    } else {
        functions.showCard('Error', '', 'You have no custom groups configured! Please add some in the settings!', 'IMAGE_ERROR_ICON');
    }

};