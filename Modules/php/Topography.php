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
 * Description of Topography
 *
 * @author daniel
 */
$RoutFile = dirname(getcwd());

require_once dirname($RoutFile) . '/php/DataBase.php';
require_once dirname($RoutFile) . '/php/XML.php';
require_once dirname($RoutFile) . '/php/Log.php';
require_once dirname($RoutFile) . '/php/Session.php';

class Topography {
    private $db;
    public function __construct() {
        $this->db = new DataBase();
    }

    public function Ajax() {
        if (filter_input(INPUT_POST, "option") != NULL and filter_input(INPUT_POST, "option") != FALSE) {

            $idSession = Session::getIdSession();

            if ($idSession == null)
                return XML::XMLReponse("Error", 0, "Expedient::No existe una sesión activa, por favor vuelva a iniciar sesión");

            $userData = Session::getSessionParameters();

            switch (filter_input(INPUT_POST, "option")) {
                case "addNewSection": $this->addNewSection($userData);
                    break;
                case'getTopographyStructure': $this->getTopographyStructure($userData);
                    break;
            }
        }
    }
    
    private function getTopographyStructure($userData){
        $instanceName = $userData['dataBaseName'];
        $select = "SELECT * FROM CSDocs_Topography";
        $structure = $this->db->ConsultaSelect($instanceName, $select);
        if($structure['Estado'] != 1)
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al intentar obtener el diseño de la topografia.");
        
        return XML::XmlArrayResponse("topographyStructure", "section", $structure['ArrayDatos']);
    }
    private function addNewSection($userData){
        $instanceName = $userData['dataBaseName'];
        $nameStructure = filter_input(INPUT_POST, "nameStructure");
        $descriptionStructure = filter_input(INPUT_POST, "descriptionStructure");
        $idParent = filter_input(INPUT_POST, "idParent");
        $keyStructure = filter_input(INPUT_POST, "keyStructure");
        $structureType = filter_input(INPUT_POST, "structureType");
        
        if(strlen($nameStructure) > 0)
            $nameStructure = str_replace (" ", "_", $nameStructure);
        
        $insert = "INSERT INTO CSDocs_Topography (idParent, name, keyStructure, structureType,  description) 
                VALUES ($idParent, '$nameStructure', '$keyStructure', '$structureType', '$descriptionStructure')";
        
        $resultInsert = $this->db->ConsultaInsertReturnId($instanceName, $insert);
        if(!(int)$resultInsert > 0)
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al intentar agregar la nueva seccion</p>");
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("newStructureAdded");
        $doc->appendChild($root); 
        $messageXml = $doc->createElement("message", "Nueva seccion agregada.");
        $root->appendChild($messageXml);
        $newidStructure = $doc->createElement("idStructure", $resultInsert);
        $root->appendChild($newidStructure);
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
        
    }
}

$topography = new Topography();
$topography->Ajax();