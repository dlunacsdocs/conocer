<?php

class ResponseManager
{
    public function json(array $response){

        if(is_string($response))
            return json_decode(array("status" => 0, "message" => $response));

        return json_decode($response);
    }
}