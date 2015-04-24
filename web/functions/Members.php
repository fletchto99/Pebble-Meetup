<?php

class Members
{

    private $exclusions = array('name');
    private $groupID = null;
    private $key = null;
    private $url = null;

    function __construct($url, $key, $groupID)
    {
        $this->url = $url;
        $this->key = $key;
        $this->groupID = $groupID;
    }

    function execute()
    {
        $arr = array('error' => 'No members found!'); //This should never happen... but...
        if (empty($this->groupID)) {
            return $arr;
        } else {
            $response = json_decode(file_get_contents($this->url . 'sign=true&photo-host=public&group_id=' . $this->groupID . '&key=' . $this->key), true);
            $clean = functions::cleanupResponse($response, $this->exclusions)['results'];
            return !empty($clean) ? $clean : $arr;
        }
    }


}

?>