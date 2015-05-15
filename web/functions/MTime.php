<?php

class MTime
{

    private $mtime;

    function __construct($mtime = null)
    {
        $this->mtime = $mtime;
    }

    function execute()
    {
        $arr = array('mtime' => 'Error fetching mtime'); //This should never happen... but...
        if (!empty($this->mtime)) {
            try {
                $db = DataBase::getInstance();
                if (is_numeric($this -> mtime)) {
                    $db -> update("UPDATE Properties SET Property_Value=:mtime WHERE Property_Name='mtime'", [':mtime' => $this -> mtime]);
                    $arr = ['success' => 'mtime updated to '.$this->mtime.'.' ];
                }
            } catch(Exception $error) {
                //Suppress errors, pin the event and sadly this user won't see event updates
            }
            return $arr;
        } else {
            try {
                $db = DataBase::getInstance();
                $result = $db -> select("SELECT Property_Value FROM Properties WHERE Property_Name='mtime'")[0]['Property_Value'];
                if (is_numeric($result) && $result> 0) {
                    $arr = ['mtime' => $result];
                } else {
                    $arr = ['mtime' => 'Empty'];
                }
            } catch(Exception $error) {
                //Suppress errors, pin the event and sadly this user won't see event updates
            }
            return $arr;
        }
    }


}

?>