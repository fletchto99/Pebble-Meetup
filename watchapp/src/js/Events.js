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
                functions.showErrorCard(data.error, loading);
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
                        functions.showCard(null, menuItems[eventIndex].title, '', 'Date: ' + menuItems[eventIndex].subtitle + '\nLocation: ' + menuItems[eventIndex].location + (menuItems[eventIndex].location.toLowerCase() !== 'undetermined' ? '\nDistance: ' + menuItems[eventIndex].distance + (menuItems[eventIndex].address ? '\nAddress: ' + menuItems[eventIndex].address : '') + '\n' + menuItems[eventIndex].city + ', ' + (menuItems[eventIndex].state ? (menuItems[eventIndex].state + ', ') : '') + menuItems[eventIndex].country : '') + '\nAttending: ' + menuItems[eventIndex].attending + ' ' + menuItems[eventIndex].who + '\nHost Group: ' + menuItems[eventIndex].group, functions.getColorOptions('DATA'));
                    } else if (event.itemIndex === 1 && typeof Pebble.getTimelineToken == 'function') {
                        var pinning = functions.showLoadingCard('Events', optionItems[1].title + 'ning...');
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
                                                functions.showErrorCard(data.error, pinning);
                                            } else if (data.status.code != 200) {
                                                functions.showErrorCard(data.status.message, pinning);
                                            } else {
                                                functions.showCard('IMAGE_EVENT_ICON', 'Success','', data.status.message, functions.getColorOptions('SUCCESS'), pinning);
                                                optionItems[1].title = 'Pin';
                                                optionItems[1].icon = 'IMAGE_PIN_ICON';
                                                options.items(0, optionItems);
                                            }
                                        }, function () {
                                            functions.showErrorCard('Error unpinning event!', pinning);
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
                                                functions.showErrorCard(data.error, pinning);
                                            } else if (data.status.code != 200) {
                                                functions.showErrorCard(data.status.message, pinning);
                                            } else {
                                                functions.showCard('IMAGE_EVENT_ICON', 'Success', '', data.status.message, functions.getColorOptions('SUCCESS'), pinning);
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
                                        }, function () {
                                            functions.showErrorCard('Error pinning event!', pinning);
                                        });
                                }
                            }, function () {
                                functions.showErrorCard('Error retrieving timeline token!', pinning);
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
                        var pinstatus = functions.showLoadingCard('Event', '', 'Determining event pin status');
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
                                    }, function () {
                                        pinstatus.hide();
                                        options.show();
                                    });
                            }, function () {
                                pinstatus.hide();
                                options.show();
                            });
                    } else {
                        options.show();
                    }
                });
                menu.show();
            }
        }, function () {
            functions.showErrorCard('Connection to server failed!', loading);
        });
}

function locationSuccess(pos) {
    getEvents(pos.coords.longitude, pos.coords.latitude);
}

function locationSuccessCustom(pos) {
    getEvents(pos.coords.longitude, pos.coords.latitude, functions.getSetting('customgroups'));
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
    loading = functions.showLoadingCard('Events', 'Populating events list');
    if (!functions.getSetting('location', false)) {
        navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
    } else {
        var lon = functions.getSetting('lon', 0);
        var lat = functions.getSetting('lat', 0);
        if (lon && lat) {
            getEvents(lon, lat);
        } else {
            functions.showErrorCard('Error determining the custom location you have set.', loading);
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
    loading = functions.showLoadingCard('Events', 'Populating events list');
    if (!functions.getSetting('location', false)) {
        navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
    } else {
        var lon = functions.getSetting('lon', 0);
        var lat = functions.getSetting('lat', 0);
        if (lon && lat) {
            getEvents(lon, lat);
        } else {
            functions.showErrorCard('Error determining the custom location you have set.', loading);
        }
    }
};

Events.fetchCustom = function () {
    if (functions.getSetting('customgroups')) {
        loading = functions.showLoadingCard('Events', 'Populating events list');
        if (!functions.getSetting('location', false)) {
            navigator.geolocation.getCurrentPosition(locationSuccessCustom, locationError, locationOptions);
        } else {
            var lon = functions.getSetting('lon', 0);
            var lat = functions.getSetting('lat', 0);
            console.log('loading events for ' + functions.getSetting('customgroups'));
            if (lon && lat) {
                getEvents(lon, lat, functions.getSetting('customgroups'));
            } else {
                functions.showErrorCard('Error determining the custom location you have set.', loading);
            }
        }
    } else {
        functions.showErrorCard('You have no custom groups configured! Please add some in the settings!');
    }

};