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
    console.log("init called...");
    if (typeof Pebble.timelineSubscriptions == 'function') {
        console.log("Checking for notifications");
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
    console.log("Creating menuitems");
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
    console.log("Creating menu");
    var mainMenu = new UI.Menu({
        backgroundColor: functions.colorMap(functions.getSetting('menubgcolor', 'FFFFFF')),
        textColor: functions.colorMap(functions.getSetting('menutextcolor', '000000')),
        highlightBackgroundColor: functions.colorMap(functions.getSetting('hmenubgcolor', '000000')),
        highlightTextColor: functions.colorMap(functions.getSetting('hmenutextcolor', 'FFFFFF')),
        sections: [{
            title: 'Pebble Meetup', items: menuItems
        }]
    });
    console.log("Displaying menu");
    mainMenu.show();
    var registerHandlers = function() {
        console.log("Registering menu handlers");
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
    console.log("Checking for special launch");
    Timeline.launch(function(timelineEvent) {
        if (timelineEvent.action) {
            registerHandlers();
            console.log("Special launch found, launchcode: " + timelineEvent.launchCode);
            event.fetchFor(timelineEvent.launchCode);
        } else {
            if (!functions.getSetting('firstrun')) {
                console.log("First run launch, enjoy the app!");
                functions.showCard('IMAGE_WELCOME_ICON', 'Welcome', '', 'Thank you for choosing to use Meetup for Pebble! We hope you enjoy the app.', functions.getColorOptions('DATA'));
                Settings.option('firstrun', true);
                Settings.option('latestver', functions.getVersionString());
            } else if (functions.getVersionString() != functions.getSetting('latestver')) {
                console.log("Updated version! Displaying new version information.");
                changes.fetch();
                Settings.option('latestver', functions.getVersionString());
            }
            registerHandlers();
        }
    });
};

functions.getSetting = function (setting, default_setting) {
    if (!default_setting) {
        default_setting = false;
    }
    return Settings.option(setting) !== null ? Settings.option(setting) : default_setting;
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
    card.on('click', function(e) {
        if (e.button == 'select') {
            console.log('clicked');
            card.hide();
        }
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

functions.colorMap = function(hexcode) {
    switch(hexcode) {
        case '000000':
            return 'black';
        case 'FFFFFF':
            return 'white';
        case 'AAAAAA':
            return 'lightGrey';
        case '555555':
            return 'darkGrey';
        case 'FFFFAA':
            return 'pastelYellow';
        case 'FFFF55':
            return 'icterine';
        case 'FFAA55':
            return 'rajah';
        case 'FF5500':
            return 'orange';
        case 'FF0000':
            return 'red';
        case 'FF0055':
            return 'folly';
        case 'FF5555':
            return 'sunsetOrange';
        case 'FFAAAA':
            return 'melon';
        case 'FFFF00':
            return 'yellow';
        case 'FFAA00':
            return 'chromeYellow';
        case 'AA5500':
            return 'windsorTan';
        case 'AA5555':
            return 'roseVale';
        case 'AA0000':
            return 'darkCandyAppleRed';
        case 'FF00AA':
            return 'fashionMagenta';
        case 'FF55AA':
            return 'brilliantRose';
        case 'FFAAFF':
            return 'richBrilliantLavender';
        case 'AAAA00':
            return 'limerick';
        case '550000':
            return 'bulgarianRose';
        case '550055':
            return 'imperialPurple';
        case 'AA00AA':
            return 'purple';
        case 'AA55AA':
            return 'purpures';
        case '55AA00':
            return 'kellyGreen';
        case '005500':
            return 'darkGreen';
        case '005555':
            return 'midnightGreen';
        case '000055':
            return 'oxfordBlue';
        case '5500AA':
            return 'indigo';
        case 'AA00FF':
            return 'vividViolet';
        case 'AA55FF':
            return 'lavenderIndigo';
        case 'AAFF55':
            return 'inchworm';
        case 'AAFF00':
            return 'springBud';
        case '55FF00':
            return 'brightGreen';
        case '00FF00':
            return 'green';
        case '00AA00':
            return 'islamicGreen';
        case '55AA55':
            return 'mayGreen';
        case '55AAAA':
            return 'cadetBlue';
        case '0055AA':
            return 'cobaltBlue';
        case '0000AA':
            return 'darkBlue';
        case '5500FF':
            return 'electricUltramarine';
        case '5555AA':
            return 'liberty';
        case 'AAFFAA':
            return 'mintGreen';
        case '55FF55':
            return 'screaminGreen';
        case '00FF55':
            return 'malachite';
        case '00AA55':
            return 'jaegerGreen';
        case '00AAAA':
            return 'tiffanyBlue';
        case '00AAFF':
            return 'vividCerulean';
        case '0000FF':
            return 'blue';
        case '5555FF':
            return 'veryLightBlue';
        case 'AAAAFF':
            return 'babyBlueEyes';
        case '55FFAA':
            return 'mediumAquamarine';
        case '00FFAA':
            return 'mediumSpringGreen';
        case '00FFFF':
            return 'cyan';
        case '55AAFF':
            return 'pictonBlue';
        case '0055FF':
            return 'blueMoon';
        case '55FFFF':
            return 'electricBlue';
        case 'AAFFFF':
            return 'celeste';
        default:
            return 'black';
    }
};