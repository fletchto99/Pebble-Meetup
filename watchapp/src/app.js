//Imports
var Settings = require('settings');
var functions = require('functions');

Settings.config(
  { url: ('http://fletchto99.com/other/pebble/meetup/web/settings.html?' + (Settings.data('radius')? 'radius='+encodeURIComponent(Settings.data('radius')) : '') + (Settings.data('units')? '&units='+encodeURIComponent(Settings.data('units')) : '')) },
  function(e) {
    if (!e.response){
        return;
    }
    var data = JSON.parse(decodeURIComponent(e.response));
    Settings.data('radius', data.radius);
    Settings.data('units', data.units);
  }
);

//Setup the app
functions.setup();