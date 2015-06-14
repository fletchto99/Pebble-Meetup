var UI = require('ui');
var Timeline = require('timeline');
var groups = require('Groups');
var event = require('Event');
var events = require('Events');
var Settings = require('settings');
var about = require('About');
var changes = require('Changes');
var config = require('Config.json');

var functions = module.exports;

//Functions
functions.init = function () {
    if (typeof Pebble.timelineSubscriptions == 'function') {
        Pebble.timelineSubscriptions(function (topics) {
                if (topics.indexOf('notifications') < 1) {
                    Pebble.timelineSubscribe('notifications', function () {
                            console.log('Successfully subscribed to notifications!')
                        }, function (errorString) {
                            console.log('Error subscribing to notifications ' + errorString);
                            //Error subscribing to notifications -- keep the error transparent to the user
                        });
                } else {
                    console.log('Already subscribed to notifications!')
                }
            }, function (errorString) {
                console.log('Error listing timeline subscriptions ' + errorString);
                //Error subscribing to notifications -- keep the error transparent to the user
            });
    }
    var menuItems = [{
        title: 'Pebble Groups', subtitle: 'Group list', icon: 'IMAGE_PEBBLE_GROUP_ICON'
    }, {
        title: 'Pebble Events', subtitle: 'Event list', icon: 'IMAGE_EVENT_ICON'
    }, {
        title: 'My Groups', subtitle: 'Group list', icon: 'IMAGE_GROUP_ICON'
    }, {
        title: 'My Events', subtitle: 'Event list', icon: 'IMAGE_EVENT_ICON'
    }, {
        title: 'About', icon: 'IMAGE_INFO_ICON'
    }];
    var mainMenu = new UI.Menu({
        sections: [{
            title: 'Pebble Meetup', items: menuItems
        }]
    });
    mainMenu.show();
    var registerHandlers = function() {
        mainMenu.on('select', function (event) {
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
    Timeline.launch(function(timelineEvent) {
        if (timelineEvent.action) {
            registerHandlers();
            event.fetchFor(timelineEvent.launchCode);
        } else {
            if (!functions.getSetting('firstrun')) {
                functions.showCard('IMAGE_WELCOME_ICON', 'Welcome', '', 'Thank you for choosing to use Meetup for Pebble! We hope you enjoy the app.', functions.getColorOptions('DATA'));
                Settings.data('firstrun', true);
                Settings.data('latestver', functions.getVersionString());
            } else if (functions.getVersionString() != functions.getSetting('latestver')) {
                changes.fetch();
                Settings.data('latestver', functions.getVersionString());
            }
            registerHandlers();
        }
    });
};

functions.getSetting = function (setting, default_setting) {
    if (!default_setting) {
        default_setting = false;
    }
    return Settings.data(setting) !== null ? Settings.data(setting) : default_setting;
};


functions.showErrorCard = function(errorMessage, cardToHide) {
    return functions.showCard('IMAGE_ERROR_ICON', 'Error!', '', errorMessage, functions.getColorOptions('ERROR'), cardToHide);
};

functions.showLoadingCard = function(module, loadingMessage) {
    return functions.showCard('IMAGE_LOADING_ICON', 'Loading', module, loadingMessage, functions.getColorOptions('LOADING'));
};

functions.showCard = function (icon, title, subtitle, body, colorOptions, cardToHide) {
    if (cardToHide !== undefined) {
        cardToHide.hide();
    }
    if (icon !== null) {
        title = '   ' + title;
    }
    scrollable = body != null && body.length > 0;
    var card = new UI.Card({
        title: title,
        titleColor: colorOptions.titleColor ? colorOptions.titleColor : 'blue',
        subtitle: subtitle,
        subtitleColor: colorOptions.subtitleColor ? colorOptions.subtitleColor : 'black',
        body: body,
        bodyColor: colorOptions.bodyColor ? colorOptions.bodyColor : 'black',
        icon: icon,
        scrollable: scrollable
    });
    card.show();
    return card;
};

functions.getVersionString = function () {
    return config.VERSION_STRING;
};

functions.getVersion = function () {
    return config.VERSION;
};

functions.getAPIURL = function () {
    return config.API_URL;
};

functions.getColorOptions = function(type) {
    if (Pebble.timelineSubscribe === undefined) {
        return {titleColor: 'black', subtitleColor: 'black', bodyColor: 'black'};
    }
    switch(type){
        case 'ERROR':
            return {titleColor: 'red', subtitleColor: 'black', bodyColor: 'black'};
        case 'SUCCESS':
            return {titleColor: 'islamicGreen', subtitleColor: 'black', bodyColor: 'black'};
        case 'LOADING':
            return {titleColor: 'blue', subtitleColor: 'black', bodyColor: 'black'};
        case 'DATA':
            return {titleColor: 'orange', subtitleColor: 'black', bodyColor: 'black'};
        default:
            return {titleColor: 'black', subtitleColor: 'black', bodyColor: 'black'};
    }

};