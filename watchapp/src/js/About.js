var functions = require('functions');
var ajax = require('ajax');

var About = module.exports;

About.fetch = function () {
    var loading = functions.showLoadingCard('About', 'Retrieving version information');
    ajax({
            url: functions.getAPIURL(), type: 'json', method: 'post', data: {
                method: 'about', prerelease: functions.getSetting('prerelease', 0)
            }, cache: false
        }, function (data) {
            if (data.error) {
                functions.showCard(null, 'Meetup for Pebble', 'Version: ' + functions.getVersionString(), 'This is a minor app which allows users to check upcoming events in their area. Currently it supports searching for Pebble Meetups and Pebble Groups.', functions.getColorOptions('DATA'), loading);
            } else {
                functions.showCard(null, 'Meetup for Pebble', 'Version: ' + functions.getVersionString() + '\nLatest: ' + data.Version_Code, data.Version_Description, functions.getColorOptions('DATA'), loading);
            }
        }, function () {
            functions.showCard(null, 'Pebble Meetup', 'Version: ' + functions.getVersionString(), 'This is a minor app which allows users to check upcoming events in their area. Currently it supports searching for Pebble Meetups and Pebble Groups.', functions.getColorOptions('DATA'), loading);
        });
};