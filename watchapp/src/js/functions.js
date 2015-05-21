var UI = require('ui');
var groups = require('Groups');
var events = require('Events');
var Settings = require('settings');

var functions = module.exports;

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
                subtitle: 'Find the closest groups.'
            },
            {
                title: 'Find Events',
                subtitle: 'Find upcoming events.'
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
            }
        });
};

functions.getSetting = function getSetting(setting) {
    return Settings.data(setting) !==null ? Settings.data(setting) : false;
};

functions.showCard = function showCard(title, subtitle, body) {
    return functions.showAndRemoveCard(title, subtitle, body, null);
};

functions.showAndRemoveCard = function showAndRemoveCard(title, subtitle, body, old) {
    if (old !== null) {
        old.hide();
    }
    var card = new UI.Card({title: title,subtitle: subtitle, body: body, scrollable: true});
    card.show();
    return card;
};

functions.updateCard = function updateCard(title, subtitle, card) {
    card.title(title);
    card.subtitle(subtitle);
    card.show();
};