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


class Notification
{

    private $apiKey;
    private $username;
    private $password;
    private $message;
    private $id = 'notification-';

    function __construct($apiKey, $username, $password, $message)
    {
        $this -> apiKey = $apiKey;
        $this -> username = $username;
        $this -> password = $password;
        $this -> message = $message;
    }

    function execute()
    {
        $arr = array('error' => 'Error sending notification! Did you enter a username, password and message to send?'); //This should never happen... but...
        if (empty($this->password) || empty ($this->username)|| empty($this -> message)) {
            return $arr;
        } else {
            try {
                $db = DataBase::getInstance();
                $count = $db ->select("SELECT count(*) AS count FROM Logins WHERE Login_Name=? AND Login_Key =? AND Enabled=1", [$this -> username, md5($this -> password)])[0]['count'];
                if (!is_numeric($count) || $count < 1) {
                    return ['error' => 'Invalid username/password combination entered!'];
                }
            } catch(Exception $error) {
                echo $error;
                return ['error' => 'Invalid username/password combination entered!'];
            }
            try {
                $db = DataBase::getInstance();
                $loginID = $db -> select("SELECT Login_ID FROM Logins WHERE Login_Name = ?", [$this -> username])[0]['Login_ID'];
                $lastID = $db ->insert("INSERT INTO Notifications(Login_ID, Message) VALUES (?, ?)", [$loginID, $this -> message]);
                if (is_numeric($lastID)) {
                    $this -> id = $this -> id . $lastID;
                } else {
                    $this -> id = $this -> id. functions::generateRandomString();
                }
            } catch(Exception $error) {
                $this -> id = $this -> id . functions::generateRandomString();
                echo 'Error!!!! Please send the following to fletchto99@gmail.com!' . $error -> getMessage();
            }
            //Layouts
            $createLayout = new PinLayout(PinLayoutType::GENERIC_NOTIFICATION, 'You have received a message regarding the Pebble Meetup App!', null, null, null, PinIcon::NOTIFICATION_FLAG);
            $pinLayout = new PinLayout(PinLayoutType::GENERIC_PIN, 'Meetup Message', 'Meetup Message', null, $this -> message, PinIcon::GENERIC_EMAIL, PinIcon::GENERIC_EMAIL, PinIcon::GENERIC_EMAIL, PebbleColour::WHITE, PebbleColour::RED);

            //Notifications
            $createNotification = new PinNotification($createLayout);

            //Pin
            $pin = new Pin($this -> id, (new DateTime('now')) -> add(new DateInterval('PT5M')), $pinLayout, null, $createNotification);

            //Push the pin
            $response = Timeline::pushSharedPin($this -> apiKey, ['notifications'], $pin);
            echo 'Notification sent with the following response: ';
            return !empty($response) ? $response : $arr;
        }
    }


}

?>