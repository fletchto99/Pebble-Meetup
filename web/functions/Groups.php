<?php

class Groups
{

    private $lat = null;
    private $lon = null;
    private $key = null;
    private $radius = null;
    private $url = null;
    private $units = null;
    private $exclusions = array('country', 'state', 'city', 'id', 'name', 'lat', 'lon');

    function __construct($url, $key, $lat, $lon, $units, $radius = 1000000)
    {
        $this->lat = $lat;
        $this->lon = $lon;
        $this->key = $key;
        $this->radius = $radius;
        $this->url = $url;
        $this->units = $units;
    }

    function execute()
    {
        $arr = array('error' => 'No groups found!');
        if ($this->lat && $this->lon) {
            $response = json_decode(file_get_contents($this->url . 'sign=true&photo-host=public&topic=pebble&lat=' . $this->lat . '&lon=' . $this->lon . '&radius=' . $this->radius . '&key=' . $this->key), true);
            $clean = functions::cleanupResponse($response, $this->exclusions)['results'];
            array_walk($clean,function(&$v, $k) {
                if (is_array($v)) {
                    if (is_numeric($v['lat']) && is_numeric($v['lon'])) {
                        $v['distance'] = functions::distance($this->lat, $this->lon, $v['lat'], $v['lon'], $this -> units);
                    }
                    if (is_numeric($v['state'])) {
                        $v['state'] = '';
                    }
                }
            });
            usort($clean, function($a, $b) {
                return floatval($a['distance']) - floatval($b['distance']);
            });
            return !empty($clean) ? $clean : $arr;
        }
        return $arr;
    }


}

?>