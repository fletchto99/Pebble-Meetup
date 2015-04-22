<?php

class Events
{

    private $lat = null;
    private $lon = null;
    private $key = null;
    private $distance = null;
    private $url = null;
    private $exclusions = array('distance', 'city', 'id', 'state', 'name', 'city', 'venue', 'time', 'utc_offset', 'address', 'group');
    private $groups = null;

    function __construct($url, $key, $lat, $lon, $distance, $groups)
    {
        $this->lat = $lat;
        $this->lon = $lon;
        $this->key = $key;
        $this->distance = $distance;
        $this->url = $url;
        $this->groups = $groups;
    }

    function execute()
    {
        $arr = array('error' => 'No events found!');
        if (empty($this->groups)) {
            return $arr;
        } else {
            $ids = implode(array_map(function($el) {return $el['id'];}, $this->groups), ',');
            if ($this->lat && $this->lon) {
                $response = json_decode(file_get_contents($this->url . 'sign=true&photo-host=public&group_id='.$ids.'&status=upcoming&key=' . $this->key), true);
                $clean = functions::cleanupResponse($response, $this->exclusions)['results'];
                array_walk($clean, function (&$v, $k) {
                    if (is_array($v)) {
                        if (is_numeric($v['venue']['lat']) && is_numeric($v['venue']['lon'])) {
                            $v['distance'] = functions::distance($this->lat, $this->lon, $v['venue']['lat'], $v['venue']['lon'], 'K');
                        }
                        if (is_numeric($v['time'])) {
                            date_default_timezone_set('UTC');
                            $time = $v['time'] + $v['utc_offset'];
                            $v['date'] =  date("d-m-Y g:ia", intval($time)/1000);
                        }
                    }
                });
                foreach($clean as $key => $value) {
                    if(floatval($value['distance']) > $this -> distance) {
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