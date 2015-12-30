<?php
/**
 * Description of DocumentaryValidity
 *
 * @author daniel
 */

$RoutFile = dirname(getcwd());

require_once dirname($RoutFile).'/php/DataBase.php';
require_once dirname($RoutFile).'/php/XML.php';
require_once dirname($RoutFile).'/php/Log.php';
require_once dirname($RoutFile).'/php/Session.php';

class DocumentaryValidity {
    public function __construct() {
        $this->Ajax();
    }
    
    private function Ajax()
    {
        if(filter_input(INPUT_POST, "option")!=NULL and filter_input(INPUT_POST, "option")!=FALSE){
            
            $idSession = Session::getIdSession();
        
            if($idSession == null)
                return XML::XMLReponse ("Error", 0, "Repository::No existe una sesión activa, por favor vuelva a iniciar sesión");

            $userData = Session::getSessionParameters();
            
            switch (filter_input(INPUT_POST, "option")){
                case 'getStructureSchema': $this->getStructureSchema($userData); break;
            }
        }
    }
    
    private function getStructureSchema($userData){
        $db = new DataBase();
        
        $instanceName = $userData['dataBaseName'];
        
        $select = "SELECT * FROM CSDocs_DocumentaryDisposition";
        
        $result = $db->ConsultaSelect($instanceName, $select);
        
        if($result['Estado'] != 1)
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al obtener el esquema de Validez Documental</p>");
        
        XML::XmlArrayResponse("structureSchema", "schema", $result['ArrayDatos']);
    }
}

$DocumentaryValidity = new DocumentaryValidity();