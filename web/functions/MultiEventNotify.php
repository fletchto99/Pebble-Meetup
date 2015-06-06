<?php

use TimelineAPI\Pin;
use TimelineAPI\PinLayout;
use TimelineAPI\PinLayoutType;
use TimelineAPI\PinIcon;
use TimelineAPI\PinReminder;
use TimelineAPI\Timeline;
use TimelineAPI\PebbleColour;
use TimelineAPI\PinNotification;
use TimelineAPI\PinAction;
use TimelineAPI\PinActionType;


class MultiEventNotify {

    private $exclusions = ['distance', 'id', 'name', 'venue', 'time', 'address', 'group'];

    function __construct($url, $key, $timelineKey, $eventID) {
        $this->url = $url;
        $this->key = $key;
        $this->timelineKey = $timelineKey;
        $this->eventID = $eventID;
    }

    function execute() {
        $arr = ['error' => 'Error retrieving event information! Please try again later!']; //This should never happen... but...
        if (empty($this->eventID)) {
            return $arr;
        } else {

            $response = functions::cleanAPICall($this->url . $this->eventID . '?sign=true&key=' . $this->key, $this->exclusions, null);
            if (is_numeric($response['time'])) {
                $time = $response['time'];
                $response['date'] = date("d-m-Y g:ia", intval($time) / 1000);
            } else {
                return $arr;
            }

            //Shouldn't have to insert the event but just in case
            try {
                $db = DataBase::getInstance();
                $eID = $db->select('SELECT Event_ID FROM Events WHERE Event_Token=?', [$this->eventID])[0]['Event_ID'];
                if (empty($eID)) {
                    $db->insert('INSERT INTO Events(Event_Token) VALUES (?)', [$this->eventID]);
                }
            } catch (Exception $error) {
                //Suppress errors, pin the event and sadly this user won't see event updates
            }

            try {
                $db = DataBase::getInstance();
                $tokens = $db->select("SELECT Users.User_Token FROM Events INNER JOIN User_Events ON Events.Event_ID = User_Events.Event_ID INNER JOIN Users ON Users.User_ID=User_Events.User_ID WHERE Events.Event_Token=?", [$this->eventID]);
                if (sizeof($tokens) > 0) {
                    foreach ($tokens as $token) {
                        if (!empty($token['User_Token'])) {
                            $subscriptions = Timeline::listSubscriptions($token['User_Token'])['result']['topics'];
                            if (sizeof($subscriptions) > 0) {
                                if (!in_array($response['group']['id'], $subscriptions) && !in_array('all-events', $subscriptions)) {
                                    //Layouts
                                    $createLayout = new PinLayout(PinLayoutType::GENERIC_NOTIFICATION, 'The event ' . $response['name'] . ' has been pinned!', null, null, null, PinIcon::NOTIFICATION_FLAG);
                                    $updateLayout = new PinLayout(PinLayoutType::GENERIC_NOTIFICATION, 'Meetup Event Update', null, null, 'The event ' . $response['name'] . ' has been updated!', PinIcon::NOTIFICATION_FLAG);
                                    $reminder1Layout = new PinLayout(PinLayoutType::GENERIC_REMINDER, 'Meetup event in 1 Day!', null, null, null, PinIcon::NOTIFICATION_FLAG);
                                    $reminder2Layout = new PinLayout(PinLayoutType::GENERIC_REMINDER, 'Meetup event in 1 Hour!', null, null, null, PinIcon::NOTIFICATION_FLAG);
                                    $pinLayout = new PinLayout(PinLayoutType::GENERIC_PIN, $response['name'], null, 'Meetup Event', 'Located at ' . $response['venue']['address_1'], PinIcon::TIMELINE_CALENDAR, PinIcon::TIMELINE_CALENDAR, PinIcon:: TIMELINE_CALENDAR, PebbleColour::WHITE, PebbleColour::RED);

                                    //Notifications
                                    $createNotification = new PinNotification($createLayout);
                                    $updateNotification = new PinNotification($updateLayout, new DateTime('now'));

                                    //Reminders
                                    $reminder1 = new PinReminder($reminder1Layout, (new DateTime($response['date']))->sub(new DateInterval('PT24H')));
                                    $reminder2 = new PinReminder($reminder2Layout, (new DateTime($response['date']))->sub(new DateInterval('PT1H')));

                                    //Actions
                                    $openAction = new PinAction('Event Details', intval($this->eventID), PinActionType::OPEN_WATCH_APP);

                                    //Pin
                                    $pin = new Pin($this->eventID, new DateTime($response['date']), $pinLayout, null, $createNotification, $updateNotification);

                                    //Add reminders
                                    $pin->addReminder($reminder1);
                                    $pin->addReminder($reminder2);

                                    //Add Actions
                                    $pin -> addAction($openAction);

                                    //Push the pin
                                    $response = Timeline::pushPin($token['User_Token'], $pin);
                                }
                            }
                        }
                    }
                }
            } catch (Exception $exception) {
                //Supress errors, guess the user won't get the update! :(
            }

            //Layouts
            $createLayout = new PinLayout(PinLayoutType::GENERIC_NOTIFICATION, 'Meetup Event Added!', null, null, 'The event ' . $response['name'] . ' has successfully been pinned!', PinIcon::NOTIFICATION_FLAG);
            $updateLayout = new PinLayout(PinLayoutType::GENERIC_NOTIFICATION, 'Meetup Event Update!', null, null, 'The event ' . $response['name'] . ' has been updated!', PinIcon::NOTIFICATION_FLAG);
            $reminder1Layout = new PinLayout(PinLayoutType::GENERIC_REMINDER, 'Meetup event in 1 Day!', null, null, null, PinIcon::NOTIFICATION_FLAG);
            $reminder2Layout = new PinLayout(PinLayoutType::GENERIC_REMINDER, 'Meetup event in 1 Hour!', null, null, null, PinIcon::NOTIFICATION_FLAG);
            $pinLayout = new PinLayout(PinLayoutType::GENERIC_PIN, 'Meetup Event', null, $response['name'], 'Located at ' . $response['venue']['address_1'], PinIcon::TIMELINE_CALENDAR, PinIcon::TIMELINE_CALENDAR, PinIcon:: TIMELINE_CALENDAR, PebbleColour::WHITE, PebbleColour::RED);

            //Notifications
            $createNotification = new PinNotification($createLayout);
            $updateNotification = new PinNotification($updateLayout, new DateTime('now'));

            //Reminders
            $reminder1 = new PinReminder($reminder1Layout, (new DateTime($response['date']))->sub(new DateInterval('PT24H')));
            $reminder2 = new PinReminder($reminder2Layout, (new DateTime($response['date']))->sub(new DateInterval('PT1H')));

            //Actions
            $openAction = new PinAction('Event Details', intval($this->eventID), PinActionType::OPEN_WATCH_APP);

            //Pin
            $pin = new Pin($this->eventID, new DateTime($response['date']), $pinLayout, null, $createNotification, $updateNotification);

            //Add reminders
            $pin->addReminder($reminder1);
            $pin->addReminder($reminder2);

            //Add Actions
            $pin -> addAction($openAction);

            //Push the pin
            $response = Timeline::pushSharedPin($this->timelineKey, [$response['group']['id'], 'all-events'], $pin);

            return !empty($response) ? $response : $arr;
        }
    }

}