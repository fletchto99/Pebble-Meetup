<?php

class Group {

    private $exclusions = ['country', 'state', 'city', 'id', 'name', 'lat', 'lon', 'members', 'who'];

    function __construct($url, $key, $lat, $lon, $units, $radius = 1000000) {
        $this->lat = $lat;
        $this->lon = $lon;
        $this->key = $key;
        $this->radius = $radius;
        $this->url = $url;
        $this->units = $units;
    }

    function execute() {
        $arr = ['error' => 'No groups found!'];
        if ($this->lat && $this->lon) {
            $response = functions::cleanAPICall($this->url . 'sign=true&photo-host=public&topic=pebble&lat=' . $this->lat . '&lon=' . $this->lon . '&radius=' . $this->radius . '&key=' . $this->key, $this->exclusions);
            array_walk($response, function (&$v) {
                if (is_array($v)) {
                    if (is_numeric($v['lat']) && is_numeric($v['lon'])) {
                        $v['distance'] = functions::distance($this->lat, $this->lon, $v['lat'], $v['lon'], $this->units);
                    }
                    if (!array_key_exists('state', $v) || is_numeric($v['state'])) {
                        $v['state'] = '';
                    }
                }
            });
            usort($response, function ($a, $b) {
                return floatval($a['distance']) - floatval($b['distance']);
            });

            return !empty($response) ? $response : $arr;
        }

        return $arr = ['error' => 'Error determining location'];
    }

}