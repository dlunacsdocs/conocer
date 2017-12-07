<?php

require_once dirname($RoutFile) . '/php/ResponseManager.php';

class Main
{
    protected $response;
    protected $db;

    public function __construct()
    {
        $this->db = new DataBase();
        $this->response = new ResponseManager();
    }
}