var meetup = require('meetup-api');
var request = require('request');
var count = 1;

var api = 'http://fletchto99.com/other/pebble/meetup/web/api.php';
var ids = [];

function setNewIDs() {
    request({
        method:'post',
        url: api,
        json: true,
        body:   {method: 'groupids'}
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            if (body.groups) {
                ids = body.groups;
            }
        }
    });
}

function sendEvent(id) {
    request({
        method:'post',
        url: api,
        json: true,
        body:   {method: 'multieventnotify',eventID:id}
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            if (body.groups) {
                ids = body.groups;
            }
        }
    });
}

setNewIDs();
setInterval(setNewIDs, 900000);
//
//var ws = meetup.getStreamOpenEvents()
//    .on('data', function(obj) {
//        console.log(obj.group.id);
//        if (obj.group.id !== null && obj.group.id !== undefined) {
//            var intID = parseInt()
//            if (ids.index(intID) > 0) {
//                sendEvent(intID);
//            }
//        }
//
//
//    }).on('close', function() {
//        var since_mtime = Date.now();
//    });