<?php

class CheckForPin
{

    private $eventID;
    private $userToken;

    function __construct($userToken, $eventID)
    {
        $this -> userToken = $userToken;
        $this-> eventID = $eventID;
    }

    function execute()
    {
        if (empty($this->eventID) || empty($this -> userToken)) {
            return ['error' => 'Event id or usertoken left blank!'];
        } else {

            try {
                $db = DataBase::getInstance();
                $sql = 'SELECT COUNT(*) as count
                        FROM User_Events ue
                            INNER JOIN Users ON Users.User_ID = ue.User_ID
                            INNER JOIN Events ON Events.Event_ID = ue.Event_ID
                        WHERE
                            Users.User_Token=? AND
                            Events.Event_Token=?';
                $count = $db -> select($sql, [$this -> userToken, $this -> eventID])[0]['count'];
                return !empty($count) && $count > 0? ['pinned' => 'true']:['pinned' => 'false'];
            } catch(Exception $error) {
                //Supress errors, pin the event and sadly this user won't see event updates
            }
            return ['error' => 'Cannot determine pin to check'];
        }
    }


}

?>