<?php

class GroupSubscription {

    function __construct($groupID) {
        $this -> groupID = $groupID;
    }

    function execute() {
        try {
            $db = DataBase::getInstance();
            $db -> insert('INSERT INTO Groups(Group_Token) VALUES (?)', [$this -> groupID]);
            return ['Success' => 'Now scanning for events in the group ' . $this -> groupID];
        } catch(Exception $ignored) {
        }
        return ['error' => 'Cannot subscribe to custom groups currently!'];
    }

}