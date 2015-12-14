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
                case "buildNewArchivalDispositionCatalog": $this->buildNewArchivalDispositionCatalog(); break;
            }
        }
    }
    
    private function buildNewArchivalDispositionCatalog(){

        $xmlStructureString = filter_input(INPUT_POST, "xmlStructure");
        
        if(!($xml = simplexml_load_string($xmlStructureString))){
            $errorOutput = "";
            foreach(libxml_get_errors() as $error) {
                $errorOutput.=$error->message."<br>";
            }
                return XML::XMLReponse ("Error", 0, "<p><b>Error</b> la estructura XML no se ha formado correctamente</p><br>Detalles:<br>$errorOutput");
        }
        

        var_dump($xml);
    }
    
}

$archival = new Archival();
