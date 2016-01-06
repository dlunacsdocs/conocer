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
                return XML::XMLReponse ("Error", 0, "Repository::No existe una sesión activa, por favor vuelva a iniciar sesión");

            $userData = Session::getSessionParameters();
            
            switch (filter_input(INPUT_POST, "option")){
                case 'getStructureSchema': $this->getStructureSchema($userData); break;
                case 'modifyColumnOfDocValidity': $this->modifyColumnOfDocValidity($userData); break;
            }
        }
    }
    
    private function getStructureSchema($userData){        
        $instanceName = $userData['dataBaseName'];
        
        $select = "
                SELECT disp.idDocumentaryDisposition, disp.Name, disp.NameKey, 
                disp.Description, disp.NodeType, disp.ParentKey, val.idDocValidity, 
                val.Administrativo, val.Legal, val.Fiscal, val.ArchivoTramite, 
                val.ArchivoConcentracion, val.ArchivoDesconcentracion, val.Total, 
                leg.FoundationKey, val.Eliminacion, val.Concentracion, val.Muestreo, 
                val.Publica, val.Reservada, val.confidencial, val.ParcialMenteReservada 
                FROM CSDocs_DocumentaryDisposition disp LEFT JOIN CSDocs_DocumentValidity val 
                ON disp.idDocumentaryDisposition = val.idDocDisposition 
                LEFT JOIN CSDOcs_LegalFoundation leg ON val.idLegalFoundation = leg.idLegalFoundation
                ";
        
        $result = $this->db->ConsultaSelect($instanceName, $select);
        
        if($result['Estado'] != 1)
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al obtener el esquema de Validez Documental</p>");
        
        XML::XmlArrayResponse("structureSchema", "schema", $result['ArrayDatos']);
    }
    
    private function modifyColumnOfDocValidity($userData){    
        $instanceName = $userData['dataBaseName'];
        $value = filter_input(INPUT_POST, "value");
        $idDocValidity = filter_input(INPUT_POST, "idDocValidity");
        $columnName = filter_input(INPUT_POST, "columName");
        
        $update = "UPDATE CSDocs_DocumentValidity SET $columnName = '$value' WHERE idDocValidity = $idDocValidity";
        
        if(($updateResult = $this->db->ConsultaQuery($instanceName, $update)) != 1)
                return XML::XMLReponse ("Error", 0, "<b>Error</b> al intentar ingresar el dato. Detalles: $updateResult");
        
        echo $value;
    }
    
}

$DocumentaryValidity = new DocumentaryValidity();