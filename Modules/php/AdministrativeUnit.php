<?php

/**
 * Description of AdministrativeUnit
 *
 * @author daniel
 */
$RoutFile = dirname(getcwd());

require_once dirname($RoutFile).'/php/DataBase.php';
require_once dirname($RoutFile).'/php/XML.php';
require_once dirname($RoutFile).'/php/Log.php';
require_once dirname($RoutFile).'/php/Session.php';

class AdministrativeUnit {
    private $db;
    
    public function __construct() {
        $this->db = new DataBase();
    }
    
    public function ajax(){
        if(filter_input(INPUT_POST, "option")!=NULL and filter_input(INPUT_POST, "option")!=FALSE){
            
            $idSession = Session::getIdSession();
        
            if($idSession == null)
                return XML::XMLReponse ("Error", 0, "AdministrativeUnit::No existe una sesión activa, por favor vuelva a iniciar sesión");

            $userData = Session::getSessionParameters();
            
            switch (filter_input(INPUT_POST, "option")){
                case 'addNewAdminUnit': $this->addNewAdminUnit($userData); break;
                case 'getAdministrativeUnitStructure': $this->getAdministrativeUnitStructure($userData); break;
                case 'modifyAdminUnit': $this->modifyAdminUnit($userData); break;
                case 'deleteAdminUnit': $this->deleteAdminUnit($userData); break;
            }
        }
    }
    
    private function getAdministrativeUnitStructure($userData){
        $instanceName = $userData['dataBaseName'];
        
        $select = "SELECT *FROM CSDocs_AdministrativeUnit";
        
        $selectResult = $this->db->ConsultaSelect($instanceName, $select);
        
        if($selectResult['Estado'] != 1)
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al intentar obtener a Unidad Administrativa</p>Detalles:<br>".$selectResult['Estado']);
    
        XML::XmlArrayResponse("administrativeUnit", "area", $selectResult['ArrayDatos']);
        
    }
    
    private function modifyAdminUnit($userData){
        $instanceName = $userData['dataBaseName'];
        
        $idAdminUnit = filter_input(INPUT_POST, "idAdminUnit");
        $name = filter_input(INPUT_POST, "name");
        $description = filter_input(INPUT_POST, "description");
        
        $update = "UPDATE CSDocs_AdministrativeUnit SET Name = '$name', Description = '$description' WHERE idAdminUnit = $idAdminUnit";
        
        if(($updateResult = $this->db->ConsultaQuery($instanceName, $update)) != 1)
                return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al intentar actualizar la información</p>Detalles:<br>$updateResult");
    
        XML::XMLReponse("adminUnitModified", 1, "Información Actualizada");
    }
    
    private function deleteAdminUnit($userData){
        $instanceName = $userData['dataBaseName'];
        
        $xmlString = filter_input(INPUT_POST, "xml");
        
        if(!($xml = simplexml_load_string($xmlString))){
            $errorOutput = "";
            foreach(libxml_get_errors() as $error) {
                $errorOutput.=$error->message."<br>";
            }
            
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> la estructura XML no se ha formado correctamente. No se logró eliminar el elemento. </p><br>Detalles:<br>$errorOutput");
        }
        
        $delete = "DELETE FROM CSDocs_AdministrativeUnit WHERE ";
        
        foreach ($xml->administrativeUnit as $adminUnit){
           $delete.= " idAdminUnit = ".$adminUnit->idAdminUnit." OR";
        }
        
        $deleteQuery = trim($delete, "OR");
        
        if(($deleteResult = $this->db->ConsultaQuery($instanceName, $deleteQuery)) !=1 )
                return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al intentar eliminar la Unidad Administrativa </p>Detalles:<br>$deleteResult");
    
        XML::XMLReponse("adminUnitDeleted", 1, "Unidad Administrativa Eliminada");
    }
    
    private function addNewAdminUnit($userData){
        $instanceName = $userData['dataBaseName'];
        
        $name = filter_input(INPUT_POST, "name");
        $description = filter_input(INPUT_POST, "description");
        $idParent = filter_input(INPUT_POST, "idParent");
        
        $insert = "INSERT INTO CSDocs_AdministrativeUnit (Name, Description, IdParent) VALUES ('$name', '$description', $idParent)";
        
        $insertResult = $this->db->ConsultaInsertReturnId($instanceName, $insert);
        
        if(!(int)$insertResult > 0)
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al almacenar la nueva Unidad Administrativa</p>Detalles:<br>$insertResult");
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("newAdminUnitAdded");
        $newidRegister = $doc->createElement("idAdminUnit", $insertResult);
        $root->appendChild($newidRegister);
        $Mensaje = $doc->createElement("message", "Nueva Unidad Administrativa Almacenada");
        $root->appendChild($Mensaje);
        $doc->appendChild($root);   
        header ("Content-Type:text/xml");
        echo $doc->saveXML();  
        
    }
    
}

$admin = new AdministrativeUnit();
$admin->ajax();