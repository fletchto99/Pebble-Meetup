var config = require('./Configuration.json');
var request = require('request');
var meetup = require('meetup-api')({
    key: config.MEETUP_API_KEY
});


var ids = [];

function setNewIDs(onComplete, onFail) {
    console.log('Fetching group ids...');
    request({
        method:'post',
        url: config.API_URL,
        json: true,
        body:   {method: 'groupids'}
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            if (body.groups) {
                ids = body.groups;
                console.log('Now listening for events in '+ids.length+' groups with the ids: ' + ids.join(", "));
                if (onComplete !== undefined && onComplete !== null) {
                    onComplete();
                }
            } else {
                console.log('Error fetching Pebble Group Ids');
                if (onFail !== onFail && onFail !== null) {
                    onFail();
                }
                if (ids.length > 0) {
                    console.log('Still using ids ' + ids.join(', '))
                }
            }
        }
    });
}

function getLastEventTime(onComplete) {
    console.log('Fetching last mtime...');
    request({
        method:'post',
        url: config.API_URL,
        json: true,
        body:   {method: 'mtime'}
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            if (body.mtime && body.mtime != 'empty') {
                onComplete(parseInt(body.mtime));
            } else {
                onComplete();
            }
        }
    });
}

function setLastEventTime(mTime) {
    request({
        method:'post',
        url: config.API_URL,
        json: true,
        body:   {method: 'mtime',mtime:mTime}
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {

        }
    });
}

function sendEvent(id) {
    console.log('Sending event ' + id + '...')
    request({
        method:'post',
        url: API_URL,
        json: true,
        body:   {method: 'multieventnotify',eventID:id}
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            if (body.message) {
                console.log(body.message);
            } else if (body.error) {
                console.log(body.error);
            }
        }
    });
}

function startStream(mtime) {
    if (mtime !== undefined && !isNaN(mtime)) {
        console.log('Starting stream from mtime: ' + mtime);
    } else {
        console.log('No mtime found! Starting stream from current time...');
        mtime = Date.now();
    }
    meetup.getStreamOpenEvents({
        since_mtime: mtime
    }).on('data', function(obj) {
        processStreamData(obj);
    }).on('end', function () {
        //TODO: Reopen stream/restart program?
    });
}

function processStreamData(obj) {
    if (obj.group.id !== null && obj.group.id !== undefined && obj.id !== null && obj.id !== undefined && obj.mtime !== null && obj.mtime !== undefined) {
        if (!isNaN(obj.group.id) && !isNaN(obj.mtime) && !isNaN(obj.id)) {
            var eventID = parseInt(obj.id);
            var groupID = parseInt(obj.group.id);
            var mtime = parseInt(obj.mtime);
            if (ids.indexOf(groupID) > 0) {
                console.log('Event for group: ' + groupID + '... It is a pebble event :) eID: ' + eventID);
                sendEvent(eventID);
                setLastEventTime(mtime);
            } else {
                console.log('Event for group: ' + groupID + '... Not a pebble event :( eID: ' + eventID);
                setLastEventTime(mtime);
            }
        }
    }
}

function setup() {
    setInterval(setNewIDs, 900000);
    getLastEventTime(startStream);
}

function exit() {
    process.exit(0);
}

setNewIDs(setup, exit);
