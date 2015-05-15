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
        $arr = array('mtime' => 'Empty'); //This should never happen... but...
        if (!empty($this->mtime)) {
            try {
                $db = DataBase::getInstance();
                if (is_numeric($this -> mtime)) {
                    $result = $db -> update("UPDATE Properties SET Property_Value=? WHERE Property_Name='mtime'", [$this -> mtime]);
                    if (is_numeric($result) && $result > 0) {
                        $arr = ['mtime' => 'mtime updated to '.$this->mtime.'.' ];
                    } else {
                        $arr = ['mtime' => 'Error updating mtime, no rows affected!' ];
                    }
                } else {
                    $arr = ['mtime' => 'mtime provided is not numeric!' ];
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
                }
            } catch(Exception $error) {
                //Suppress errors, pin the event and sadly this user won't see event updates
            }
            return $arr;
        }
    }


}

?>