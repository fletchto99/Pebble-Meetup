//Imports
var Settings = require('settings');
var functions = require('functions');
var config = require('Config.json');


Settings.config({url: config.SETTINGS_URL }, function (e) {
        if (!e.response) {
            console.log("No response from server?");
            functions.showErrorCard('Error saving Meetup settings!');
            return;
        }
        if (typeof Pebble.timelineSubscriptions == 'function') {
            Pebble.timelineSubscriptions(function (topics) {
                    if (topics.indexOf('all-events') < 1 && functions.getSetting('events', false)) {
                        Pebble.timelineSubscribe('all-events', function () {
                                functions.showCard('IMAGE_SUBSCRIBE_ICON', 'Success','', 'You have subscribed to notifications for all events!')
                            }, function (errorString) {
                                console.log('Error subscribing from all events! ' + errorString);
                            });
                    } else if (topics.indexOf('all-events') > 0 && !functions.getSetting('events', false)) {
                        Pebble.timelineUnsubscribe('all-events', function () {
                                functions.showCard('IMAGE_UNSUBSCRIBE_ICON', 'Success','', 'You have removed your subscription to notifications for all events!')
                            }, function (errorString) {
                                console.log('Error removing subscription from all events! ' + errorString);
                            });
                    }
                }, function (errorString) {
                });
        } else {
            console.log('All events subscription not supported on SDK 2.9');
        }
    });

console.log("Displaying splash screen");
//Setup the app
setTimeout(function() {
    console.log("init stage");
    functions.init();
    console.log("Done init stage");
}, 800);