var functions = require('functions');
var ajax = require('ajax');
var UI = require('ui');
var events = require('Events');
var members = require('Members');

var Groups = module.exports;

var locationOptions = {
    enableHighAccuracy: true, 
    maximumAge: 10000, 
    timeout: 10000
};

var loading = null;
var eventIndex = -1;

function getGroups(lon, lat) {
    console.log('lat= ' + lat + ' lon= ' + lon);
    ajax({
        url: 'http://fletchto99.com/other/pebble/meetup/web/api.php',
        type: 'json',
        method: 'post',
        data:{
            lat:lat,
            lon:lon,
            units: functions.getSetting('units') ? functions.getSetting('units') : 'm',
            method:'groups'
        },
        cache: false
    },
         function(data) {
             if (data.error) {
                 functions.showAndRemoveCard('Error', data.error, '', loading);
             } else {
                 loading.hide();
                 var menuItems = [data.length];
                 for(var i=0;i<data.length;i++){
                     menuItems[i] = {
                         title: data[i].name,
                         subtitle: "Distance: " + data[i].distance,
                         city: data[i].city,
                         state: data[i].state,
                         country: data[i].country,
                         id: data[i].id,
                         who: data[i].who,
                         members: data[i].members 
                     };
                 }
                 var optionItems = [
                     {
                         title: 'Get Info',
                         subtitle: 'Retrieve the group info.'
                     },
                     {
                         title: 'Members',
                         subtitle: 'List group\'s members.'
                     },
                     {
                         title: 'Find Events',
                         subtitle: 'Find group\'s events.'
                     },
                     {
                         title: 'Toggle Timeline',
                         subtitle: 'Events on Timeline.'
                     }
                 ];
                 var menu = new UI.Menu({
                     sections: [{
                         title: 'Groups',
                         items: menuItems
                     }]
                 });
                 var options = new UI.Menu({
                     sections: [{
                         title: 'Options',
                         items: optionItems
                     }]
                 });
                 options.on('select', function(event) {
                     if (eventIndex < 0 || eventIndex > menuItems.length -1) {
                         return;
                     }
                     if (event.itemIndex === 0) {
                         functions.showCard(menuItems[eventIndex].title, '', 'Location: ' + menuItems[eventIndex].city + ', ' + (menuItems[eventIndex].state?menuItems[eventIndex].state:menuItems[eventIndex].country ) + '\n' + menuItems[eventIndex].subtitle + '\nWe\'re ' + menuItems[eventIndex].members + ' ' + menuItems[eventIndex].who );
                     } else if (event.itemIndex == 1) {
                         members.fetchFor(menuItems[eventIndex].id,menuItems[eventIndex].members,menuItems[eventIndex].who);
                     } else if (event.itemIndex == 2) {
                         events.fetchFor(menuItems[eventIndex].id);
                     } else if (event.itemIndex === 3) {
                         Pebble.timelineSubscriptions(
                             function (topics) {
                                 functions.showCard("You are subscribed to " + topics.join(','));
                                 if (topics.indexOf(menuItems[eventIndex].id.toString()) > 0) {
                                     Pebble.timelineUnsubscribe(menuItems[eventIndex].id,
                                         function () {
                                             functions.showCard('Success!', '', 'You have unsubscribed from upcoming notifications about upcoming events with '+menuItems[eventIndex].titl+'.');
                                         },
                                         function (errorString) {
                                             functions.showCard('Error!', '', 'Error unsubscribing from the group ' + menuItems[eventIndex].title + '.');
                                         }
                                     );
                                 } else {
                                     Pebble.timelineSubscribe(menuItems[eventIndex].id,
                                         function () {
                                             functions.showCard('Success!', '', 'You have subscribed for timeline notifications about upcoming events with ' + menuItems[eventIndex].title + '.');
                                         },
                                         function (errorString) {
                                             functions.showCard('Error!', '', 'Error subscribing to the group ' + menuItems[eventIndex].title + '. Error: ' + errorString);
                                         }
                                     );
                                 }
                             },
                             function (errorString) {
                                 functions.showCard('Error!', '', 'Error determining subscription status!');
                             }
                         );
                    }
                 });
                 menu.on('select', function(event) {
                     eventIndex = event.itemIndex;
                     options.hide();
                     options.show();
                 });
                 menu.show();
             }
         },
         function(error) {
             functions.showAndRemoveCard('Error', 'Error contacting server.', '', loading);
         });
}

function locationSuccess(pos) {
    getGroups(pos.coords.longitude, pos.coords.latitude);
}

function locationError(err) {
    functions.showAndRemoveCard('Error', 'Error determining location.', '', loading);
    console.log('location error (' + err.code + '): ' + err.message);
}


// Make an asynchronous request

Groups.fetch = function fetch() { 
    loading = functions.showCard('Groups', 'Loading...', '');
    if (!functions.getSetting('location')) {
        navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
    } else {
        var lon = functions.getSetting('lon');
        var lat = functions.getSetting('lat');        
        if (lon && lat) {
            getGroups(lon, lat);
        } else {
            functions.showAndRemoveCard('Error', 'Error using custom location.', '', loading);
        }
    }
};