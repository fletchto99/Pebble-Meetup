<?php

require_once 'configuration.php';

$config = Configuration::getConfiguration();

if (!$config['MAINTENANCE_MODE'] || isset($_POST['developer'])) {
    require_once 'functions/functions.php';

    $params = null;

    if (count($_POST) == 0) {
        $params = json_decode(file_get_contents('php://input'), true);
    } else {
        $params = $_POST;
    }

    if ($params !== null) {
        $functions = new functions($config);
        $functions->execute($params['method'], $params);
    } else {
        echo json_encode(array('error' => 'Server side error, please try again later.'));
    }
} else {
    echo json_encode(array('error' => 'The server is currently undergoing maintenance, please try again later.'));
}