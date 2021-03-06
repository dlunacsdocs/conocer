<?php

/*
 * Copyright 2016 danielunag.
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
 * Description of TemplateDesigner
 *
 * @author danielunag
 */

$RoutFile = dirname(getcwd());


require_once dirname($RoutFile).'/php/DataBase.php';
require_once dirname($RoutFile).'/php/XML.php';
require_once dirname($RoutFile).'/php/Log.php';
require_once dirname($RoutFile).'/php/Session.php';
require_once dirname($RoutFile).'/php/Permissions.php';
require_once dirname($RoutFile).'/php/Repository.php';

class TemplateDesigner {
    private $db;
    public function __construct() {
        $this->db = new DataBase();
    }
    
    public function ajax(){
        if(filter_input(INPUT_POST, "option")!=NULL and filter_input(INPUT_POST, "option")!=FALSE){
            
            $idSession = Session::getIdSession();
        
            if($idSession == null)
                return XML::XMLReponse ("Error", 0, "TemplateDesigner::No existe una sesión activa, por favor vuelva a iniciar sesión");

            $userData = Session::getSessionParameters();
            
            switch (filter_input(INPUT_POST, "option")){
                case 'saveTemplate': $this->saveTemplate($userData); break;
                case 'getTemplates': $this->getTemplates($userData); break;
                case 'getTemplate': $this->getTemplate($userData); break;
            }
        }
    }
    
    /**
     * Se obtienen los templates del sistema. En caso de especificar Clave de empresa
     * y nombre del repositorio se hace el filtro a la busqueda.
     * @param type $userData
     */
    private function getTemplates($userData){
        $RoutFile = dirname(getcwd());
        $instanceName = $userData['dataBaseName'];
        $idGroup = $userData['idGroup'];
        $idUser = $userData['idUser'];
        $enterpriseKey = filter_input(INPUT_POST, "enterpriseKey");
        $repositoryName = filter_input(INPUT_POST, "repositoryName");
        $idRepository = filter_input(INPUT_POST, "idRepository");
        
        $repository = new Repository();
        $repositories = array();
        
        if($enterpriseKey == FALSE or $repositoryName == FALSE)
            $repositories = $repository->GetRepositoriesList($instanceName, 0, $idGroup, $idUser);
        else
            $repositories[] = array(
                "ClaveEmpresa" => $enterpriseKey,
                "IdRepositorio" => $idRepository,
                "NombreRepositorio" => $repositoryName
            );
                
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("templatesDetail");
        
        for($cont = 0; $cont < count($repositories); $cont++){
            
                $idRepository = $repositories[$cont]['IdRepositorio'];
                $repositoryName = $repositories[$cont]['NombreRepositorio'];
                $enterpriseKey = $repositories[$cont]['ClaveEmpresa'];
            
            $templatesPath = dirname($RoutFile)."/Configuracion/Templates/$instanceName/$enterpriseKey/$repositoryName";

            $templateDir = array();
            
            $template = $doc->createElement("template");
            $templateList = $doc->createElement("templateList");
            
            if(file_exists($templatesPath))
                $templateDir = scandir($templatesPath);

            for($aux = 0; $aux < count($templateDir); $aux++){
                $templateName = $templateDir[$aux];
                                
                if($templateName != "." and $templateName != ".." and $templateName != ".DS_Store" and $templateName != "@eaDir"){
                    if(strpos($templateName, "_associated") !==false ) 
                       continue;
                    $templateNameXml = $doc->createElement("templateName", $templateName);
                    $templateList->appendChild($templateNameXml);
                }
            }
                        
            $idRepositoryXml = $doc->createElement("idRepository", $idRepository);
            $template->appendChild($idRepositoryXml);
            $repositoryNameXml = $doc->createElement("repositoryName", $repositoryName);
            $template->appendChild($repositoryNameXml);
            $enterpriseKeyXml = $doc->createElement("enterpriseKey", $enterpriseKey);
            $template->appendChild($enterpriseKeyXml);
            $template->appendChild($templateList);
            $root->appendChild($template);
            
        }
        
        $doc->appendChild($root);   
        header ("Content-Type:text/xml");
        echo $doc->saveXML();  
            
    }
    
    private function getTemplate($userData){
        $RoutFile = dirname(getcwd());
        $instanceName = $userData['dataBaseName'];
        $enterpriseKey = filter_input(INPUT_POST, "enterpriseKey");
        $repositoryName = filter_input(INPUT_POST, "repositoryName");
        $templateName = filter_input(INPUT_POST, "templateName");
        
        $destinPath = dirname($RoutFile)."/Configuracion/Templates/$instanceName/$enterpriseKey/$repositoryName/$templateName";
        
        if(!file_exists($destinPath))
            return XML::XMLReponse ("Error", 0, "No existe la plantilla seleccionada.");
        
        if(!($file = fopen($destinPath, 'r')))
                return XML::XMLReponse ("Error", 0, "No fue posible abrir la plantilla. $file");
        $xml = fread($file, filesize($destinPath));
        
        fclose($file);
        
        $xmlDom = simplexml_load_string($xml);
        
        echo $xmlDom->saveXML();
    }

    private function saveTemplate($userData){
        $RoutFile = dirname(getcwd());
        $instanceName = $userData['dataBaseName'];
        $xmlString = filter_input(INPUT_POST, "xml");
        $updateMode = filter_input(INPUT_POST, "updateMode");
        
        if(!($xml = simplexml_load_string($xmlString)))
                return XML::XMLReponse ("Error", 0, "Error al intentar formar el objeto XML");
        
        $attributes = $xml->attributes();
                
        if(!isset ($attributes['repositoryName']))
            return XML::XMLReponse ("Error", 0, "No se encontró el repositorio de destino.");
        
        if(!isset ($attributes['enterpriseKey']))
            return XML::XMLReponse("Error", 0, "No se encontró la clave de la empresa destino");
        
        if(!isset ($attributes['templateName']))
            return XML::XMLReponse("Error", 0, "No se asigno un nombre a la plantilla.");
        
        $templateName = $attributes['templateName'];
        $enterpriseKey = $attributes['enterpriseKey'];
        $repositoryName = $attributes['repositoryName'];
        $destinPath = dirname($RoutFile)."/Configuracion/Templates/$instanceName/$enterpriseKey/$repositoryName";
        
        if(strcasecmp($updateMode, "1") != 0){
            if(file_exists($destinPath."/".$templateName))
                    return XML::XMLReponse ("Error", 0, "El nombre de la plantilla ya existe");
        }
        else{
            if(file_exists($destinPath."/".$templateName))
                unlink ($destinPath."/".$templateName);
        }
        
        if(!file_exists($destinPath))
            if(! ( $createDir = mkdir ($destinPath, 0777, true)))
                    return XML::XMLReponse ("Error", 0, "No fue posible crear la ruta destino para almacenar la nueva plantilla. <br> $createDir");
    
        $xml->saveXML($destinPath."/".$templateName);
        
        if(strcasecmp($updateMode, "1") == 0)
            XML::XMLReponse("templateSaved", 1, "Plantilla $templateName actualizada");
        else
            XML::XMLReponse("templateSaved", 1, "Plantilla $templateName almacenada");
    }
}

$template = new TemplateDesigner();
$template->ajax();
