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
                return XML::XMLReponse("Error", 0, "Expedient::No existe una sesión activa, por favor vuelva a iniciar sesión");

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

        return json_encode($resultData);
    }
}

$tranfer = new TransferPermissions();
$tranfer->Ajax();
