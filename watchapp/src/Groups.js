var functions = require('functions');
var ajax = require('ajax');
var UI = require('ui');

var Groups = module.exports;

var locationOptions = {
    enableHighAccuracy: true, 
    maximumAge: 10000, 
    timeout: 10000
};

var loading = null;

function locationSuccess(pos) {
    console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude);
    ajax({
        url: 'http://fletchto99.com/other/pebble-meetup/api.php',
        type: 'json',
        method: 'post',
        data:{
            lat:pos.coords.latitude,
            long:pos.coords.longitude,
          //  radius:100,
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
                          subtitle: data[i].state
                      };
                  }
                 var menu = new UI.Menu({
                      sections: [{
                          title: 'Groups',
                          items: menuItems
                      }]
                  });
                 
                 menu.show();
             }
         },
         function(error) {
             functions.showAndRemoveCard('Error', 'Error contacting server.', '', loading);
         });
}

function locationError(err) {
    console.log('location error (' + err.code + '): ' + err.message);
}


// Make an asynchronous request

Groups.fetch = function fetch() { 
    loading = functions.showCard('Groups', 'Loading...', '');
    navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
};