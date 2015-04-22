<?php

require_once('Groups.php');

class Functions
{
    private $config = array();

    private $result = array('error' => 'Error executing option, please try again later.');

    function __construct($config, $params)
    {
        $this->config = $config;
    }

    static function cleanupResponse($arr, $exclusions)
    {
        foreach ($arr as $key => $value) {
            if (is_array($value) && ($key == 'results' || is_int($key))) {
                $clean = self::cleanupResponse($value, $exclusions);
                $arr[$key] = $clean;
            } else {
                if (!in_array($key, $exclusions)) {
                    unset($arr[$key]);
                }
            }
        }
        return $arr;

    }

    function execute($method, $params)
    {
        switch ($method) {
            case 'groups':
                $groups = new Groups($this->config['API_URL'] . $this->config['GROUP_CALL'], $this->config['API_KEY'], $params['lat'], $params['long'], $params['radius']);
                $this->result = $groups->execute();
                break;
        }
        echo json_encode($this->result);
    }

}

?>