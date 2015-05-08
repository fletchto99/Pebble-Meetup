<?php

require_once 'TimelineAPI/Timeline.php';

use TimelineAPI\Pin;
use TimelineAPI\PinLayout;
use TimelineAPI\PinLayoutType;
use TimelineAPI\PinIcon;
use TimelineAPI\PinReminder;
use TimelineAPI\Timeline;


class PinEvent
{

    private $key = null;
    private $url = null;
    private $userToken = null;
    private $exclusions = array('distance', 'id', 'name', 'venue', 'time', 'utc_offset', 'address');

    function __construct($url, $key, $userToken, $eventID)
    {
        $this -> url = $url;
        $this->key = $key;
        $this -> userToken = $userToken;
        $this-> eventID = $eventID;
    }

    function execute()
    {
        $arr = array('error' => 'Error pushing event to timeline, please try again later!'); //This should never happen... but...
        if (empty($this->eventID) || empty($this -> userToken)) {
            return $arr;
        } else {
            $response = functions::cleanAPICall($this->url . $this->eventID . '?sign=true&key=' . $this->key, $this -> exclusions, null);
            array_walk($response, function (&$v, $k) {
                if (is_array($v)) {
                    if (is_numeric($v['time'])) {
                        date_default_timezone_set('UTC');
                        $time = $v['time'] + $v['utc_offset'];
                        $v['date'] = date("d-m-Y g:ia", intval($time) / 1000);
                    }
                }
            });
            $reminder = new PinReminder(new PinLayout(PinLayoutType::GENERIC_PIN, 'Meetup event in 1 Hour!', null, null, null, PinIcon::NOTIFICATION_FLAG), (new DateTime($response['date'])) -> sub(new DateInterval('PT1H')));
            $pin = new Pin($this -> eventID, new DateTime($response['date']), new PinLayout(PinLayoutType::GENERIC_PIN, $response['name'], 'Meetup Event', null, 'Loacted at ' . $response['venue']['address_1'], PinIcon::NOTIFICATION_FLAG));
            $pin -> addReminder($reminder);
            $response = Timeline::pushPin($this -> userToken, $pin);
            return !empty($response) ? $response : $arr;
        }
    }


}

?>