var config = require('./Configuration.json');
var request = require('request');
var winston = require('winston');
var meetup = require('meetup-api')({
    key: config.MEETUP_API_KEY
});


var ids = [];
var skipped = 0;
var processed = 0;
var totalSkipped = 0;
var totalProcessed = 0;

function setNewIDs(onComplete, onFail) {
    winston.log('info', 'Fetching group ids...');
    request({
        method:'post',
        url: config.API_URL,
        json: true,
        body:   {method: 'groupids'}
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            if (body.groups) {
                ids = body.groups;
                winston.log('info', 'Now listening for events in '+ids.length+' groups with the ids: ' + ids.join(", "));
                if (skipped > 0) {
                    winston.log('info', 'There have been ' + skipped + ' non-pebble events skipped in the last 15 minutes');
                    winston.log('info', 'There have been ' + processed + ' pebble events processed in the last 15 minutes');
                    winston.log('info', 'In total there have been ' + totalProcessed + ' pebble events processed and '+totalSkipped+' non-pebble events skipped');
                    skipped=0;
                    processed=0;
                }
                if (onComplete !== undefined && onComplete !== null) {
                    onComplete();
                }
            } else {
                winston.log('info', 'Error fetching Pebble Group Ids');
                if (onFail !== onFail && onFail !== null) {
                    onFail();
                }
                if (ids.length > 0) {
                    winston.log('info', 'Still using ids ' + ids.join(', '))
                }
            }
        }
    });
}

function getLastEventTime(onComplete) {
    winston.log('info', 'Fetching last mtime...');
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
    winston.log('info', 'Sending event ' + id + '...')
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
        winston.log('info', 'Starting stream from mtime: ' + mtime);
    } else {
        winston.log('info', 'No mtime found! Starting stream from current time...');
        mtime = Date.now();
    }
    meetup.getStreamOpenEvents({
        since_mtime: mtime
    }).on('data', function(obj) {
        processStreamData(obj);
    }).on('end', function () {
        winston.log('info', 'Events stream closed. Attempting to restart stream...');
        winston.log('info', 'In this session we have skipped ' + totalSkipped + ' events, processed ' + totalProcessed +' pebble events');
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
                winston.log('info', 'Pebble event ' + eventID + ' found for group: ' + groupID );
                sendEvent(eventID);
                setLastEventTime(mtime);
                processed++;
                totalProcessed++;
            } else {
                skipped++;
                totalSkipped++;
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

process.on( "SIGINT", function() {
    winston.log('info', 'Events stream closed by a person!');
    winston.log('info', 'In this session we have skipped ' + totalSkipped + ' events, processed ' + totalProcessed +' pebble events');
    winston.log('info', 'Program will now terminate...');
    process.exit();
} );

setNewIDs(setup, exit);
