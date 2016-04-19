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

require_once dirname($RoutFile) . '/php/DataBase.php';
require_once dirname($RoutFile) . '/php/XML.php';
require_once dirname($RoutFile) . '/php/Log.php';
require_once dirname($RoutFile) . '/php/Session.php';

class Expedient {

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
                case "createPathOfDispositionCatalog": $this->createPathOfDispositionCatalog($userData);
                    break;
                case "associateTemplate": $this->associateTemplate($userData);
                    break;
                case "getTemplateData": $this->getTemplateData($userData);
                    break;
            }
        }
    }

    /**
     * @description Inserta el path de claves del catálogo de disposición documental en la 
     * tabla de directorios.
     * 
     * @param type $userData
     */
    private function createPathOfDispositionCatalog($userData) {
        $instanceName = $userData['dataBaseName'];
        $path = filter_input(INPUT_POST, "path");
        $repositoryName = filter_input(INPUT_POST, "repositoryName");
        $xmlString = filter_input(INPUT_POST, "xml");
        $RoutFile_ = dirname(getcwd());
        $path = dirname($RoutFile_)."/Estructuras/$instanceName/$repositoryName";
        $xml = simplexml_load_string($xmlString) or die("Error: No se pudo crear el objeto XML.");

        $index = 0;
        $idParent = 1;
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("expedientAdded");
        $doc->appendChild($root); 
        $newDirectories = $doc->createElement("newDirectories");
        
        foreach ($xml->node as $node) {
            
            $catalogKey = $node->catalogKey;
            $catalogType = $node->catalogType;
            $parentCatalogKey = $node->parentCatalogKey;
            
            if($index == 0)
                $path .= "/". $node->path;
            
            if(isset($node->idParent))
                if((int)$node->idParent > 0)
                    $idParent = $node->idParent;
                                
            $insert = "INSERT INTO dir_$repositoryName (parent_id, title, catalogKey, parentCatalogKey, catalogType) ";

            $insert.= "VALUES ($idParent, '$catalogKey', '$catalogKey', '$parentCatalogKey', '$catalogType')";
            
            $idParentXml = $doc->createElement("idParent", $idParent);
            
            $idParent = $this->db->ConsultaInsertReturnId($instanceName, $insert);                    

            if (!(int) $idParent > 0)
                return XML::XMLReponse("Error", 0, "<p><b>Error al intentar crear el expediente.</p> $idParent");

            $path .= "/$idParent";
            
//            echo "   Creando Path $path   ";

            mkdir($path, 0777, true);
            
            $idDirectory = $idParent;
            
            $directory = $doc->createElement("directory");
            $dirTitle = $doc->createElement("title", $catalogKey);
            $directory->appendChild($dirTitle);
            $idDirectoryXml = $doc->createElement("idDirectory", $idDirectory);
            $directory->appendChild($idDirectoryXml);
            
            $directory->appendChild($idParentXml);
            $catalogTypeXml = $doc->createElement("catalogType", $catalogType);
            $directory->appendChild($catalogTypeXml);
            $parentCatalogKeyXml = $doc->createElement("parentCatalogKey", $parentCatalogKey);
            $directory->appendChild($parentCatalogKeyXml);
            $newDirectories->appendChild($directory);    

            $index++;
        }
        
        $message = $doc->createElement("message", "Expediente Creado");
        $root->appendChild($message);
        $root->appendChild($newDirectories);
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
    }
    
    private function associateTemplate($userData){
        $instanceName = $userData['dataBaseName'];
        $enterpriseKey = filter_input(INPUT_POST, "enterpriseKey");
        $repositoyrName = filter_input(INPUT_POST, "repositoryName");
        $templateName = filter_input(INPUT_POST, "templateName");
        $RoutFile = dirname(getcwd());
        $templateAssociatedPath = "$RoutFile/Configuracion/Templates/$instanceName/$enterpriseKey/$repositoyrName/$templateName";
        $insertTemplate = "INSERT INTO $repositoyrName (templatePath) VALUES ('$templateAssociatedPath')";
        
        if(($result = $this->db->ConsultaInsert($instanceName, $insertTemplate)) != 1)
                return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al intentar asociar la plantilla. $result</p>");
        
        XML::XMLReponse("templateAssociated", 1, "Plantilla asociada.");
    }
    
    private function getTemplateData($userData){
        $instanceName = $userData['dataBaseName'];
        $enterpriseKey = filter_input(INPUT_POST, "enterpriseKey");
        $repositoryName = filter_input(INPUT_POST, "repositoryName");
        $templateName = filter_input(INPUT_POST, "templateName");
        $RoutFile = dirname(dirname(getcwd()));
        $templateAssociatedPath = "$RoutFile/Configuracion/Templates/$instanceName/$enterpriseKey/$repositoryName/$templateName"."_associated.xml";
        
        if(!file_exists($templateAssociatedPath))
            return XML::XMLReponse ("Error", 0, "No existe la plantilla <b>$templateName</b> en $templateAssociatedPath");
        
        $xml = simplexml_load_file($templateAssociatedPath);
        
        var_dump($xml);
        
    }

}

$expedient = new Expedient();
$expedient->Ajax();
