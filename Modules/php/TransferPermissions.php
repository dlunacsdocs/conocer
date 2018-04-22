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

    /**
     * get all user groups
     * @param $userData
     * @return string
     */
    private function getUserGroups($userData){
        $query = 'SELECT * FROM GruposUsuario LEFT JOIN CSDocs_TransferPermissions ON IdGrupo = idGroup LEFT JOIN CSDocs_Usuarios ON IdUsuario = idUser';
        $resultData = $this->db->ConsultaSelect($userData["dataBaseName"], $query);

        if($resultData["Estado"] != 1)
            return json_encode(["error" => $resultData["Estado"]]);

        $this->response->json(["status" => true, "data" => $resultData["ArrayDatos"]]);
    }

    /**
     * Get all users of a group
     * @param $userDataSession
     * @return mixed
     */
    private function getGroupUsers($userDataSession){
        $idGroup = $_POST["idGroup"];

        $query = "SELECT g.*, u.Login, u.IdUsuario FROM CSDocs_Usuarios u 
                    INNER JOIN GruposControl gc ON gc.IdUsuario = u.IdUsuario
                    INNER JOIN GruposUsuario g ON g.IdGrupo = gc.IdGrupo WHERE g.IdGrupo = $idGroup";

        $resultData = $this->db->ConsultaSelect($userDataSession["dataBaseName"], $query);

        if($resultData["Estado"] != 1)
            return $this->response->json(["status" => false,"message" => $resultData["Estado"]]);

        return $this->response->json(["status" => true, "data" => $resultData["ArrayDatos"]]);
    }

    /**
     * add a manager in a group
     * @param $userDataSession
     * @return mixed
     */
    private function associateUserToGroup($userDataSession){
        $idUser = $_POST["idUser"];
        $idGroup = $_POST["idGroup"];

        $removeQuery = "DELETE FROM CSDocs_TransferPermissions WHERE idGroup = ".$idGroup;

        if($this->db->ConsultaQuery($userDataSession["dataBaseName"], $removeQuery) != 1)
            return $this->response->json(["status" => false,"message" => "Error al intentar eliminar asociados del grupo"]);

        $query = 'INSERT INTO CSDocs_TransferPermissions (idGroup, idUser, created_at) VALUES ('.$idGroup.', '. $idUser .', \''. date("Y-m-d H:i:s") .'\')' ;

        $resultData = $this->db->ConsultaQuery($userDataSession["dataBaseName"], $query);

        if($resultData != 1)
            return $this->response->json(["status" => false,"message" => $resultData["Estado"]]);

        return $this->response->json(["status" => true]);

    }
}

$tranfer = new TransferPermissions();
$tranfer->Ajax();
