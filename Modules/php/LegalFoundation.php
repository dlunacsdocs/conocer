<?php
/**
 * Description of LegalFoundation
 *
 * @author daniel
 */

$RoutFile = dirname(getcwd());


require_once dirname($RoutFile).'/php/DataBase.php';
require_once dirname($RoutFile).'/php/XML.php';
require_once dirname($RoutFile).'/php/Log.php';
require_once dirname($RoutFile).'/php/Session.php';
require_once dirname($RoutFile).'/php/Permissions.php';

class LegalFoundation {
    private $db;
    public function __construct() {
        $this->db = new DataBase();
    }
    
    public function ajax()
    {
        if(filter_input(INPUT_POST, "option")!=NULL and filter_input(INPUT_POST, "option")!=FALSE){
            
            $idSession = Session::getIdSession();
        
            if($idSession == null)
                return XML::XMLReponse ("Error", 0, "Repository::No existe una sesión activa, por favor vuelva a iniciar sesión");

            $userData = Session::getSessionParameters();
            
            switch (filter_input(INPUT_POST, "option")){
                case 'addNewRegister': $this->addNewRegister($userData); break;
                case 'modifyRegister': $this->modifyRegister($userData); break;
                case 'getLegalFoundationData': $this->getLegalFoundationData($userData); break;
            }
        }
    }
    
    private function getLegalFoundationData($userData){
        $instanceName = $userData['dataBaseName'];
        
        $select = "SELECT *FROM CSDocs_LegalFoundation";
        $data = $this->db->ConsultaSelect($instanceName, $select);
        
        if($data['Estado']!=1)
            return XML::XMLReponse ("Error",0, "<p><b>Error</b> al obtener el catálogo de Fundamento Legal</p><br>Detalles:<br>".$data['Estado']);

        
        
        XML::XmlArrayResponse("LegalFoundation", "register", $data['ArrayDatos']);
        
    }
    
    private function modifyRegister($userData){
        $instanceName = $userData['dataBaseName'];
        $action = filter_input(INPUT_POST, "action");
        $value = filter_input(INPUT_POST, "value");
        $columnName = filter_input(INPUT_POST, "columName");
        $idLegalFoundation = filter_input(INPUT_POST, "idLegalFoundation");
        
        if(!Permissions::checkPermission(0, $action))
                return XML::XMLReponse ("Error", 0, "No tiene permisos para realizar esta acción");
        
        $update = "UPDATE CSDocs_LegalFoundation SET $columnName = '$value' WHERE idLegalFoundation = $idLegalFoundation";
                
        $UpdateResult = $this->db->ConsultaQuery($instanceName, $update);
        
        if($UpdateResult != 1)
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al actualizar la información</p>Detalles:<br>$UpdateResult");                
        
        echo $value;
    }
    
    private function addNewRegister($userData){
        $instanceName = $userData['dataBaseName'];
        
        $action = filter_input(INPUT_POST, "action");
        $key = filter_input(INPUT_POST, "key");
        $description = filter_input(INPUT_POST, "description");
        
        if(!Permissions::checkPermission(0, $action))
                return XML::XMLReponse ("Error", 0, "No tiene permisos para realizar esta acción");
        
        $insert = "INSERT INTO CSDocs_LegalFoundation (FoundationKey, Description) VALUES ('$key', '$description')";
        $idRegister = $this->db->ConsultaInsertReturnId($instanceName, $insert);
        
        if(!(int) $idRegister > 0)
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al ingresar al Catálogo de Fundamento Legal</p><br>Detalles:<br>$idRegister");

        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("registerAdded");
        $newidRegister = $doc->createElement("idLegalFoundation", $idRegister);
        $root->appendChild($newidRegister);
        $Mensaje = $doc->createElement("message", "Elemento añadido correctamente");
        $root->appendChild($Mensaje);
        $doc->appendChild($root);   
        header ("Content-Type:text/xml");
        echo $doc->saveXML();  
        
    }
    
}

$legal = new LegalFoundation();
$legal->ajax();