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
                $time = $response['time'] + $response['utc_offset'];
                $response['date'] = date("d-m-Y g:ia", intval($time) / 1000);
            } else {
                return $arr;
            }
            try {
                $db = DataBase::getInstance();
                $uID = $db -> select('SELECT User_ID FROM Users WHERE User_Token=?', [$this-> userToken])[0]['User_ID'];
                if (empty($uID)) {
                    $uID = $db -> insert('INSERT INTO Users(User_Token) VALUES (?)', [$this -> userToken]);
                }
                $eID = $db -> select('SELECT Event_ID FROM Events WHERE Event_Token=?', [$this-> eventID])[0]['Event_ID'];
                if (empty($eID)) {
                    $eID = $db -> insert('INSERT INTO Events(Event_Token) VALUES (?)', [$this -> eventID]);
                }
                if (is_numeric($uID) && is_numeric($eID)) {
                    $db -> insert('INSERT INTO User_Events(User_ID, Event_ID) VALUES (?,?)', [$uID, $eID]);
                }
            } catch(Exception $error) {
                //Supress errors, pin the event and sadly this user won't see event updates
            }
            //Layouts
            $createLayout = new PinLayout(PinLayoutType::GENERIC_NOTIFICATION, 'Meetup Event Added!', null, null, 'The event '.$response['name'].' has successfully been pinned!', PinIcon::NOTIFICATION_FLAG);
            $updateLayout = new PinLayout(PinLayoutType::GENERIC_NOTIFICATION, 'Meetup Event Update!', null, null, 'The event '.$response['name'].' has been updated!', PinIcon::NOTIFICATION_FLAG);
            $reminder1Layout = new PinLayout(PinLayoutType::GENERIC_REMINDER, 'Meetup event in 1 Day!', null, null, null, PinIcon::NOTIFICATION_FLAG);
            $reminder2Layout = new PinLayout(PinLayoutType::GENERIC_REMINDER, 'Meetup event in 1 Hour!', null, null, null, PinIcon::NOTIFICATION_FLAG);
            $pinLayout = new PinLayout(PinLayoutType::GENERIC_PIN, 'Meetup Event', null, $response['name'], 'Located at ' . $response['venue']['address_1'], PinIcon::TIMELINE_CALENDAR, PinIcon::TIMELINE_CALENDAR, PinIcon:: TIMELINE_CALENDAR, PebbleColour::WHITE, PebbleColour::RED);

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