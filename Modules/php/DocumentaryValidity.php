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
                case 'modifyColumnOfDocValidity': $this->modifyColumnOfDocValidity($userData); break;
            }
        }
    }
    
    private function getStructureSchema($userData){
        $db = new DataBase();
        
        $instanceName = $userData['dataBaseName'];
        
        $select = "
                SELECT disp.idDocumentaryDisposition, disp.Name, disp.NameKey, 
                disp.Description, disp.NodeType, disp.ParentKey, val.idDocValidity, 
                val.Administrativo, val.Legal, val.Fiscal, val.ArchivoTramite, 
                val.ArchivoConcentracion, val.ArchivoDesconcentracion, val.Total, 
                leg.FoundationKey, val.Eliminacion, val.Concentracion, 
                val.Muestreo, val.Publica, val.Reservada, val.confidencial, 
                val.ParcialMenteReservada 
                FROM CSDocs_DocumentaryDisposition disp LEFT JOIN CSDocs_DocumentValidity val 
                ON disp.idDocumentaryDisposition = val.idLegalFoundation 
                LEFT JOIN CSDOcs_LegalFoundation leg ON val.idLegalFoundation =    leg.idLegalFoundation
                ";
        
        $result = $db->ConsultaSelect($instanceName, $select);
        
        if($result['Estado'] != 1)
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al obtener el esquema de Validez Documental</p>");
        
        XML::XmlArrayResponse("structureSchema", "schema", $result['ArrayDatos']);
    }
    
    private function modifyColumnOfDocValidity(){
        return XML::XMLReponse("Dan", 0, "Hola dan");
    }
    
}

$DocumentaryValidity = new DocumentaryValidity();