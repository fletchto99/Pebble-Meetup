var UI = require('ui');
var groups = require('Groups');

var functions = module.exports;

//Functions
functions.setup = function setup() { 
        var menuItems = [
            {
                title: 'Find Group',
                subtitle: 'Find the closest group.'
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
            }
        });
};


functions.showCard = function showCard(title, subtitle, body) {
    console.log('Body is ' + body);
    return functions.showAndRemoveCard(title, subtitle, body, null);
};

functions.showAndRemoveCard = function showAndRemoveCard(title, subtitle, body, old) {
    if (old !== null) {
        old.hide();
    }
    var card = new UI.Card({title: title,subtitle: subtitle, body: body});
    card.show();
    return card;
};

functions.updateCard = function updateCard(title, subtitle, card) {
    card.title(title);
    card.subtitle(subtitle);
    card.show();
};