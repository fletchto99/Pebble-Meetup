<?php

class PebbleGroups
{

    private $key = null;
    private $url = null;
    private $exclusions = array('id');

    function __construct($url, $key)
    {
        $this->key = $key;
        $this->url = $url;
    }

    function execute()
    {
        $arr = array('error' => 'No groups found!');
        $response = functions::cleanAPICall($this->url . 'sign=true&photo-host=public&topic=pebble&key=' . $this->key, $this -> exclusions);
        $result = array();
        foreach($response as $v) {
            array_push($result, $v['id']);
        }
        $result = array('groups' => $result);
        return !empty($result) ? $result : $arr;
    }


}

?>