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
require_once dirname($RoutFile).'/php/CoreConfigTables.php';

class DocumentaryDisposition {
    private $db;
    private $coreConfigTables;
    public function __construct() {
        $this->db = new DataBase();
        $this->coreConfigTables = new CoreConfigTables();
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
                case 'createCoreResource': $this->createCoreResource($userData);
            }
        }
    }
    
    /**
     * Inserta el id del Catlogo de disp doc al cual pertenece una caratula en la tabla de directorios.
     */
    public function createCoreResource($userData){
        $instanceName = $userData['dataBaseName'];
        $setInFrontPage = "UPDATE dir_Repositorio dir INNER JOIN dir_Repositorio subdir ON dir.parent_id = subdir.IdDirectory 
                    SET dir.idDocDisposition = subdir.IdDocDisposition WHERE dir.isFrontPage=1";
        
        if ($this->coreConfigTables->createTable($instanceName, "setDocDispotionIntoDir_Repositorio_FrontPage", $setInFrontPage) != 1)
            return XML::XMLReponse ("Error", 0, "<b>Error</b> al crear el recurso setDocDispotionIntoDir_Repositorio_FrontPage");
        
        $setInLegajo = "UPDATE dir_Repositorio dir INNER JOIN dir_Repositorio subdir ON dir.parent_id = subdir.IdDirectory 
                    SET dir.idDocDisposition = subdir.IdDocDisposition WHERE dir.isLegajo=1";
        
        if ($this->coreConfigTables->createTable($instanceName, "setDocDispotionIntoDir_Repositorio_Legajos", $setInLegajo) != 1)
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al crear el recurso setDocDispotionIntoDir_Repositorio_Legajos");
        
        XML::XMLReponse("coreResourceCreated", 1, "CoreResource creado.");
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