<?php

/*
 * Copyright 2016 daniel.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Description of Expedient
 *
 * @author daniel
 */

$RoutFile = dirname(getcwd());

require_once dirname($RoutFile).'/php/DataBase.php';
require_once dirname($RoutFile).'/php/XML.php';
require_once dirname($RoutFile).'/php/Log.php';
require_once dirname($RoutFile).'/php/Session.php';

class Expedient {
    private $db;

    public function __construct() {
        $this->db = new DataBase();
    }
        
    public function Ajax()
    {
        if(filter_input(INPUT_POST, "option")!=NULL and filter_input(INPUT_POST, "option")!=FALSE){
            
            $idSession = Session::getIdSession();
        
            if($idSession == null)
                return XML::XMLReponse ("Error", 0, "Repository::No existe una sesión activa, por favor vuelva a iniciar sesión");

            $userData = Session::getSessionParameters();
            
            switch (filter_input(INPUT_POST, "option")){
                case "createPathOfDispositionCatalog": $this->createPathOfDispositionCatalog($userData); break;
            }
        }
    }
    
    /**
     * @description Inserta el path de claves del catálogo de disposición documental en la 
     * tabla de directorios.
     * 
     * @param type $userData
     */
    private function createPathOfDispositionCatalog($userData){
        $path = filter_input(INPUT_POST, "path");
        $arrayPath = explode(", ", $path);
        $repositoryName = filter_input(INPUT_POST, "repositoryName");
        
        $insert = "INSERT INTO dir_$repositoryName (title, catalogKey, parentCatalogKey)";
       
    }
}

$expedient = new Expedient();
$expedient->Ajax();
