<?php

class ResponseManager
{
    public function json(array $response){

        if(is_string($response))
            return json_decode(array("status" => 0, "message" => $response));

        header('Content-type: application/json');
        echo json_encode($response);
    }
}