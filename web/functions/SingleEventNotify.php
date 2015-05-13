<?php

require_once 'TimelineAPI/Timeline.php';

use TimelineAPI\Pin;
use TimelineAPI\PinLayout;
use TimelineAPI\PinLayoutType;
use TimelineAPI\PinIcon;
use TimelineAPI\PinReminder;
use TimelineAPI\Timeline;
use TimelineAPI\PebbleColour;
use TimelineAPI\PinNotification;


class SingleEventNotify
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
        $arr = array('error' => 'Error retrieving event information! Please try again later!'); //This should never happen... but...
        if (empty($this->eventID) || empty($this -> userToken)) {
            return $arr;
        } else {
            $response = functions::cleanAPICall($this->url . $this->eventID . '?sign=true&key=' . $this->key, $this -> exclusions, null);
            if (is_numeric($response['time'])) {
                date_default_timezone_set('UTC');
                $time = $response['time'] + $response['utc_offset'];
                $response['date'] = date("d-m-Y g:ia", intval($time) / 1000);
            } else {
                return $arr;
            }
            //Layouts
            $createLayout = new PinLayout(PinLayoutType::GENERIC_NOTIFICATION, 'The event '.$response['name'].' has successfully been pinned!', null, null, null, PinIcon::NOTIFICATION_FLAG);
            $updateLayout = new PinLayout(PinLayoutType::GENERIC_NOTIFICATION, 'The event '.$response['name'].' has been updated!', null, null, null, PinIcon::NOTIFICATION_FLAG);
            $reminder1Layout = new PinLayout(PinLayoutType::GENERIC_REMINDER, 'Meetup event in 1 Day!', null, null, null, PinIcon::NOTIFICATION_FLAG);
            $reminder2Layout = new PinLayout(PinLayoutType::GENERIC_REMINDER, 'Meetup event in 1 Hour!', null, null, null, PinIcon::NOTIFICATION_FLAG);
            $pinLayout = new PinLayout(PinLayoutType::GENERIC_PIN, $response['name'], 'Meetup Event', null, 'Located at ' . $response['venue']['address_1'], PinIcon::TIMELINE_CALENDAR, PinIcon::TIMELINE_CALENDAR, PinIcon:: TIMELINE_CALENDAR, PebbleColour::WHITE, PebbleColour::RED);

            //Notifications
            $createNotification = new PinNotification($createLayout);
            $updateNotification = new PinNotification($updateLayout, new DateTime('now'));

            //Reminders
            $reminder1 = new PinReminder($reminder1Layout, (new DateTime($response['date'])) -> sub(new DateInterval('PT24H')));
            $reminder2 = new PinReminder($reminder2Layout, (new DateTime($response['date'])) -> sub(new DateInterval('PT1H')));

            //Pin
            $pin = new Pin($this -> eventID, new DateTime($response['date']), $pinLayout, null, $createNotification, $updateNotification);

            //Add reminders
            $pin -> addReminder($reminder1);
            $pin -> addReminder($reminder2);

            //Push the pin
            $response = Timeline::pushPin($this -> userToken, $pin);
            return !empty($response) ? $response : $arr;
        }
    }


}

?>