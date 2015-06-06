<?php

class Event {

    private $exclusions = ['distance', 'id', 'name', 'venue', 'time', 'utc_offset', 'address', 'group', 'yes_rsvp_count'];

    function __construct($url, $key, $eventID, $lat, $lon, $units) {
        $this->url = $url;
        $this->key = $key;
        $this->eventID = $eventID;
        $this-> lat = $lat;
        $this-> lon = $lon;
        $this -> units = $units;
    }

    function execute() {
        if (!empty($this -> eventID) && is_numeric($this -> eventID) && $this->lat && $this->lon) {
            $response = functions::cleanAPICall($this->url . $this->eventID . '?sign=true&key=' . $this->key, $this->exclusions, null);
            if (empty($response['venue'])) {
                $response['venue'] = ['city' => '', 'state' => '', 'country' => '', 'name' => 'Undetermined', 'address_1' => ''];
            }

            if (is_numeric($response['venue']['lat']) && is_numeric($response['venue']['lon'])) {
                $response['distance'] = functions::distance($this->lat, $this->lon, $response['venue']['lat'], $response['venue']['lon'], $this->units);
            } else {
                $response['distance'] = 'No location set.';
            }
            if (is_numeric($response['time'])) {
                date_default_timezone_set('UTC');
                $time = $response['time'] + $response['utc_offset'];
                $response['date'] = date("d-m-Y g:ia", intval($time) / 1000);
            }
            if (is_numeric($response['state'])) {
                $response['state'] = '';
            }
            return !empty($response) ? $response : $response;
        }
        return $arr = ['error' => 'Error determining location'];
    }

}