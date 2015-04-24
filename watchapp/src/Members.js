var functions = require('functions');
var ajax = require('ajax');
var UI = require('ui');

var Members = module.exports;

var loading = null;
var menu = null;


// Make an asynchronous request

Members.fetchFor = function fetchFor(id, attending, name) { 
    if (menu !== null) {
        menu.hide();
        menu = null;
    }
    if (loading !== null) {
        loading.hide();
        loading = null;
    }
    loading = functions.showCard('Attending', 'Loading...', '');
    ajax({
        url: 'http://fletchto99.com/other/pebble/meetup/web/api.php',
        type: 'json',
        method: 'post',
        data:{
            groupID: id,
            method:'members'
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
                         title: data[i].name
                     };
                 }
                 menu = new UI.Menu({
                     sections: [{
                         title: 'We\'re ' + attending + ' ' + name,
                         items: menuItems
                     }]
                 });
                 menu.show();
             }
         },
         function(error) {
             functions.showAndRemoveCard('Error', 'Error contacting server.', '', loading);
         });
};