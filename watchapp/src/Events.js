var functions = require('functions');
var ajax = require('ajax');
var UI = require('ui');

var Events = module.exports;

var locationOptions = {
    enableHighAccuracy: true, 
    maximumAge: 10000, 
    timeout: 10000
};

var loading = null;
var groupID = -1;
var menu = null;
var options = null;
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
            distance: functions.getSetting('radius') ? functions.getSetting('radius') : 250,
            groupID: groupID,
            units: functions.getSetting('units') ? functions.getSetting('units') : 'm',
            method:'events'
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
                         subtitle: data[i].date,
                         city: data[i].venue.city,
                         state: data[i].venue.state,
                         country: data[i].venue.country,
                         date: data[i].date,
                         distance: data[i].distance,
                         location: data[i].venue.name,
                         address: data[i].venue.address_1,
                         group: data[i].group.name,
                         who: data[i].group.who,
                         attending: data[i].yes_rsvp_count
                     };
                 }
                 var optionItems = [
                     {
                         title: 'Get Info',
                         subtitle: 'Retrieve the event info.'
                     },
                     {
                         title: 'Pin Event',
                         subtitle: 'Add to Timeline.'
                     }
                 ];
                 menu = new UI.Menu({
                     sections: [{
                         title: 'Events',
                         items: menuItems
                     }]
                 });
                 options = new UI.Menu({
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
                         functions.showCard(menuItems[eventIndex].title, '','Date:' + menuItems[eventIndex].subtitle + '\nLocation: ' + menuItems[eventIndex].location + '\nDistance:' + menuItems[eventIndex].distance + (menuItems[eventIndex].address ?'\nAddress:' + menuItems[eventIndex].address:'') + '\n' + menuItems[eventIndex].city + ', ' + (menuItems[eventIndex].state?(menuItems[eventIndex].state + ', '): '') + menuItems[eventIndex].country +'\nAttending: '+ menuItems[eventIndex].attending + ' ' + menuItems[eventIndex].who + '\nHost Group: ' + menuItems[eventIndex].group);
                     } else if (event.itemIndex === 1) {
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
    functions.showAndRemoveCard('Error', 'Error determining location.', 'If you keep recieving this message, a manual location can be set in the settings.', loading);
    console.log('location error (' + err.code + '): ' + err.message);
}


// Make an asynchronous request

Events.fetch = function fetch() { 
    if (menu !== null) {
        menu.hide();
        menu = null;
    }
    if (options !== null) {
        options.hide();
        options = null;
    }
    if (loading !== null) {
        loading.hide();
        loading = null;
    }
    groupID = -1;
    loading = functions.showCard('Events', 'Loading...', '');
    navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
};

Events.fetchFor = function fetchFor(gid) { 
    if (menu !== null) {
        menu.hide();
        menu = null;
    }
    if (options !== null) {
        options.hide();
        options = null;
    }
    if (loading !== null) {
        loading.hide();
        loading = null;
    }
    groupID = gid;
    loading = functions.showCard('Events', 'Loading...', '');
    navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
};