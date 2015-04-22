<?php

class Groups
{

    private $lat = null;
    private $long = null;
    private $key = null;
    private $radius = null;
    private $url = null;
    private $exclusions = array('country', 'city', 'id', 'state', 'name');

    function __construct($url, $key, $lat, $long, $radius)
    {
        $this->lat = $lat;
        $this->long = $long;
        $this->key = $key;
        $this->radius = $radius > 25 ? $radius : '1000000';
        $this->url = $url;
    }

    function execute()
    {
        $arr = array('error' => 'No groups found!');
        if ($this->lat && $this->long) {
            $response = json_decode(file_get_contents($this->url . 'sign=true&photo-host=public&topic=pebble&lat=' . $this->lat . '&lon=' . $this->long . '&radius=' . $this->radius . '&key=' . $this->key), true);
            $clean = functions::cleanupResponse($response, $this->exclusions);
            return !empty($clean['results']) ? $clean['results'] : $arr;
        }
        return $arr;

    }


}

?>