//Imports
var Settings = require('settings');
var functions = require('functions');

var radius = (Settings.data('radius')? 'radius='+encodeURIComponent(Settings.data('radius')) : '');
var units = (Settings.data('units')? '&units='+encodeURIComponent(Settings.data('units')) : '');
var location = (Settings.data('location')? '&location='+encodeURIComponent(Settings.data('location')) : '');
var address = (Settings.data('address')? '&address='+encodeURIComponent(Settings.data('address')) : '');
var lon = (Settings.data('lon')? '&lon='+encodeURIComponent(Settings.data('lon')) : '');
var lat = (Settings.data('lat')? '&lat='+encodeURIComponent(Settings.data('lat')) : '');
var events = (Settings.data('events')? '&evnets='+encodeURIComponent(Settings.data('events')) : '');


Settings.config(
    { url: ('http://fletchto99.com/other/pebble/meetup/web/settings.html?' + radius + units + location + address + lon + lat) },
    function(e) {
        if (!e.response){
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
        if (functions.getSetting('events')) {
            Pebble.timelineSubscriptions(
                function (topics) {
                    if (topics.indexOf('all-events') < 1 && functions.getSetting('events')) {
                        Pebble.timelineSubscribe('all-events',
                            function () {
                                console.log('Error subscribing to all events');
                            },
                            function (errorString) {
                                console.log('Error subscribing subscribing from all events');
                            }
                        );
                    } else if (topics.indexOf('all-events') > 0 && !functions.getSetting('events')) {

                    }
                },
                function (errorString) {
                    functions.showCard('Error!', '', 'Error determining subscription status!');
                });
        }
    }
);

//Setup the app
functions.setup();