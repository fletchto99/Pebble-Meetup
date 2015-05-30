<?php

class GroupEvents {

    private $exclusions = ['distance', 'id', 'name', 'venue', 'time', 'utc_offset', 'address', 'group', 'yes_rsvp_count'];

    function __construct($url, $key, $lat, $lon, $distance, $groupIDS, $units) {
        $this->lat = $lat;
        $this->lon = $lon;
        $this->key = $key;
        $this->distance = $distance;
        $this->url = $url;
        $this->groupIDS = $groupIDS;
        $this->units = $units;
    }

    function execute() {
        if ($this->distance && $this->units && $this->distance < 10000000) {
            $arr = ['error' => 'No upcoming events found within a ' . $this->distance . $this->units . ' radius!'];
        } else {
            $arr = ['error' => 'No upcoming events found!'];
        }
        if (empty($this->groupIDS)) {
            return $arr;
        } else {
            if ($this->lat && $this->lon) {
                $response = functions::cleanAPICall($this->url . 'sign=true&photo-host=public&group_id=' . $this->groupIDS . '&status=upcoming&key=' . $this->key, $this->exclusions);
                array_walk($response, function (&$v) {
                    if (is_array($v)) {
                        if (empty($v['venue'])) {
                            $v['venue'] = ['city' => '', 'state' => '', 'country' => '', 'name' => 'Undetermined', 'address_1' => ''];
                        }

                        if (is_numeric($v['venue']['lat']) && is_numeric($v['venue']['lon'])) {
                            $v['distance'] = functions::distance($this->lat, $this->lon, $v['venue']['lat'], $v['venue']['lon'], $this->units);
                        } else {
                            $v['distance'] = 'No location set.';
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
                foreach ($response as $key => $value) {
                    if (((floatval($value['distance']) * ($this->units == 'km' ? 1.60934 : 1)) > $this->distance) || $value['distance'] == 'No location set.') {
                        unset($response[$key]);
                    }
                }
                usort($response, function ($a, $b) {
                    return new DateTime($a['date']) > new DateTime($b['date']) ? 1 : -1;
                });
                $response = array_slice($response, 0, 100, true); //Limit to top 100 closest 100 events... This should be enough,  prevent slow load time
                return !empty($response) ? $response : $arr;
            }
        }

        return $arr;
    }

}