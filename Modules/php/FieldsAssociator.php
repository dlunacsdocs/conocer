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
 * Description of FieldsAssociator
 *
 * @author danielunag
 */
$RoutFile = dirname(getcwd());


require_once dirname($RoutFile).'/php/DataBase.php';
require_once dirname($RoutFile).'/php/XML.php';
require_once dirname($RoutFile).'/php/Log.php';
require_once dirname($RoutFile).'/php/Session.php';
require_once dirname($RoutFile).'/php/Permissions.php';
class FieldsAssociator {
    public function __construct() {
        $this->db = new DataBase();
    }
    
    public function ajax()
    {
        if(filter_input(INPUT_POST, "option")!=NULL and filter_input(INPUT_POST, "option")!=FALSE){
            
            $idSession = Session::getIdSession();
        
            if($idSession == null)
                return XML::XMLReponse ("Error", 0, "FieldsAssociator::No existe una sesión activa, por favor vuelva a iniciar sesión");

            $userData = Session::getSessionParameters();
            
            switch (filter_input(INPUT_POST, "option")){
                case 'createAssociation': $this->createAssociation($userData); break;
            }
        }
    }
    
    private function createAssociation($userData){
        $RoutFile = dirname(dirname(getcwd()));
        $instanceName = $userData['dataBaseName'];
        $xmlString = filter_input(INPUT_POST, "xml");
        
        if(!($xml = simplexml_load_string($xmlString)))
            return XML::XMLReponse ("Error", 0, "<b>Error</b> al recibir el XML.");
        
        $enterpriseKey = $xml['enterpriseKey'];
        $repositoryName = $xml['repositoryName'];
        $templateName = $xml['templateName'];
        $templateAssociatedPath = "$RoutFile/Configuracion/Templates/$instanceName/$enterpriseKey/$repositoryName/$templateName"."_associated.xml";

        if(file_exists($templateAssociatedPath))
            unlink ($templateAssociatedPath);
        
        $xml->saveXML($templateAssociatedPath);
        
        XML::XMLReponse("fieldsAssociated", 1, "Campos asociados.");
    }
}

$fieldsAssociator = new FieldsAssociator();
$fieldsAssociator->ajax();
