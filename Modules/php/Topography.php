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
                case "modifyStructure": $this->modifyStructure($userData);
                    break;
                case 'deleteStructure': $this->deleteStructure($userData);
                    break;
                case 'setUbicationToLegajo': $this->setUbicationToLegajo($userData);
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
        $nameStructure = filter_input(INPUT_POST, "name");
        $descriptionStructure = filter_input(INPUT_POST, "description");
        $idParent = filter_input(INPUT_POST, "idParent");
        $keyStructure = filter_input(INPUT_POST, "structureKey");
        $structureType = filter_input(INPUT_POST, "structureType");
        
        $insert = "INSERT INTO CSDocs_Topography (idParent, name, structureKey, structureType,  description) 
                VALUES ($idParent, '$nameStructure', '$keyStructure', '$structureType', '$descriptionStructure')";
        
        $resultInsert = $this->db->ConsultaInsertReturnId($instanceName, $insert);
        if(!(int)$resultInsert > 0)
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al intentar agregar la nueva seccion</p> $resultInsert");
        
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
    
    private function modifyStructure($userData){
        $instanceName = $userData['dataBaseName'];
        $name = filter_input(INPUT_POST, "name");
        $description = filter_input(INPUT_POST, "description");
        $structureKey = filter_input(INPUT_POST, "structureKey");
        $idStructure = filter_input(INPUT_POST, "idStructure");
        
        $update = "UPDATE CSDocs_Topography SET name = '$name', structureKey = '$structureKey', description = '$description' WHERE idTopography = $idStructure";
        if(($result = $this->db->ConsultaQuery($instanceName, $update))!=1)
                return XML::XMLReponse ("Error", 0, "No fue posible actualizar la informacion");
        XML::XMLReponse("structureModified", 1, "Informacion actualizada.");
    }
    
    private function deleteStructure($userData){
        $instanceName = $userData['dataBaseName'];
        $xmlString = filter_input(INPUT_POST, "xml");
        if(!($xml = simplexml_load_string($xmlString))){
            $errorOutput = "";
            foreach(libxml_get_errors() as $error) {
                $errorOutput.=$error->message."<br>";
            }
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> la estructura XML no se ha formado correctamente. No se logró eliminar el elemento. </p><br>Detalles:<br>$errorOutput");
        }
        $delete = "DELETE FROM CSDocs_Topography WHERE ";
        
        foreach ($xml->node as $node){
            $delete.= "idTopography = $node OR ";
        }
        
        $deleteString = trim($delete, "OR ");
        
        if(($result = $this->db->ConsultaQuery($instanceName, $deleteString)) != 1)
                return XML::XMLReponse ("Error", 0, "<p><b>Error<b> al intentar eliminar el elemento</p>Detalles:<br>$result");
        
        XML::XMLReponse("structureRemoved", 1, "Estructura eliminada con éxito");
    }
    
    private function setUbicationToLegajo($userData){
        $instanceName = $userData['dataBaseName'];
        $idDirectory = filter_input(INPUT_POST, "idDirectory");
        $repositoryName = filter_input(INPUT_POST, "repositoryName");
        $idTopography = filter_input(INPUT_POST, "idTopography");
        $structureType = filter_input(INPUT_POST, "structureType");
        
        $setTopography = "UPDATE dir_$repositoryName SET topography = $idTopography WHERE IdDirectory = $idDirectory";
        if(($result = $this->db->ConsultaQuery($instanceName, $setTopography))!=1)
                return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al intentar asignar la topografia.");
        
        XML::XMLReponse("topographyAdded", 1, "Topografia asignada");
    }
}

$topography = new Topography();
$topography->Ajax();