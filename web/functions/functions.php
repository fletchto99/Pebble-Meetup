<?php

require_once 'Groups.php';
require_once 'Events.php';
require_once 'Members.php';
require_once 'SingleEventNotify.php';
require_once 'MultiEventNotify.php';
require_once 'PebbleGroups.php';

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

    static function cleanAPICall($url, $exclusions, $key = 'results') {
        $response = json_decode(file_get_contents($url), true);
        return !empty($key) ? self::cleanupResponse($response, $exclusions)[$key] : self::cleanupResponse($response, $exclusions);
    }

    static function distance($lat1, $lon1, $lat2, $lon2, $unit)
    {
        $theta = $lon1 - $lon2;
        $dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
        $dist = acos($dist);
        $dist = rad2deg($dist);
        $miles = $dist * 60 * 1.1515;
        $unit = strtoupper($unit);
        return $unit === 'KM' ? (round(($miles * 1.609344), 1) . 'km') : (round($miles, 1) . 'mi');
    }

    function execute($method, $params) {
        switch ($method) {
            case 'members':
                $members = new Members($this->config['API_URL'] . $this->config['MEMBERS_CALL'], $this->config['MEETUP_API_KEY'], $params['groupID']);
                $this->result = $members->execute();
                break;
            case 'groups':
                $groups = new Groups($this->config['API_URL'] . $this->config['GROUP_CALL'], $this->config['MEETUP_API_KEY'], $params['lat'], $params['lon'], $params['units']);
                $this->result = $groups->execute();
                break;
            case 'events':
                if (empty($params['groupID']) || $params['groupID'] < 0) {
                    $groups = new Groups($this->config['API_URL'] . $this->config['GROUP_CALL'], $this->config['MEETUP_API_KEY'], $params['lat'], $params['lon'], $params['units']);
                    $ids = implode(array_map(function ($el) {
                        return $el['id'];
                    }, $groups->execute()), ',');
                } else {
                    $ids = intval($params['groupID']);
                    $params['distance'] = '10000000';
                }
                $events = new Events($this->config['API_URL'] . $this->config['EVENTS_CALL'], $this->config['MEETUP_API_KEY'], $params['lat'], $params['lon'], $params['distance'], $ids, $params['units']);
                $this->result = $events->execute();
                break;
            case 'eventnotify':
                $pin = new SingleEventNotify($this->config['API_URL'] . $this->config['EVENT_CALL'], $this->config['MEETUP_API_KEY'], $params['userToken'], $params['eventID']);
                $this->result = $pin->execute();
                break;
            case 'multieventnotify':
                $pin = new MultiEventNotify($this->config['API_URL'] . $this->config['EVENT_CALL'], $this->config['MEETUP_API_KEY'], $this -> config['TIMELINE_API_KEY'], $params['eventID']);
                $this->result = $pin->execute();
                break;
            case 'groupids':
                $ids = new PebbleGroups($this->config['API_URL'] . $this->config['GROUP_CALL'], $this->config['MEETUP_API_KEY']);
                $this->result = $ids->execute();
                break;
        }
        echo json_encode($this->result);
    }

}

?>