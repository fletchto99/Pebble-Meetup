<?php
require_once __DIR__ . '/../configuration.php';

class DataBase {

    private function __construct() {
        try {
            $this->dbh = new PDO('mysql:host=' . Configuration::DATABASE_HOST . ';dbname=' . Configuration::DATABASE_NAME, Configuration::DATABASE_USER, Configuration::DATABASE_PASSWORD);
        } catch (PDOException $e) {
            echo 'Connection failed: ' . $e->getMessage();
        }
    }

    private static $instance;

    public static function getInstance() {
        if (self::$instance == null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function select($query_string, $values = []) {
        if (self::$instance == null || $this -> dbh == null) {
            throw new Exception("Connection to database not established!");
        }
        if (sizeof($values) !== substr_count($query_string, '?')) {
            throw new Exception("Size mismatch: Number of parameters passed does not match the number of parameters expected!");
        }
        $stmt = $this->dbh->prepare($query_string);
        if (!$stmt) {
            throw new Exception("Error building query! " . $stmt->errorInfo()[2]);
        }
        if (!($stmt->execute($values))) {
            throw new Exception("Error executing query! " . $stmt->errorInfo()[2]);
        }

        return $stmt->fetchAll();
    }

    public function insert($query_string, $values) {
        if (self::$instance == null || $this -> dbh == null) {
            throw new Exception("Connection to database not established!");
        }
        if (sizeof($values) !== substr_count($query_string, '?')) {
            throw new Exception("Size mismatch: Number of parameters passed does not match the number of parameters expected!");
        }
        $stmt = $this->dbh->prepare($query_string);
        if (!$stmt) {
            throw new Exception("Error building query! " . $stmt->errorInfo()[2]);
        }
        if (!($stmt->execute($values))) {
            throw new Exception("Error executing query! " . $stmt->errorInfo()[2]);
        }

        return $this->dbh->lastInsertId();
    }

    public function update($query_string, $values) {
        if (self::$instance == null || $this -> dbh == null) {
            throw new Exception("Connection to database not established!");
        }
        if (sizeof($values) !== substr_count($query_string, '?')) {
            throw new Exception("Size mismatch: Number of parameters passed does not match the number of parameters expected!");
        }
        $stmt = $this->dbh->prepare($query_string);
        if (!$stmt) {
            throw new Exception("Error building query! " . $stmt->errorInfo()[2]);
        }
        if (!($stmt->execute($values))) {
            throw new Exception("Error executing query! " . $stmt->errorInfo()[2]);
        }

        return $stmt->rowCount();
    }

    public function delete($query_string, $values) {
        if (self::$instance == null || $this -> dbh == null) {
            throw new Exception("Connection to database not established!");
        }
        if (sizeof($values) !== substr_count($query_string, '?')) {
            throw new Exception("Size mismatch: Number of parameters passed does not match the number of parameters expected!");
        }
        $stmt = $this->dbh->prepare($query_string);
        if (!$stmt) {
            throw new Exception("Error building query! " . $stmt->errorInfo()[2]);
        }
        if (!($stmt->execute($values))) {
            throw new Exception("Error executing query! " . $stmt->errorInfo()[2]);
        }

        return $stmt->rowCount();
    }

}