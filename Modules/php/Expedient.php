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
                case "getAutoincrement": $this->getAutoincrement($userData);
                    break;
                case 'getFrontPageData': $this->getFrontPageData($userData);
                    break;
                case "checkAuthorization": $this->checkAuthorization($userData);
                    break;
            }
        }
    }
    
    private function checkAuthorization($userData){
        $instanceName = $userData['dataBaseName'];
        $idGroup = $userData['idGroup'];
        $idDocDisposition = filter_input(INPUT_POST, "idDocDisposition");
        $authorized = 0;
        $select = "SELECT sau.* FROM CSDocs_Serie_AdminUnit sau WHERE sau.idUserGroup = $idGroup
                AND sau.idSerie = $idDocDisposition AND sau.idAdminUnit > 0";
        
        if((int)$idGroup == 1)   /* Grupo administrador */
            return XML::XMLReponse("authorized", 1, "");
        
        $res = $this->db->ConsultaSelect($instanceName, $select);
        
        if($res['Estado'] != 1)
            return XML::XMLReponse ("Error", 0, "<b>Error</b> al comprobar autorizacion de permisos sobre expediente. <br>".$res);
        
        if(count($res['ArrayDatos']) > 0)
            $authorized = 1;
        
        return XML::XMLReponse("authorized", $authorized, "");
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
        $idRepository = filter_input(INPUT_POST, "idRepository");
        $repositoryName = filter_input(INPUT_POST, "repositoryName");
        $idDirectory = filter_input(INPUT_POST, "idDirectory");
//        $templateName = filter_input(INPUT_POST, "templateName");
        $catalogKey = filter_input(INPUT_POST, "catalogKey");
        $frontPageName = filter_input(INPUT_POST, "frontPageName");
        $RoutFile = dirname(dirname(getcwd()));
        $directoryPath = filter_input(INPUT_POST, "directoryKeyPath");
//        $PathFinal = dirname($directoryPath)."/";
//        $IdParentDirectory = basename($PathFinal);
//        $templateAssociatedPath = "$RoutFile/Configuracion/Templates/$instanceName/$enterpriseKey/$repositoryName/$templateName"."_associated.xml";
        $objectDataTemplate = filter_input(INPUT_POST, "objectDataTemplate");
        
        $xmlPathDestination = "$RoutFile/Estructuras/$instanceName/$repositoryName$directoryPath/";

        if(!($xml = simplexml_load_string($objectDataTemplate)))
                return XML::XMLReponse ("Error", 0, "<p>No fue posible cargar el XML, es posible que no se haya formado correctamente</p>");
        
        $insert = $this->buildQueryStringInsert($xml, $repositoryName, $idDirectory, $idEnterprise, $catalogKey, $frontPageName, $xmlPathDestination."Caratula.xml");
        $idExpedient = $this->db->ConsultaInsertReturnId($instanceName, $insert['insert']);
        
        if(!(int)$idExpedient > 0)
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al almacenar la plantilla</p>".$idExpedient. " <br>".$insert['insert']);
        
        $insertIntoGlobal = $this->insertExpedientIntoGlobal($instanceName, $idExpedient, $idRepository, $enterpriseKey, $repositoryName);
        
        if(!(int)$insertIntoGlobal > 0)
            return XML::XMLReponse ("Error", 0, $insertIntoGlobal);
        
        $templateXmlPath = $xmlPathDestination.$idDirectory."/Plantilla.xml";
     
        $xml->saveXML($templateXmlPath);

        $doc  = new DOMDocument('1.0','utf-8');
        libxml_use_internal_errors(true);
        $doc->formatOutput = true;
        $root = $doc->createElement("templateAdded");
        $doc->appendChild($root); 
        $Estado=$doc->createElement("Estado",1);
        $root->appendChild($Estado);
        $Mensaje=$doc->createElement("Mensaje","Carátula Almacenanda");
        $root->appendChild($Mensaje);
        $pathXml = $doc->createElement("path", $xmlPathDestination."Plantilla.xml");
        $root->appendChild($pathXml);
        $idFileXml = $doc->createElement("idExpedient", $idExpedient);
        $root->appendChild($idFileXml);
        $fullXml = $doc->createElement("full", $insert['full']);
        $root->appendChild($fullXml);
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
    }
    
    private function buildQueryStringInsert(SimpleXMLElement $xml, $repositoryName, $idDirectory, $idEmpresa, $catalogKey, $frontPageName, $filePath){
        $userName       = $_SESSION['userName'];
        $insert         = "INSERT INTO $repositoryName (";
        $fechaIngreso   = date("Y-m-d");
        $filename       = "Carátula $frontPageName";
        $fullText       = "$fechaIngreso $repositoryName $userName ";
        
        foreach ($xml->field as $value){
            $columns["$value->columnName"] = $value->columnName;
            $fieldType = $value->fieldType;
            $fieldValue = $value->fieldValue;
            $fullText.="$fieldValue ";
            $isCatalog = $value->isCatalog;
            
            if(strcasecmp($isCatalog, "true") == 0)
                    $fieldValue = $value->catalogOption;
            
            $value = DataBase::FieldFormat($fieldValue, $fieldType);
            $values[] = $value;
        }
        
        $insert.= implode(", ",array_keys($columns)) . ", idDirectory, idEmpresa, FechaIngreso, NombreArchivo, UsuarioPublicador, RutaArchivo, Full) VALUES (";
        $insert.= implode(", ", $values) . ", $idDirectory, $idEmpresa, '$fechaIngreso', CONCAT('$filename', (SELECT autoincrement  FROM dir_$repositoryName D WHERE D.IdDirectory = $idDirectory)) , '$userName', '$filePath',  CONCAT('$filename', (SELECT autoincrement FROM dir_$repositoryName D WHERE D.IdDirectory = $idDirectory), ' $fullText'))";
        $result = array("insert" => $insert, "full" => $fullText);
        
        return $result;
    }
    /**
     * Metodo que ingresa el nuevo expediente al repositorio global, devuelve el id global, en caso
     * contrario devuelve el error.
     * @param type $instanceName
     * @param type $idFile
     * @param type $idRepository
     * @param type $enterpriseKey
     * @param type $repositoryName
     * @return type Int|String 
     */
    private function insertExpedientIntoGlobal($instanceName, $idFile,$idRepository, $enterpriseKey, $repositoryName){
        $insert = "INSERT INTO RepositorioGlobal 
                (IdFile, IdEmpresa, IdRepositorio, NombreRepositorio, IdDirectory, NombreEmpresa, NombreArchivo, TipoArchivo, 
                RutaArchivo, UsuarioPublicador, FechaIngreso, Full)  
                SELECT rep.IdRepositorio, rep.IdEmpresa, repo.IdRepositorio, repo.NombreRepositorio, 
                rep.IdDirectory, emp.ClaveEmpresa, rep.NombreArchivo, rep.TipoArchivo, 
                rep.RutaArchivo, rep.UsuarioPublicador, rep.FechaIngreso, rep.Full 
                FROM $repositoryName rep 
                LEFT JOIN CSDocs_Empresas emp ON emp.ClaveEmpresa = '$enterpriseKey'
                LEFT JOIN CSDocs_Repositorios repo ON repo.IdRepositorio = $idRepository
                WHERE rep.IdRepositorio = $idFile";
        
        $result = $this->db->ConsultaInsertReturnId($instanceName, $insert);
        
        if(!(int)$result > 0)
            return "<p>Error al registrar en global el expediente.</p> $result <br> $insert";
        else
            return $result;
    }
    
    private function getFrontPageData($userData){
        $instanceName = $userData['dataBaseName'];
        $enterpriseKey = filter_input(INPUT_POST,"enterpriseKey");
        $repositoryName = filter_input(INPUT_POST, "repositoryName");
        $directoryPath = filter_input(INPUT_POST, "directoryKeyPath");
        $RoutFile = dirname(dirname(getcwd()));
        $xmlPathDestination = "$RoutFile/Estructuras/$instanceName/$repositoryName$directoryPath"."/Plantilla.xml";
        if(!file_exists($xmlPathDestination))
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> No se localiza la ruta de la plantilla</p>".$xmlPathDestination);
        
        $xml = simplexml_load_file($xmlPathDestination);
        echo $xml->saveXML();
    }
}

$expedient = new Expedient();
$expedient->Ajax();
