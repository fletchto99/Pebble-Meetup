var UI = require('ui');
var groups = require('Groups');
var events = require('Events');
var Settings = require('settings');

var functions = module.exports;

//Functions
functions.setup = function setup() { 
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
    console.log('Body is ' + body);
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