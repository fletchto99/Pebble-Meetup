<?php

class Events
{

    private $lat = null;
    private $lon = null;
    private $key = null;
    private $distance = null;
    private $url = null;
    private $exclusions = array('distance', 'id', 'name', 'venue', 'time', 'utc_offset', 'address', 'group');
    private $groupIDS = null;
    private $units = null;

    function __construct($url, $key, $lat, $lon, $distance, $groupIDS, $units)
    {
        $this->lat = $lat;
        $this->lon = $lon;
        $this->key = $key;
        $this->distance = $distance;
        $this->url = $url;
        $this->groupIDS = $groupIDS;
        $this->units = $units;
    }

    function execute()
    {
        $arr = array('error' => 'No events found!');
        if (empty($this->groupIDS)) {
            return $arr;
        } else {
            if ($this->lat && $this->lon) {
                $response = json_decode(file_get_contents($this->url . 'sign=true&photo-host=public&group_id=' . $this->groupIDS . '&status=upcoming&key=' . $this->key), true);
                $clean = functions::cleanupResponse($response, $this->exclusions)['results'];
                array_walk($clean, function (&$v, $k) {
                    if (is_array($v)) {
                        if (is_numeric($v['venue']['lat']) && is_numeric($v['venue']['lon'])) {
                            $v['distance'] = functions::distance($this->lat, $this->lon, $v['venue']['lat'], $v['venue']['lon'], $this->units);
                        }
                        if (is_numeric($v['time'])) {
                            date_default_timezone_set('UTC');
                            $time = $v['time'] + $v['utc_offset'];
                            $v['date'] = date("d-m-Y g:ia", intval($time) / 1000);
                        }
                        if (is_numeric($v['state'])) {
                            $v['state'] = '';
                        }
                    }
                });
                foreach ($clean as $key => $value) {
                    if ((floatval($value['distance']) * ($this->units == 'km' ? 1.60934 : 1)) > $this->distance) {
                        unset($clean[$key]);
                    }
                }
                usort($clean, function ($a, $b) {
                    return new DateTime($a['date']) > new DateTime($b['date']) ? 1 : -1;
                });
                return !empty($clean) ? $clean : $arr;
            }
        }
        return $arr;
    }


}

?>