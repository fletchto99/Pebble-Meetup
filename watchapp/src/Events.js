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

function locationSuccess(pos) {
    console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude);
    ajax({
        url: 'http://fletchto99.com/other/pebble/meetup/web/api.php',
        type: 'json',
        method: 'post',
        data:{
            lat:pos.coords.latitude,
            lon:pos.coords.longitude,
            distance:250,
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
                          group: data[i].group.name
                      };
                  }
                 var menu = new UI.Menu({
                      sections: [{
                          title: 'Events',
                          items: menuItems
                      }]
                  });
                 menu.on('select', function(event) {
                     functions.showCard(menuItems[event.itemIndex].title, '','Date:' + menuItems[event.itemIndex].subtitle + '\nLocation: ' + menuItems[event.itemIndex].location + '\nDistance:' + menuItems[event.itemIndex].distance + (menuItems[event.itemIndex].address ?'\nAddress:' + menuItems[event.itemIndex].address:'') + '\n' + menuItems[event.itemIndex].city + ', ' + (menuItems[event.itemIndex].state?(menuItems[event.itemIndex].state + ', '): '') + menuItems[event.itemIndex].country + '\nHost Group: ' + menuItems[event.itemIndex].group);
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
    loading = functions.showCard('Events', 'Loading...', '');
    navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
};