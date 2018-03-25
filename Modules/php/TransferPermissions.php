<?php
$RoutFile = dirname(getcwd());

require_once dirname($RoutFile) . '/php/DataBase.php';
require_once dirname($RoutFile) . '/php/XML.php';
require_once dirname($RoutFile) . '/php/Log.php';
require_once dirname($RoutFile) . '/php/Session.php';
require_once dirname($RoutFile) . '/php/Main.php';

class TransferPermissions extends Main
{

    public function Ajax() {
        if (filter_input(INPUT_POST, "option") != NULL and filter_input(INPUT_POST, "option") != FALSE) {

            $idSession = Session::getIdSession();

            if ($idSession == null)
                return json_encode(["status" => false, "message" => "No existe una sesión activa:: Permisos de transferencia"]);

            $userData = Session::getSessionParameters();

            switch (filter_input(INPUT_POST, "option")) {
                case "getUserGroups": $this->getUserGroups($userData);
                    break;
            }
        }
    }

    private function getUserGroups($userData){
        $query = 'SELECT *FROM GruposUsuario';
        $resultData = $this->db->ConsultaSelect($userData["dataBaseName"], $query);

        if($resultData["Estado"] != 1)
            return json_encode(["error" => $resultData["Estado"]]);

        $this->response->json(["status" => true, "data" => $resultData["ArrayDatos"]]);
    }
}

$tranfer = new TransferPermissions();
$tranfer->Ajax();
