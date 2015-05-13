<?php
require_once dirname(__FILE__) . '/../configuration.php';

class DataBase {

    private $dbh;

    private function __construct() {
        $config = Configuration::getConfiguration();
        try {
            $this -> dbh = new PDO('mysql:host='.$config['DATABASE_HOST'].';dbname='.$config['DATABASE_NAME'], $config['DATABASE_USER'], $config['DATABASE_PASS']);
        } catch (PDOException $e) {
            echo 'Connection failed: ' . $e->getMessage();
        }
    }

    private static $instance = null;

    public static function getInstance() {
        if (self::$instance == null) {
            return new self();
        }
        return self::$instance;
    }

    public function insert($table, $columns, $values) {
        if (sizeof($columns) != sizeof($values)) {
            throwException("Columns not equal to values");
        }
        $stmt = $this -> dbh->prepare("INSERT INTO ".$table." (".join(",",$columns).")
                                              VALUES (".join(", ", array_keys($values)).")");
        if (!$stmt) {
            return "Error";
        }
        foreach($values as $key => $value) {
            $stmt->bindParam($key, $value);
        }
        $stmt->execute();
    }

    public function select($table, $columns, $criteria_string, $criteria_values) {
        $stmt = $this -> dbh->prepare("SELECT ".join(", ", $columns)."
                                              FROM ".$table."
                                              WHERE 1=1 ". (strlen($criteria_string) > 0 ? ("AND " . $criteria_string) :""));
        if (!$stmt) {
            return "Error";
        }
        foreach($criteria_values as $key => $value) {
            $stmt->bindParam($key, $value);
        }
        $stmt->execute();
        return $stmt->fetchAll();
    }

}