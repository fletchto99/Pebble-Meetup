<?php

class AllGroups {

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
        try {
            $db = DataBase::getInstance();
            $groups = $db -> select("SELECT Group_Token FROM Groups");
            foreach($groups as $group) {
                array_push($result, intval($group['Group_Token']));
            }
        } catch (Exception $exception) {

        }
        $result = ['groups' => $result];

        return !empty($result) ? $result : $arr;
    }

}