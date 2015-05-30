<?php


class About {

    function __construct($prerelease) {
        $this->prerelease = $prerelease;
    }

    function execute() {
        $arr = ['error' => 'Error retrieving version information']; //This should never happen... but...
        try {
            $db = DataBase::getInstance();
            if ($this->prerelease == 0) {
                $result = $db->select("SELECT Version_Code, Version_Description FROM Versions WHERE Pre_Release=0 ORDER BY Version_Code_Decimal DESC LIMIT 1");
            } else {
                $result = $db->select("SELECT Version_Code, Version_Description FROM Versions ORDER BY Version_Code_Decimal DESC, Pre_Release ASC LIMIT 1");
            }
            $arr = array_intersect_key($result[0], array_flip(['Version_Code', 'Version_Description']));
        } catch (Exception $error) {
        }

        return $arr;
    }

}