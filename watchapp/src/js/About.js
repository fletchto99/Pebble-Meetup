var functions = require('functions');
var ajax = require('ajax');
var UI = require('ui');

var About = module.exports;

// Make an asynchronous request

About.fetch = function fetch() {
    var loading = functions.showCard('Events', 'Loading...', '');
    ajax({
            url: functions.getAPIURL(),
            type: 'json',
            method: 'post',
            data:{
                method:'about',
                prerelease: functions.getSetting('prerelease', 0)
            },
            cache: false
        },
        function(data) {
            if (data.error) {
                functions.showAndRemoveCard('Meetup for Pebble', 'Version: 2.06', 'This is a minor app which allows users to check upcoming events in their area. Currently it supports searching for Pebble Meetups and Pebble Groups.', loading);
            } else {
                functions.showAndRemoveCard('Meetup for Pebble', 'Version: 2.06\nLatest: ' + data.Version_Code, data.Version_Details, loading);
            }
        },
        function(error) {
            functions.showAndRemoveCard('Pebble Meetup', 'Version: 2.0.6', 'This is a minor app which allows users to check upcoming events in their area. Currently it supports searching for Pebble Meetups and Pebble Groups.', loading);
        });
};