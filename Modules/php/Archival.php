<?php
/**
 * Description of Archival
 *
 * @author daniel
 */
$RoutFile = dirname(getcwd());

require_once $RoutFile.'/php/DataBase.php';
require_once $RoutFile.'/php/XML.php';
require_once $RoutFile.'/php/Log.php';
require_once $RoutFile.'/php/Session.php';


class Archival {
    private function Ajax()
    {
        if(filter_input(INPUT_POST, "option")!=NULL and filter_input(INPUT_POST, "option")!=FALSE){
            
            $idSession = Session::getIdSession();
        
            if($idSession == null)
                return XML::XMLReponse ("Error", 0, "Repository::No existe una sesión activa, por favor vuelva a iniciar sesión");

            $userData = Session::getSessionParameters();
            
            switch (filter_input(INPUT_POST, "option"))
            {
                
            }
        }
    }
    
    private function buildNewArchivalDispositionCatalog(){
        var_dump($_POST);
    }
    
}

$archival = new Archival();
