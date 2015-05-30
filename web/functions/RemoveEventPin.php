<?php

use TimelineAPI\Timeline;


class RemoveEventPin {

    function __construct($userToken, $eventID) {
        $this->userToken = $userToken;
        $this->eventID = $eventID;
    }

    function execute() {
        $arr = ['error' => 'Error determining pin to remove!']; //This should never happen... but...
        if (empty($this->eventID) || empty($this->userToken)) {
            return $arr;
        } else {

            try {
                $db = DataBase::getInstance();
                $sql = 'DELETE ue
                        FROM User_Events ue
                            INNER JOIN Users ON Users.User_ID = ue.User_ID
                            INNER JOIN Events ON Events.Event_ID = ue.Event_ID
                        WHERE
                            Users.User_Token=? AND
                            Events.Event_Token=?';
                $db->delete($sql, [$this->userToken, $this->eventID]);
            } catch (Exception $error) {
                //Supress errors, pin the event and sadly this user won't see event updates
            }
            //Push the pin
            $response = Timeline::deletePin($this->userToken, $this->eventID);

            return !empty($response) ? $response : $arr;
        }
    }

}