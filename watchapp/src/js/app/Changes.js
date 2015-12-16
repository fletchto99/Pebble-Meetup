var functions = require('functions');
var ajax = require('ajax');
var UI = require('ui');

var Changes = module.exports;

Changes.fetch = function () {
    var loading = functions.showLoadingCard('Changelog', 'Retrieving new version information');
    ajax({
        url: functions.getAPIURL(), type: 'json', method: 'post', data: {
            method: 'changes',
            version: functions.getVersionString()
        }, cache: false
    }, function (data) {
        if (data.error) {
            functions.showErrorCard('Could not load change log. Please use the pebble app to view the changes.', loading);
        } else {
            functions.showCard('IMAGE_CHANGES_ICON', 'Changelog', 'Version: ' + functions.getVersionString(), data.Version_Changes.split('\\n').join('\n'), functions.getColorOptions('DATA'), loading);
        }
    }, function () {
        functions.showErrorCard('Could not load change log. Please use the pebble app to view the changes.', loading);
    });
};