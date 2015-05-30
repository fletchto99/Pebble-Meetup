<?php

class PebbleGroups {

    private $exclusions = ['id'];

    function __construct($url, $key) {
        $this->key = $key;
        $this->url = $url;
    }

    function execute() {
        $arr = ['error' => 'No groups found!'];
        $response = functions::cleanAPICall($this->url . 'sign=true&photo-host=public&topic=pebble&key=' . $this->key, $this->exclusions);
        $result = [];
        foreach ($response as $v) {
            array_push($result, $v['id']);
        }
        $result = ['groups' => $result];

        return !empty($result) ? $result : $arr;
    }

}