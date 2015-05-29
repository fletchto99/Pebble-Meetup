var functions = require('functions');
var ajax = require('ajax');
var UI = require('ui');

var Members = module.exports;

var loading = null;
var menu = null;


// Make an asynchronous request

Members.fetchFor = function(id, attending, name) {
    if (menu !== null) {
        menu.hide();
        menu = null;
    }
    if (loading !== null) {
        loading.hide();
        loading = null;
    }
    loading = functions.showCard('Attending', 'Loading...', '', 'IMAGE_MEMBERS_ICON');
    ajax({
        url: functions.getAPIURL(),
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
                 functions.showAndRemoveCard('Error', data.error, '', loading, 'IMAGE_ERROR_ICON');
             } else {
                 loading.hide();
                 var menuItems = new Array(data.length);
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
             functions.showAndRemoveCard('Error', 'Error contacting server.', '', loading, 'IMAGE_ERROR_ICON');
         });
};