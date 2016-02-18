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
                case "buildNewArchivalDispositionCatalog": $this->buildNewArchivalDispositionCatalog($userData); break;
                case 'getDocDispositionCatalogStructure': $this->getDocDispositionCatalogStructure($userData); break;
                case 'modifyDocDispCatalogNode': $this->modifyDocDispCatalogNode($userData); break;
                case 'deleteDocDispoCatalogNode': $this->_deleteDocDispoCatalogNode($userData); break;
                case 'storeNewNodeIntoDataBase': $this->storeNewNodeIntoDataBase($userData); break;
            }
        }
    }
    
    private function storeNewNodeIntoDataBase($userData){
        $DB = new DataBase();
        
        $instanceName = $userData['dataBaseName'];
        $catalogName = filter_input(INPUT_POST, "catalogName");
        $nameKey = filter_input(INPUT_POST, "nameKey");
        $nodeType = filter_input(INPUT_POST, "nodeType");
        $description = filter_input(INPUT_POST, "description");
        $parentKey = filter_input(INPUT_POST, "parentKey");
        
        $insert = "INSERT INTO CSDocs_DocumentaryDisposition (Name, NameKey, "
                . "Description, NodeType, ParentKey) VALUES ('$catalogName', '$nameKey', '$description', '$nodeType', '$parentKey')";

        $newIdDocDisposition = $DB->ConsultaInsertReturnId($instanceName, $insert);
        
        if(!((int)$newIdDocDisposition > 0))
                return XML::XMLReponse ("Error", 1, "<p><b>Error/<b> al intentar agregar el nuevo elemento</p>Detalles:<br>$newIdDocDisposition");
    
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("storeResponse");
        $newIdDocDispositionXml = $doc->createElement("newIdDocDisposition", $newIdDocDisposition);
        $root->appendChild($newIdDocDispositionXml);
        $Mensaje = $doc->createElement("Mensaje", "Elemento añadido correctamente");
        $root->appendChild($Mensaje);
        $doc->appendChild($root);   
        header ("Content-Type:text/xml");
        echo $doc->saveXML();  
        
    }
    
    private function _deleteDocDispoCatalogNode($userData){
        $db = new DataBase();
        
        $dataBaseName = $userData['dataBaseName'];
        $action = filter_input(INPUT_POST, "action");
        $xmlString = filter_input(INPUT_POST, "xml");
        $delete = "DELETE FROM CSDocs_DocumentaryDisposition WHERE ";
        
        if(!Permissions::checkPermission(0, $action))
            return XML::XMLReponse ("Error", 0, "<p>No tiene permisos para realizar esta acción.</p>");
        
        if(!($xml = simplexml_load_string($xmlString))){
            $errorOutput = "";
            foreach(libxml_get_errors() as $error) {
                $errorOutput.=$error->message."<br>";
            }
            
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> la estructura XML no se ha formado correctamente. No se logró eliminar el elemento. </p><br>Detalles:<br>$errorOutput");
        }
        
        foreach ($xml->node as $node){
            $delete.= "idDocumentaryDisposition = $node->idDocDisposition OR ";
        }
        
        $deleteString = trim($delete, "OR ");
        
        if(($result = $db->ConsultaQuery($dataBaseName, $deleteString)) != 1)
                return XML::XMLReponse ("Error", 0, "<p><b>Error<b> al intentar eliminar el elemento</p>Detalles:<br>$result");
        
        XML::XMLReponse("deleted", 1, "Elemento eliminado con éxito");
    }
    
    private function buildNewArchivalDispositionCatalog($userData){
        $DB = new DataBase();
        
        $instanceName = $userData['dataBaseName'];
                
        $xmlStructureString = filter_input(INPUT_POST, "xmlStructure");
        $values = "";
        
        
        if(!($xml = simplexml_load_string($xmlStructureString))){
            $errorOutput = "";
            foreach(libxml_get_errors() as $error) {
                $errorOutput.=$error->message."<br>";
            }
            
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> la estructura XML no se ha formado correctamente</p><br>Detalles:<br>$errorOutput");
        }
        
                
        foreach ($xml->node as $node){
            $values.="('$node->title', '$node->key', '$node->description', "
                    . "'$node->type', '$node->parentNode'),";
        }
        
        $insert = "INSERT INTO CSDocs_DocumentaryDisposition (Name, NameKey, "
                . "Description, NodeType, ParentKey) VALUES ".trim($values, ",");
        
        if(($insertResult = $DB->ConsultaInsert($instanceName, $insert)) != 1)
                return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al registrar "
                        . "el Catálogo de Disposición Documental</p> <br> Detalles: <br> $insertResult");

        XML::XMLReponse("docuDispositionCatalogCreated", 1, "Catálogo de Disposición Documental generado");
    }
    
    private function getDocDispositionCatalogStructure($userData){
        $DB = new DataBase();
        
        $dataBaseName = $userData['dataBaseName'];
                
        $select = "SELECT * FROM CSDocs_DocumentaryDisposition";
        
        $structure = $DB->ConsultaSelect($dataBaseName, $select);
        
        if($structure['Estado'] != 1)
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al obtener el <b>Catálogo de Disposición Documental</b><br>Detalles:<br>".$structure['Estado']);
        
        $structureArray = $structure['ArrayDatos'];
        
        return XML::XmlArrayResponse("docDispositionCatalog", "node", $structureArray);
        
    }
    
    private function modifyDocDispCatalogNode($userData){
        $DB = new DataBase();
        
        $action = filter_input(INPUT_POST, "action");    
        $dataBaseName = $userData['dataBaseName'];
        $idDocDisposition = filter_input(INPUT_POST, "idDocDisposition");
        $catalogName = filter_input(INPUT_POST, "catalogName");
        $nameKey = filter_input(INPUT_POST, "nameKey");
        $nodeType = filter_input(INPUT_POST, "nodeType");
        $description = filter_input(INPUT_POST, "description");
        $parentKey = filter_input(INPUT_POST, "parentKey");
        $oldNameKey = filter_input(INPUT_POST, "oldNameKey");
                
        if(!Permissions::checkPermission(0, $action))
            return XML::XMLReponse ("Error", 0, "<p>No tiene permisos para realizar esta acción.</p>");
                
        $update = "UPDATE CSDocs_DocumentaryDisposition SET 
                Name = '$catalogName', NameKey = '$nameKey', Description = '$description',
                NodeType = '$nodeType'
                WHERE idDocumentaryDisposition = $idDocDisposition ";
        
        $updateChilds = "UPDATE CSDocs_DocumentaryDisposition SET ParentKey = '$nameKey' 
                WHERE ParentKey = '$oldNameKey' AND idDocumentaryDisposition != $idDocDisposition";
        
        if(strcasecmp($oldNameKey, $nameKey) != 0){
            if(!($updateChildsResult = $DB->ConsultaQuery($dataBaseName, $updateChilds)))
                return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al intentar actualizar los subitems</p> Detalles:<br>$updateChildsResult");
        }
        
        if(!($updateResult = $DB->ConsultaQuery($dataBaseName, $update)))
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al intentar actualizar la información.</p><br>Detalles:<br>$updateResult");
               
        XML::XMLReponse("updateCompleted", 1, "<p>Datos actualizados</p>");
    }
    
}

$archival = new Archival();
