var UI = require('ui');
var groups = require('Groups');
var events = require('Events');
var Settings = require('settings');
var about = require('About');
var config = require('Config.json');

var functions = module.exports;

//Functions
functions.init = function() {
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
                title: 'Pebble Groups',
                subtitle: 'Group list',
                icon: 'IMAGE_GROUP_ICON'
            },
            {
                title: 'Pebble Events',
                subtitle: 'Event list',
                icon: 'IMAGE_EVENT_ICON'
            },
            {
                title: 'My Groups',
                subtitle: 'Group list',
                icon: 'IMAGE_GROUP_ICON'
            },
            {
                title: 'My Events',
                subtitle: 'Event list',
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
                groups.fetchCustom(functions.getSetting('customgroups'));
            } else if (event.itemIndex === 3) {
                events.fetchCustom(functions.getSetting('customgroups'));
            } else if (event.itemIndex === 4) {
                about.fetch();
            }
        });
};

functions.getSetting = function(setting, default_setting) {
    if (!default_setting) {
        default_setting = false;
    }
    return Settings.data(setting) !==null ? Settings.data(setting) : default_setting;
};

functions.showCard = function(title, subtitle, body, icon) {
    return functions.showAndRemoveCard(title, subtitle, body, null, icon);
};

functions.showAndRemoveCard = function(title, subtitle, body, old, icon) {
    if (old !== null) {
        old.hide();
    }
    var card = new UI.Card({title: title,subtitle: subtitle, body: body, icon:icon, scrollable: true});
    card.show();
    return card;
};

functions.getVersionString = function() {
    return config.VERSION_STRING;
};

functions.getVersion = function() {
    return config.VERSION;
};

functions.getAPIURL = function() {
    return config.API_URL;
};