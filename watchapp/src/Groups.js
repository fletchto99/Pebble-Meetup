var functions = require('functions');
var ajax = require('ajax');
var UI = require('ui');
var events = require('Events');

var Groups = module.exports;

var locationOptions = {
    enableHighAccuracy: true, 
    maximumAge: 10000, 
    timeout: 10000
};

var loading = null;
var eventIndex = -1;

function locationSuccess(pos) {
    console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude);
    ajax({
        url: 'http://fletchto99.com/other/pebble/meetup/web/api.php',
        type: 'json',
        method: 'post',
        data:{
            lat:pos.coords.latitude,
            lon:pos.coords.longitude,
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
                 var menuItems = Array(data.length);
                 for(var i=0;i<data.length;i++){
                     menuItems[i] = {
                         title: data[i].name,
                         subtitle: "Distance: " + data[i].distance,
                         city: data[i].city,
                         state: data[i].state,
                         country: data[i].country,
                         id: data[i].id
                     };
                 }
                 var optionItems = [
                     {
                         title: 'Get Info',
                         subtitle: 'Retrieve the group info.'
                     },
                     {
                         title: 'Find Events',
                         subtitle: 'Find group\'s events.'
                     },
                     {
                         title: 'Subscribe',
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
                         functions.showCard(menuItems[eventIndex].title, '', 'Location: ' + menuItems[eventIndex].city + ', ' + (menuItems[eventIndex].state?menuItems[eventIndex].state:menuItems[eventIndex].country ) + '\n' + menuItems[eventIndex].subtitle );
                     } else if (event.itemIndex == 1) {
                         events.fetchFor(menuItems[eventIndex].id);
                     } else if (event.itemIndex === 2) {
                         functions.showCard('Sorry!', '', 'This functions is not yet implemented!');
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

function locationError(err) {
    functions.showAndRemoveCard('Error', 'Error determining location.', '', loading);
    console.log('location error (' + err.code + '): ' + err.message);
}


// Make an asynchronous request

Groups.fetch = function fetch() { 
    loading = functions.showCard('Groups', 'Loading...', '');
    navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
};