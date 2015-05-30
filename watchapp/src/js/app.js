//Imports
var Settings = require('settings');
var functions = require('functions');

var radius = (Settings.data('radius') ? 'radius=' + encodeURIComponent(Settings.data('radius')) : '');
var units = (Settings.data('units') ? '&units=' + encodeURIComponent(Settings.data('units')) : '');
var location = (Settings.data('location') ? '&location=' + encodeURIComponent(Settings.data('location')) : '');
var address = (Settings.data('address') ? '&address=' + encodeURIComponent(Settings.data('address')) : '');
var lon = (Settings.data('lon') ? '&lon=' + encodeURIComponent(Settings.data('lon')) : '');
var lat = (Settings.data('lat') ? '&lat=' + encodeURIComponent(Settings.data('lat')) : '');
var events = (Settings.data('events') ? '&events=' + encodeURIComponent(Settings.data('events')) : '');
var prerelease = (Settings.data('prerelease') ? '&prerelease=' + encodeURIComponent(Settings.data('prerelease')) : '');
var customgroups = (Settings.data('customgroups') ? '&customgroups=' + encodeURIComponent(Settings.data('customgroups')) : '');


Settings.config({url: ('http://fletchto99.com/other/pebble/meetup/web/settings.html?' + radius + units + location + address + lon + lat + events + prerelease + customgroups)}, function (e) {
        if (!e.response) {
            console.log("No response from server?");
            return;
        }
        var data = JSON.parse(decodeURIComponent(e.response));
        Settings.data('radius', data.radius);
        Settings.data('units', data.units);
        Settings.data('location', data.location);
        Settings.data('address', data.address);
        Settings.data('lat', data.lat);
        Settings.data('lon', data.lon);
        Settings.data('events', data.events);
        Settings.data('prerelease', data.prerelease);
        Settings.data('customgroups', data.customgroups);
        if (typeof Pebble.timelineSubscriptions == 'function') {
            Pebble.timelineSubscriptions(function (topics) {
                    if (topics.indexOf('all-events') < 1 && functions.getSetting('events', false)) {
                        Pebble.timelineSubscribe('all-events', function () {
                                functions.showCard('Success', 'You have subscribed to notifications for all events!', '')
                            }, function (errorString) {
                                console.log('Error subscribing from all events');
                            });
                    } else if (topics.indexOf('all-events') > 0 && !functions.getSetting('events', false)) {
                        Pebble.timelineUnsubscribe('all-events', function () {
                                functions.showCard('Success', 'You have removed your subscription to notifications for all events!', '')
                            }, function (errorString) {
                                console.log('Error removing subscription from all events!');
                            });
                    }
                }, function (errorString) {
                });
        } else {
            console.log('All events subscription not supported on SDK 2.9');
        }
    });

//Setup the app
functions.init();