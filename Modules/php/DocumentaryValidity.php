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
    private $db;

    public function __construct() {
        $this->db = new DataBase();
        $this->Ajax();
    }
    
    private function Ajax()
    {
        if(filter_input(INPUT_POST, "option")!=NULL and filter_input(INPUT_POST, "option")!=FALSE){
            
            $idSession = Session::getIdSession();
        
            if($idSession == null)
                return XML::XMLReponse ("Error", 0, "DocumentaryValidity::No existe una sesión activa, por favor vuelva a iniciar sesión");

            $userData = Session::getSessionParameters();
            
            switch (filter_input(INPUT_POST, "option")){
                case 'getStructureSchema': $this->getStructureSchema($userData); break;
                case 'modifyColumnOfDocValidity': $this->modifyColumnOfDocValidity($userData); break;
                case 'setLegalFoundation': $this->setLegalFoundation($userData); break;
            }
        }
    }
    
    private function getStructureSchema($userData){        
        $instanceName = $userData['dataBaseName'];
        
        $select = "
                SELECT disp.*, val.*, 
                leg.FoundationKey, val.* 
                FROM CSDocs_DocumentaryDisposition disp LEFT JOIN CSDocs_DocumentValidity val 
                ON disp.idDocumentaryDisposition = val.idDocDisposition 
                LEFT JOIN CSDocs_LegalFoundation leg ON val.idLegalFoundation = leg.idLegalFoundation
                ";
        
        $result = $this->db->ConsultaSelect($instanceName, $select);
        
        if($result['Estado'] != 1)
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al obtener el esquema de Validez Documental</p>Detalles:<br>".$result['Estado']);
        
        XML::XmlArrayResponse("structureSchema", "schema", $result['ArrayDatos']);
    }
    
    private function modifyColumnOfDocValidity($userData){    
        $instanceName = $userData['dataBaseName'];
        $value = filter_input(INPUT_POST, "value");
        $idDocValidity = filter_input(INPUT_POST, "idDocValidity");
        $columnName = filter_input(INPUT_POST, "columName");
        
        $update = "UPDATE CSDocs_DocumentValidity SET $columnName = '$value', Total = Total + 1  WHERE idDocValidity = $idDocValidity";
        
        if(($updateResult = $this->db->ConsultaQuery($instanceName, $update)) != 1)
                return XML::XMLReponse ("Error", 0, "<b>Error</b> al intentar ingresar el dato. Detalles: $updateResult");
        
        echo $value;
    }
    
    private function setLegalFoundation($userData){
        $instanceName = $userData['dataBaseName'];
        
        $idLegalFoundation = filter_input(INPUT_POST, "idLegalFoundation");
        $idDocumentValidity = filter_input(INPUT_POST, "idDocumentValidity");

        $update = "UPDATE CSDocs_DocumentValidity SET idLegalFoundation = $idLegalFoundation WHERE idDocValidity = $idDocumentValidity";
        
        if (($updateResult = $this->db->ConsultaQuery($instanceName, $update)) != 1)
                return XML::XMLReponse ("Error", 0, "<p><b>Error</b></p> $updateResult");
        
        XML::XMLReponse("settledLegalFoundation", 1, "Se agrego correctamente el Fundamento Legal.");
        
    }
    
}

$DocumentaryValidity = new DocumentaryValidity();