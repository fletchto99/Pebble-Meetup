var functions = require('functions');
var ajax = require('ajax');

var Event = module.exports;

var locationOptions = {
    enableHighAccuracy: true, maximumAge: 10000, timeout: 10000
};

var loading = null;
var result = null;
var eventID = null;

function display(lat, lon) {
    if (eventID !== null) {
        ajax({
            url: functions.getAPIURL(), type: 'json', method: 'post', data: {
                lat: lat,
                lon: lon,
                eventID: eventID,
                units: functions.getSetting('units', 'm'),
                method: 'event'
            }, cache: false
        }, function (data) {
            if (data.error) {
                result = functions.showErrorCard(data.error, loading);
            } else {
                var eventObj = {
                    title: data.name,
                    city: data.venue.city,
                    state: data.venue.state,
                    country: data.venue.country,
                    date: data.date,
                    distance: data.distance,
                    location: data.venue.name,
                    address: data.venue.address_1,
                    group: data.group.name,
                    who: data.group.who,
                    attending: data.yes_rsvp_count
                };

                result = functions.showCard(null, eventObj.name, '', 'Date: ' + eventObj.date + '\nLocation: ' + eventObj.location + (eventObj.location.toLowerCase() !== 'undetermined' ? '\nDistance: ' + eventObj.distance + (eventObj.address ? '\nAddress: ' + eventObj.address : '') + '\n' + eventObj.city + ', ' + (eventObj.state ? (eventObj.state + ', ') : '') + eventObj.country : '') + '\nAttending: ' + eventObj.yes_rsvp_count + ' ' + eventObj.who + '\nHost Group: ' + eventObj.group, functions.getColorOptions('DATA'), loading);
            }
        }, function () {
            result = functions.showErrorCard('Error retrieving event information!', loading);
        });
    } else {
        result = functions.showErrorCard('Error retrieving event information!', loading);
    }
}

function locationSuccess(pos) {
    display(pos.coords.longitude, pos.coords.latitude);
}

function locationError(err) {
    if (typeof err !== undefined) {
        functions.showErrorCard('Could not determine your location.\nIf you keep receiving this message, a manual location can be set in the settings.', loading);
        console.log('location error (' + err.code + '): ' + err.message);
    } else {
        functions.showErrorCard('App not connected to the internet! This app requires an internet or data connection.', loading);
    }
}

Event.fetchFor = function (eid) {
    if (result !== null) {
        result.hide();
    }
    if (loading !== null) {
        loading.hide();
    }
    eventID = eid;
    loading = functions.showLoadingCard('Event', 'Retrieving event information');
    console.log('Retrieving details for event timeline: ' + eventID);
    if (!functions.getSetting('location', false)) {
        navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
    } else {
        var lon = functions.getSetting('lon', 0);
        var lat = functions.getSetting('lat', 0);
        if (lon && lat) {
            display(lon, lat);
        } else {
            result = functions.showErrorCard('Error determining the custom location you have set.', loading);
        }
    }
};