<?php
/**
 * Description of DocumentaryDisposition
 *
 * @author daniel
 */

$RoutFile = dirname(getcwd());

require_once dirname($RoutFile).'/php/DataBase.php';
require_once dirname($RoutFile).'/php/XML.php';
require_once dirname($RoutFile).'/php/Log.php';
require_once dirname($RoutFile).'/php/Session.php';

class DocumentaryDisposition {
    private $db;

    public function __construct() {
        $this->db = new DataBase();
    }
    
    public function ajax()
    {
        if(filter_input(INPUT_POST, "option")!=NULL and filter_input(INPUT_POST, "option")!=FALSE){
            
            $idSession = Session::getIdSession();
        
            if($idSession == null)
                return XML::XMLReponse ("Error", 0, "DocumentaryValidity::No existe una sesión activa, por favor vuelva a iniciar sesión");

            $userData = Session::getSessionParameters();
            
            switch (filter_input(INPUT_POST, "option")){
                case 'getSeries': $this->getSeries($userData); break;
            }
        }
    }
    
    private function getSeries($userData){
        $instanceName = $userData['dataBaseName'];
        
        $series = $this->getSeriesArray($instanceName);
        
        if(!is_array($series))
            return XML::XMLReponse ("Error",0, "<p><b>Error</b> al obtener las Series</p>Detalles:<br>$series");
        
        XML::XmlArrayResponse("Series", "serie", $series);
    }
    
    public function getSeriesArray($instanceName){
        $select = "SELECT idDocumentaryDisposition, Name, NameKey, Description FROM CSDocs_DocumentaryDisposition WHERE NodeType = 'serie'";
        
        $seriesArray = $this->db->ConsultaSelect($instanceName, $select);
        
        if($seriesArray['Estado'] != 1)
            return $seriesArray['Estado'];
        else
            return $seriesArray['ArrayDatos'];
        
    }
    
}

$documentary = new DocumentaryDisposition();
$documentary->ajax();