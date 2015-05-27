var UI = require('ui');
var groups = require('Groups');
var events = require('Events');
var Settings = require('settings');
var about = require('About');

var functions = module.exports;

const VERSION = 2.08;
const API_URL = 'http://fletchto99.com/other/pebble/meetup/web/api.php';

//Functions
functions.setup = function setup() {
        if (typeof Pebble.timelineSubscriptions == 'function') {
            Pebble.timelineSubscriptions(
                function (topics) {
                    if (topics.indexOf('notifications') < 1) {
                        Pebble.timelineSubscribe('notifications',
                            function () {
                                console.log('Successfully subscribed to notifications!')
                            },
                            function (errorString) {
                                console.log('Error subscribing to notifications ' + errorString);
                                //Error subscribing to notifications -- keep the error transparent to the user
                            }
                        );
                    } else {
                        console.log('Already subscribed to notifications!')
                    }
                },
                function (errorString) {
                    console.log('Error listing timeline subscriptions ' + errorString);
                    //Error subscribing to notifications -- keep the error transparent to the user
                });
        }
        var menuItems = [
            {
                title: 'Find Groups',
                subtitle: 'Pebble Groups',
                icon: 'IMAGE_GROUP_ICON'
            },
            {
                title: 'Find Events',
                subtitle: 'Pebble Events',
                icon: 'IMAGE_EVENT_ICON'
            },
            {
                title: 'About',
                icon: 'IMAGE_INFO_ICON'
            }
        ];
        var mainMenu = new UI.Menu({
            sections: [{
                title: 'Pebble Meetup',
                items: menuItems
            }]
        });
        mainMenu.show();
        mainMenu.on('select', function(event) {                 
            if (event.itemIndex === 0) {
                groups.fetch();
            } else if (event.itemIndex === 1) {
                events.fetch();
            } else if (event.itemIndex === 2) {
                about.fetch();
            }
        });
};

functions.getSetting = function getSetting(setting, default_setting) {
    if (!default_setting) {
        default_setting = false;
    }
    return Settings.data(setting) !==null ? Settings.data(setting) : default_setting;
};

functions.showCard = function showCard(title, subtitle, body, icon) {
    return functions.showAndRemoveCard(title, subtitle, body, null, icon);
};

functions.showAndRemoveCard = function showAndRemoveCard(title, subtitle, body, old, icon) {
    if (old !== null) {
        old.hide();
    }
    var card = new UI.Card({title: title,subtitle: subtitle, body: body, icon:icon, scrollable: true});
    card.show();
    return card;
};

functions.getVersion = function() {
    return VERSION;
};

functions.getAPIURL = function() {
    return API_URL;
};