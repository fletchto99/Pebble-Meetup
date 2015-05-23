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
        url: functions.getAPIURL(),
        type: 'json',
        method: 'post',
        data:{
            lat:lat,
            lon:lon,
            units: functions.getSetting('units', 'm'),
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
                     }
                 ];
                 if (typeof Pebble.timelineSubscriptions == 'function') {
                     optionItems.push({
                         title: 'Toggle Timeline',
                         subtitle: 'Events on Timeline.'
                     });
                 }
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
                     } else if (event.itemIndex === 3 && typeof Pebble.timelineSubscriptions == 'function') {
                         var subscribing = functions.showCard('Subscription...', (optionItems[3].title.indexOf('Toggle') < 0 ? optionItems[3].title.substring(0, optionItems[3].title.length-1) +'ing...' : 'Toggling Subscription'),'');
                         Pebble.timelineSubscriptions(
                             function (topics) {
                                 if (topics.indexOf(menuItems[eventIndex].id.toString()) > 0) {
                                     Pebble.timelineUnsubscribe(menuItems[eventIndex].id.toString(),
                                         function () {
                                             functions.showAndRemoveCard('Success!', '', 'You have unsubscribed from upcoming notifications about upcoming events with ' + menuItems[eventIndex].title + '.', subscribing);
                                             optionItems[3].title = 'Subscribe';
                                             options.items(0, optionItems);
                                         },
                                         function (errorString) {
                                             functions.showAndRemoveCard('Error!', '', 'Error unsubscribing from the group ' + menuItems[eventIndex].title + '.', subscribing);
                                             console.log('Error unsubscribing from group ' + menuItems[eventIndex].title + ' error code: ' + errorString);
                                         }
                                     );
                                 } else {
                                     Pebble.timelineSubscribe(menuItems[eventIndex].id.toString(),
                                         function () {
                                             functions.showAndRemoveCard('Success!', '', 'You have subscribed for timeline notifications about upcoming events with ' + menuItems[eventIndex].title + '.', subscribing);
                                             optionItems[3].title = 'Unsubscribe';
                                             options.items(0, optionItems);
                                         },
                                         function (errorString) {
                                             functions.showAndRemoveCard('Error!', '', 'Error subscribing to the group ' + menuItems[eventIndex].title + '. Error: ' + errorString, subscribing);
                                             console.log('Error subscribing to group ' + menuItems[eventIndex].title + ' error code: ' + errorString);
                                         }
                                     );
                                 }
                             },
                             function (errorString) {
                                 functions.showAndRemoveCard('Error!', '', 'Error determining subscription status!', subscribing);
                                 console.log('Error getting subscriptions to toggle subscription for group ' + menuItems[eventIndex].title + ' error code: ' +errorString);
                             }
                         );
                    }
                 });
                 menu.on('select', function(event) {
                     options.hide();
                     eventIndex = event.itemIndex;
                     if (typeof Pebble.timelineSubscriptions == 'function') {
                         var subscriptions = functions.showCard('Loading...', 'Determining group subscription status','');
                         Pebble.timelineSubscriptions(
                             function (topics) {
                                 if (topics.indexOf(menuItems[eventIndex].id.toString()) > 0) {
                                    optionItems[3].title = 'Unsubscribe';
                                    options.items(0, optionItems);
                                 } else {
                                     optionItems[3].title = 'Subscribe';
                                     options.items(0, optionItems);
                                 }
                                 subscriptions.hide();
                                 options.show();
                             },
                             function (errorString) {
                                 console.log('Error determining subscription stats for group ' + menuItems[eventIndex].title + ' error code: ' +errorString);
                                 subscriptions.hide();
                                 options.show();
                             }
                         );
                     } else {
                         options.show();
                     }
                 });
                 menu.show();
             }
         },
         function(error) {
             functions.showAndRemoveCard('Error', 'Error contacting server.', '', loading);
             console.log('Error loading groups ' + error)
         });
}

function locationSuccess(pos) {
    getGroups(pos.coords.longitude, pos.coords.latitude);
}

function locationError(err) {
    if (!typeof err == 'undefined') {
        functions.showAndRemoveCard('Error', 'Error determining location.', '', loading);
        console.log('location error (' + err.code + '): ' + err.message);
    } else {
        functions.showAndRemoveCard('Error', '', 'App not connected to the internet! This app requires an internet or data connection.', loading);
    }

}


// Make an asynchronous request

Groups.fetch = function fetch() { 
    loading = functions.showCard('Groups', 'Loading...', '');
    if (!functions.getSetting('location', false)) {
        navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
    } else {
        var lon = functions.getSetting('lon', 0);
        var lat = functions.getSetting('lat', 0);
        if (lon && lat) {
            getGroups(lon, lat);
        } else {
            functions.showAndRemoveCard('Error', 'Error using custom location.', '', loading);
        }
    }
};