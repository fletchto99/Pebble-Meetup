var functions = require('functions');
var ajax = require('ajax');
var UI = require('ui');

var About = module.exports;

// Make an asynchronous request

About.fetch = function fetch() {
    var loading = functions.showCard('About', 'Loading...', '', 'IMAGE_INFO_ICON');
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
                functions.showAndRemoveCard('Meetup for Pebble', 'Version: ' + functions.getVersionString(), 'This is a minor app which allows users to check upcoming events in their area. Currently it supports searching for Pebble Meetups and Pebble Groups.', loading);
            } else {
                functions.showAndRemoveCard('Meetup for Pebble', 'Version: ' + functions.getVersionString() +'\nLatest: ' + data.Version_Code, data.Version_Description, loading);
            }
        },
        function(error) {
            functions.showAndRemoveCard('Pebble Meetup', 'Version: ' + functions.getVersionString(), 'This is a minor app which allows users to check upcoming events in their area. Currently it supports searching for Pebble Meetups and Pebble Groups.', loading);
        });
};