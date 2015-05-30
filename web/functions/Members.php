<?php

class Members {

    private $exclusions = ['name'];

    function __construct($url, $key, $groupID) {
        $this->url = $url;
        $this->key = $key;
        $this->groupID = $groupID;
    }

    function execute() {
        $arr = ['error' => 'No members found!']; //This should never happen... but...
        if (empty($this->groupID)) {
            return $arr;
        } else {
            $response = functions::cleanAPICall($this->url . 'sign=true&photo-host=public&group_id=' . $this->groupID . '&key=' . $this->key, $this->exclusions);

            return !empty($response) ? $response : $arr;
        }
    }

}