<?php


class Changes {

    function __construct($version) {
        $this->version = $version;
    }

    function execute() {
        $arr = ['error' => 'Error retrieving version information']; //This should never happen... but...
        try {
            $db = DataBase::getInstance();
            $result = $db->select("SELECT Version_Changes FROM Versions WHERE Version_Code=? ORDER BY Version_Code_Decimal DESC LIMIT 1", [$this -> version]);
            $result = array_intersect_key($result[0], array_flip(['Version_Changes']));
            return $result != null ? $result : $arr;
        } catch (Exception $error) {
        }

        return $arr;
    }

}