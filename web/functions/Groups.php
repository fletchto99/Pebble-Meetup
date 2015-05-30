<?php

class Groups {
    private $exclusions = ['country', 'state', 'city', 'id', 'name', 'lat', 'lon', 'members', 'who'];

    function __construct($url, $key, $lat, $lon, $units, $categories) {
        $this->lat = $lat;
        $this->lon = $lon;
        $this->key = $key;
        $this->url = $url;
        $this->units = $units;
        $this->categories = explode(',', $categories);
    }

    function execute() {
        $arr = ['error' => 'No groups found!'];
        if ($this->lat && $this->lon && $this->categories) {
            $response = [];
            foreach ($this->categories as $category) {
                $response = array_merge($response, functions::cleanAPICall($this->url . 'sign=true&photo-host=public&ordering=distance&radius=global&text=' . urlencode(trim($category)) . '&lat=' . $this->lat . '&lon=' . $this->lon . '&key=' . $this->key, $this->exclusions, ''));
            }
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
            $response = array_slice($response, 0, 100, true); //Limit to top 100 closest groups... This should be enough
            return !empty($response) ? $response : $arr;
        }

        return $arr = ['error' => 'Error determining location and categories!'];
    }

}