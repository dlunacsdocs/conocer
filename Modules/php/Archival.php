<?php
/**
 * Description of Archival
 *
 * @author daniel
 */
$RoutFile = dirname(getcwd());

require_once dirname($RoutFile).'/php/DataBase.php';
require_once dirname($RoutFile).'/php/XML.php';
require_once dirname($RoutFile).'/php/Log.php';
require_once dirname($RoutFile).'/php/Session.php';


class Archival {
    
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
                case "buildNewArchivalDispositionCatalog": $this->buildNewArchivalDispositionCatalog($userData); break;
                case 'getDocDispositionCatalogStructure': $this->getDocDispositionCatalogStructure($userData); break;
                case 'modifyDocDispCatalogNode': $this->modifyDocDispCatalogNode($userData); break;
            }
        }
    }
    
    private function buildNewArchivalDispositionCatalog($userData){
        $DB = new DataBase();
        
        $instanceName = $userData['dataBaseName'];
                
        $xmlStructureString = filter_input(INPUT_POST, "xmlStructure");
        $values = "";
        
        
        if(!($xml = simplexml_load_string($xmlStructureString))){
            $errorOutput = "";
            foreach(libxml_get_errors() as $error) {
                $errorOutput.=$error->message."<br>";
            }
            
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> la estructura XML no se ha formado correctamente</p><br>Detalles:<br>$errorOutput");
        }
        
                
        foreach ($xml->node as $node){
            $values.="('$node->title', '$node->key', '$node->description', "
                    . "'$node->type', '$node->parentNode'),";
        }
        
        $insert = "INSERT INTO CSDocs_DocumentaryDisposition (Name, NameKey, "
                . "Description, NodeType, ParentKey) VALUES ".trim($values, ",");
        
        if(($insertResult = $DB->ConsultaInsert($instanceName, $insert)) != 1)
                return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al registrar "
                        . "el Catálogo de Disposición Documental</p> <br> Detalles: <br> $insertResult");

        XML::XMLReponse("docuDispositionCatalogCreated", 1, "Catálogo de Disposición Documental generado");
    }
    
    private function getDocDispositionCatalogStructure($userData){
        $DB = new DataBase();
        
        $dataBaseName = $userData['dataBaseName'];
                
        $select = "SELECT * FROM CSDocs_DocumentaryDisposition";
        
        $structure = $DB->ConsultaSelect($dataBaseName, $select);
        
        if($structure['Estado'] != 1)
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al obtener el <b>Catálogo de Disposición Documental</b><br>Detalles:<br>".$structure['Estado']);
        
        $structureArray = $structure['ArrayDatos'];
        
        return XML::XmlArrayResponse("docDispositionCatalog", "node", $structureArray);
        
    }
    
    private function modifyDocDispCatalogNode($userData){
        var_dump($_POST);
    }
    
}

$archival = new Archival();
