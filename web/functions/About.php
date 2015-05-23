<?php


class About
{

    function execute()
    {
        $arr = array('error' => 'Error retrieving version information'); //This should never happen... but...
        try {
            $db = DataBase::getInstance();
            $result = $db ->select("SELECT Version_Code, Version_Details FROM Versions ORDER BY Version_Code DESC LIMIT 1");
            $arr = array_intersect_key($result[0], array_flip(['Version_Code', 'Version_Details']));
        } catch(Exception $error) {
        }
        return $arr;
    }


}

?>