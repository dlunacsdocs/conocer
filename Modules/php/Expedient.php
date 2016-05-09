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
                case "getTemplateAssociated": $this->getTemplateAssociated($userData);
                    break;
                case 'addTemplate': $this->addTemplate($userData);
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
            $idDocDisposition = $node->idDocDisposition;
            $docDispositionName = $node->name;
            
            if($index == 0)
                $path .= "/". $node->path;
            
            if(isset($node->idParent))
                if((int)$node->idParent > 0)
                    $idParent = $node->idParent;
                                
            $insert = "INSERT INTO dir_$repositoryName (parent_id, title, catalogKey, parentCatalogKey, catalogType, idDocDisposition) ";

            $insert.= "VALUES ($idParent, '$catalogKey', '$catalogKey', '$parentCatalogKey', '$catalogType', $idDocDisposition)";
            
            $idParentXml = $doc->createElement("idParent", $idParent);
            
            $idParent = $this->db->ConsultaInsertReturnId($instanceName, $insert);                    

            if (!(int) $idParent > 0)
                return XML::XMLReponse("Error", 0, "<p><b>Error al intentar crear el expediente.</p> $idParent");

            $path .= "/$idParent";
            
//            echo "   Creando Path $path   ";

            mkdir($path, 0777, true);
            
            $idDirectory = $idParent;
            
            $directory = $doc->createElement("directory");
            $directory->appendChild($idParentXml);
            $dirTitle = $doc->createElement("title", $catalogKey);
            $directory->appendChild($dirTitle);
            $idDirectoryXml = $doc->createElement("idDirectory", $idDirectory);
            $directory->appendChild($idDirectoryXml);
            $docDispositionNameXml = $doc->createElement("docDispositionName",$docDispositionName);
            $directory->appendChild($docDispositionNameXml);
            $catalogTypeXml = $doc->createElement("catalogType", $catalogType);
            $directory->appendChild($catalogTypeXml);
            $parentCatalogKeyXml = $doc->createElement("parentCatalogKey", $parentCatalogKey);
            $directory->appendChild($parentCatalogKeyXml);
            $idDocDispositionXml = $doc->createElement("idDocDisposition", $idDocDisposition);
            $directory->appendChild($idDocDispositionXml);
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
    
    /**
     * Devuelve la información generando un query dinámicamente 
     * @param type $userData
     * @return type
     */
    private function getTemplateData($userData){
        $instanceName = $userData['dataBaseName'];
        $idDocDisposition = filter_input(INPUT_POST, "idDocDisposition");
        $enterpriseKey = filter_input(INPUT_POST, "enterpriseKey");
        $repositoryName = filter_input(INPUT_POST, "repositoryName");
        $templateName = filter_input(INPUT_POST, "templateName");
        $catalogkey = filter_input(INPUT_POST, "catalogKey");
        $RoutFile = dirname(dirname(getcwd()));
        $templateAssociatedPath = "$RoutFile/Configuracion/Templates/$instanceName/$enterpriseKey/$repositoryName/$templateName"."_associated.xml";
        
        if(!(int) $idDocDisposition > 0)
            return XML::XMLReponse ("Error", 0, "<p>No se obtuvo un identificador para la consulta</p>");
        
        if(!file_exists($templateAssociatedPath))
            return XML::XMLReponse ("Warning", 0, "No existe la plantilla de relación de campos de <b>$templateName</b>. Debe relacionar los campos desde el menú -> Asociar de Campos");
        
        $xml = simplexml_load_file($templateAssociatedPath);
        $DocumentaryDisposition = "";
        $DocumentValidity = "";
        $repository = "";
        
        $getData = "SELECT DocumentaryDisposition.*, DocumentValidity.* 
                    FROM CSDocs_DocumentValidity DocumentValidity LEFT JOIN  
                    CSDocs_DocumentaryDisposition DocumentaryDisposition 
                    ON DocumentValidity.idDocDisposition = DocumentaryDisposition.idDocumentaryDisposition 
                    WHERE DocumentaryDisposition.idDocumentaryDisposition = $idDocDisposition";

        $data = $this->db->ConsultaSelect($instanceName, $getData);
        
        if($data["Estado"] != 1)
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al obtener los datos de la plantilla</p><br>".$data['Estado']);
        
        XML::XmlArrayResponse("templateData", "data", $data['ArrayDatos']);
    }
    
    /**
     * Devuelve el XML con los campos asociados
     */
    private function getTemplateAssociated($userData){
        $instanceName = $userData['dataBaseName'];
        $enterpriseKey = filter_input(INPUT_POST, "enterpriseKey");
        $repositoryName = filter_input(INPUT_POST, "repositoryName");
        $templateName = filter_input(INPUT_POST, "templateName");
        
        $RoutFile = dirname(dirname(getcwd()));
        $templateAssociatedPath = "$RoutFile/Configuracion/Templates/$instanceName/$enterpriseKey/$repositoryName/$templateName"."_associated.xml";
        
        if(!file_exists($templateAssociatedPath))
            return XML::XMLReponse ("Warning", 0, "No existe la plantilla de relación de campos de <b>$templateName</b>. Debe relacionar los campos desde el menú -> Asociar de Campos");
        
        if(!($xml = simplexml_load_file($templateAssociatedPath)))
                return XML::XMLReponse("Error", 0, "<p>No se ha podido abrir el XML</p>");
        
        header ("Content-Type:text/xml");
        echo $xml->saveXML();
    }
    
    /**
     * Método que ingresa la plantilla a un expediente.
     * @param type $userData
     * @return type
     */
    private function addTemplate($userData){
        $instanceName = $userData['dataBaseName'];
        $idEnterprise = filter_input(INPUT_POST, "idEnterprise");
        $enterpriseKey = filter_input(INPUT_POST, "enterpriseKey");
        $repositoryName = filter_input(INPUT_POST, "repositoryName");
        $idDirectory = filter_input(INPUT_POST, "idDirectory");
        $templateName = filter_input(INPUT_POST, "templateName");
        $RoutFile = dirname(dirname(getcwd()));
        $directoryPath = filter_input(INPUT_POST, "directoryKeyPath");
        $PathFinal = dirname($directoryPath)."/";
        $IdParentDirectory = basename($PathFinal);
        $templateAssociatedPath = "$RoutFile/Configuracion/Templates/$instanceName/$enterpriseKey/$repositoryName/$templateName"."_associated.xml";
        $objectDataTemplate = filter_input(INPUT_POST, "objectDataTemplate");
        
        $xmlPathDestination = "$RoutFile/Estructuras/$instanceName/$repositoryName$PathFinal";

        if(!($xml = simplexml_load_string($objectDataTemplate)))
                return XML::XMLReponse ("Error", 0, "<p>No fue posible cargar el XML, es posible que no se haya formado correctamente</p>");
        
        $insert = $this->buildQueryStringInsert($xml, $repositoryName, $idDirectory, $idEnterprise);

        $idExpedient = $this->db->ConsultaInsertReturnId($instanceName, $insert);
        if((int)$idExpedient > 0){
            $xml->saveXML($xmlPathDestination."Plantilla.xml");
            return XML::XMLReponse("templateAdded", 1, "Carátula Almacenanda");
        }
        else
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al almacenar la plantilla</p>".$idExpedient);        
    }
    
    private function buildQueryStringInsert(SimpleXMLElement $xml, $repositoryName, $idDirectory, $idEmpresa){
        $userName       = $_SESSION['userName'];
        $insert         = "INSERT INTO $repositoryName (";
        $fullText       = "";
        $fechaIngreso   = date("Y-m-d");

        foreach ($xml->field as $value){
            $columns["$value->columnName"] = $value->columnName;
            $fieldType = $value->fieldType;
            $value = DataBase::FieldFormat($value->fieldValue, $fieldType);
            $values[] = $value;
            $fullText.="$value ";
        }
        
        $insert.= implode(", ",array_keys($columns)) . ", idDirectory, idEmpresa, FechaIngreso, UsuarioPublicador) VALUES (";
        $insert.= implode(", ", $values) . ", $idDirectory, $idEmpresa, '$fechaIngreso', '$userName')";
        
        return $insert;
    }
    

}

$expedient = new Expedient();
$expedient->Ajax();
