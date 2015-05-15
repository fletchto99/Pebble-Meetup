var config = require('./Configuration.json');
var request = require('request');
var winston = require('winston');
var meetup = require('meetup-api')({
    key: config.MEETUP_API_KEY
});


var ids = [];

function setNewIDs(onComplete, onFail) {
    winston.log('info','Fetching group ids...');
    request({
        method:'post',
        url: config.API_URL,
        json: true,
        body:   {method: 'groupids'}
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            if (body.groups) {
                ids = body.groups;
                winston.log('info','Now listening for events in '+ids.length+' groups with the ids: ' + ids.join(", "));
                if (onComplete !== undefined && onComplete !== null) {
                    onComplete();
                }
            } else {
                winston.log('info','Error fetching Pebble Group Ids');
                if (onFail !== onFail && onFail !== null) {
                    onFail();
                }
                if (ids.length > 0) {
                    winston.log('info','Still using ids ' + ids.join(', '))
                }
            }
        }
    });
}

function getLastEventTime(onComplete) {
    winston.log('info','Fetching last mtime...');
    request({
        method:'post',
        url: config.API_URL,
        json: true,
        body:   {method: 'mtime'}
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            if (body.mtime && body.mtime != 'Empty') {
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
    winston.log('info','Sending event ' + id + '...')
    request({
        method:'post',
        url: API_URL,
        json: true,
        body:   {method: 'multieventnotify',eventID:id}
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            if (body.message) {
                winston.log('info',body.message);
            } else if (body.error) {
                winston.log('info',body.error);
            }
        }
    });
}

function startStream(mtime) {
    if (mtime !== undefined && !isNaN(mtime)) {
        winston.log('info','Starting stream from mtime: ' + mtime);
    } else {
        winston.log('info','No mtime found! Starting stream from current time...');
        mtime = Date.now();
    }
    meetup.getStreamOpenEvents({
        since_mtime: mtime
    }).on('data', function(obj) {
        processStreamData(obj);
    }).on('end', function () {
        winston.log('info', 'Events stream closed. Attempting to restart stream...');
        getLastEventTime(startStream);
    });
}

function processStreamData(obj) {
    if (obj.group.id !== null && obj.group.id !== undefined && obj.id !== null && obj.id !== undefined && obj.mtime !== null && obj.mtime !== undefined) {
        if (!isNaN(obj.group.id) && !isNaN(obj.mtime) && !isNaN(obj.id)) {
            var eventID = parseInt(obj.id);
            var groupID = parseInt(obj.group.id);
            var mtime = parseInt(obj.mtime);
            if (ids.indexOf(groupID) > 0) {
                winston.log('info','Event for group: ' + groupID + '... It is a pebble event :) eID: ' + eventID);
                sendEvent(eventID);
                setLastEventTime(mtime);
            } else {
                winston.log('info','Event for group: ' + groupID + '... Not a pebble event :( eID: ' + eventID);
                setLastEventTime(mtime);
            }
        }
    }
}

function setup() {
    setInterval(setNewIDs, 900000);
    winston.add(winston.transports.File, { filename: 'console.log' });
    getLastEventTime(startStream);
}

function exit() {
    process.exit(0);
}

setNewIDs(setup, exit);
