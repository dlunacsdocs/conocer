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
                case "getGroupUsers":
                    return $this->getGroupUsers($userData);
                case 'associateUserToGroup':
                    return $this->associateUserToGroup($userData);
                default: return $this->response->json(["status" => false, "message" => "option not found"]);
            }
        }
    }

    private function getUserGroups($userData){
        $query = 'SELECT * FROM GruposUsuario LEFT JOIN CSDocs_TransferPermissions ON IdGrupo = idGroup LEFT JOIN CSDocs_Usuarios ON IdUsuario = idUser';
        $resultData = $this->db->ConsultaSelect($userData["dataBaseName"], $query);

        if($resultData["Estado"] != 1)
            return json_encode(["error" => $resultData["Estado"]]);

        $this->response->json(["status" => true, "data" => $resultData["ArrayDatos"]]);
    }

    private function getGroupUsers($userDataSession){
        $idGroup = $_POST["idGroup"];

        $query = "SELECT g.*, u.Login, u.IdUsuario FROM GruposUsuario g INNER JOIN CSDocs_Usuarios u ON g.IdGrupo = u.IdUsuario WHERE g.IdGrupo = $idGroup";
        $resultData = $this->db->ConsultaSelect($userDataSession["dataBaseName"], $query);

        if($resultData["Estado"] != 1)
            return $this->response->json(["status" => false,"message" => $resultData["Estado"]]);

        return $this->response->json(["status" => true, "data" => $resultData["ArrayDatos"]]);
    }

    private function associateUserToGroup($userDataSession){
        $idUser = $_POST["idUser"];
        $idGroup = $_POST["idGroup"];

        $query = 'UPDATE CSDocs_TransferPermissions SET idUser = '.$idUser.' where idGroup = '. $idGroup ;

        $resultData = $this->db->ConsultaQuery($userDataSession["dataBaseName"], $query);

        if(!$resultData)
            return $this->response->json(["status" => false,"message" => $resultData["Estado"]]);

        return $this->response->json(["status" => true]);

    }
}

$tranfer = new TransferPermissions();
$tranfer->Ajax();
