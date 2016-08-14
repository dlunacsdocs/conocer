<?php

/**
 * Description of AdministrativeUnit
 *
 * @author daniel
 */
$RoutFile = dirname(getcwd());

require_once dirname($RoutFile).'/php/DataBase.php';
require_once dirname($RoutFile).'/php/XML.php';
require_once dirname($RoutFile).'/php/Log.php';
require_once dirname($RoutFile).'/php/Session.php';

class AdministrativeUnit {
    private $db;
    
    public function __construct() {
        $this->db = new DataBase();
    }
    
    public function ajax(){
        if(filter_input(INPUT_POST, "option")!=NULL and filter_input(INPUT_POST, "option")!=FALSE){
            
            $idSession = Session::getIdSession();
        
            if($idSession == null)
                return XML::XMLReponse ("Error", 0, "AdministrativeUnit::No existe una sesión activa, por favor vuelva a iniciar sesión");

            $userData = Session::getSessionParameters();
            
            switch (filter_input(INPUT_POST, "option")){
                case 'addNewAdminUnit': $this->addNewAdminUnit($userData); break;
                case 'getAdministrativeUnitStructure': $this->getAdministrativeUnitStructure($userData); break;
                case 'modifyAdminUnit': $this->modifyAdminUnit($userData); break;
                case 'deleteAdminUnit': $this->deleteAdminUnit($userData); break;
                case 'mergeAdminUnitAndSerie': $this->mergeAdminUnitAndSerie($userData); break;
                case 'getSeriesStructure': $this->getSeriesStructure($userData); break;
                case 'mergeUserGroupAndAdminUnit': $this->mergeUserGroupAndAdminUnit($userData); break;
                case 'getAdminUnitWithoutSerie': $this->getAdminUnitWithoutSerie($userData); break;
                case 'removeAdminUnit': $this->removeAdminUnit($userData); break;
                case 'removeMergeUserGroupAndAdminUnit': $this->removeMergeUserGroupAndAdminUnit($userData); break;
            }
        }
    }
    
    private function getAdministrativeUnitStructure($userData){
        $instanceName = $userData['dataBaseName'];
        
        $select = "SELECT *FROM CSDocs_AdministrativeUnit";
        
        $selectResult = $this->db->ConsultaSelect($instanceName, $select);
        
        if($selectResult['Estado'] != 1)
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al intentar obtener a Unidad Administrativa</p>Detalles:<br>".$selectResult['Estado']);
    
        XML::XmlArrayResponse("administrativeUnit", "area", $selectResult['ArrayDatos']);
        
    }
    
    private function modifyAdminUnit($userData){
        $instanceName = $userData['dataBaseName'];
        
        $idAdminUnit = filter_input(INPUT_POST, "idAdminUnit");
        $name = filter_input(INPUT_POST, "name");
        $description = filter_input(INPUT_POST, "description");
        
        $update = "UPDATE CSDocs_AdministrativeUnit SET Name = '$name', Description = '$description' WHERE idAdminUnit = $idAdminUnit";
        
        if(($updateResult = $this->db->ConsultaQuery($instanceName, $update)) != 1)
                return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al intentar actualizar la información</p>Detalles:<br>$updateResult");
    
        XML::XMLReponse("adminUnitModified", 1, "Información Actualizada");
    }
    
    private function deleteAdminUnit($userData){
        $instanceName = $userData['dataBaseName'];
        
        $xmlString = filter_input(INPUT_POST, "xml");
        
        if(!($xml = simplexml_load_string($xmlString))){
            $errorOutput = "";
            foreach(libxml_get_errors() as $error) {
                $errorOutput.=$error->message."<br>";
            }
            
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> la estructura XML no se ha formado correctamente. No se logró eliminar el elemento. </p><br>Detalles:<br>$errorOutput");
        }
        
        $delete = "DELETE FROM CSDocs_AdministrativeUnit WHERE ";
        
        foreach ($xml->administrativeUnit as $adminUnit){
           $delete.= " idAdminUnit = ".$adminUnit->idAdminUnit." OR";
        }
        
        $deleteQuery = trim($delete, "OR");
        
        if(($deleteResult = $this->db->ConsultaQuery($instanceName, $deleteQuery)) !=1 )
                return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al intentar eliminar la Unidad Administrativa </p>Detalles:<br>$deleteResult");
    
        XML::XMLReponse("adminUnitDeleted", 1, "Unidad Administrativa Eliminada");
    }
    
    private function addNewAdminUnit($userData){
        $instanceName = $userData['dataBaseName'];
        
        $name = filter_input(INPUT_POST, "name");
        $description = filter_input(INPUT_POST, "description");
        $idParent = filter_input(INPUT_POST, "idParent");
        
        $insert = "INSERT INTO CSDocs_AdministrativeUnit (Name, Description, IdParent) VALUES ('$name', '$description', $idParent)";
        
        $insertResult = $this->db->ConsultaInsertReturnId($instanceName, $insert);
        
        if(!(int)$insertResult > 0)
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al almacenar la nueva Unidad Administrativa</p>Detalles:<br>$insertResult");
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("newAdminUnitAdded");
        $newidRegister = $doc->createElement("idAdminUnit", $insertResult);
        $root->appendChild($newidRegister);
        $Mensaje = $doc->createElement("message", "Nueva Unidad Administrativa Almacenada");
        $root->appendChild($Mensaje);
        $doc->appendChild($root);   
        header ("Content-Type:text/xml");
        echo $doc->saveXML();  
        
    }
    
    private function mergeAdminUnitAndSerie($userData){
        $instanceName = $userData['dataBaseName'];
        
        $idAdminUnit = filter_input(INPUT_POST, "idAdminUnit");
        $idSerie = filter_input(INPUT_POST, "idSerie");
        
        $insert = "UPDATE CSDocs_AdministrativeUnit SET IdSerie = $idSerie WHERE idAdminUnit = $idAdminUnit
                ";
        
        if(($insertResult = $this->db->ConsultaQuery($instanceName, $insert)) != 1)
                return XML::XMLReponse ("Error", 1, "<p><b>Error</b> al intentar realizar la fusión</p>Detalles:<br>$insertResult");
    
        XML::XMLReponse("doneMerge", 1, "Fusión realizada");
    }
    
    /**
     * Description: Obtiene la relación entre las series y Unidades Administrativas con la relación de Grupos de Usuario.
     * @param type $userData
     * @return type
     */
    private function getSeriesStructure($userData){
        $instanceName = $userData['dataBaseName'];
        
        $select = "
            SELECT doc.idDocumentaryDisposition, doc.Name, doc.NameKey, 
            doc.Description, doc.ParentKey, doc.NodeType, 
            au.idAdminUnit, au.Name, gu.IdGrupo, gu.Nombre
            FROM CSDocs_DocumentaryDisposition doc 
            LEFT JOIN CSDocs_AdministrativeUnit au ON doc.idDocumentaryDisposition = au.idSerie
            LEFT JOIN GruposUsuario gu ON au.idUserGroup = gu.IdGrupo
            WHERE doc.NodeType = 'serie'
            ";
        
        $seriesArray = $this->db->ConsultaSelect($instanceName, $select, 0);
        
        if($seriesArray['Estado'] != 1)
            return XML::XMLReponse ("Error", 0, $seriesArray['Estado']);
        
        $data = $seriesArray['ArrayDatos'];
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("Serie");
        $doc->appendChild($root);         
        
        for  ($cont = 0; $cont < count($data); $cont++){
                $bloque = $doc->createElement("serie");    
                $row = $data[$cont];
                $idDocumentaryDisposition = $doc->createElement("idDocumentaryDisposition",$row[0]);
                $bloque->appendChild($idDocumentaryDisposition);
                $name = $doc->createElement("Name",$row[1]);
                $bloque->appendChild($name);
                $nameKey = $doc->createElement("NameKey",$row[2]);
                $bloque->appendChild($nameKey);
                $description = $doc->createElement("Description",$row[3]);
                $bloque->appendChild($description);
                $parentKey = $doc->createElement("ParentKey", $row[4]);
                $bloque->appendChild($parentKey);
                $nodeType = $doc->createElement("NodeType", $row[5]);
                $bloque->appendChild($nodeType);
                $idAdminUnit = $doc->createElement("idAdminUnit", $row[6]);
                $bloque->appendChild($idAdminUnit);
                $adminUnitName = $doc->createElement("adminUnitName", $row[7]);
                $bloque->appendChild($adminUnitName);
                $idUserGroup = $doc->createElement("idUserGroup", $row[8]);
                $bloque->appendChild($idUserGroup);
                $userGroupName = $doc->createElement("userGroupName", $row[9]);
                $bloque->appendChild($userGroupName);
                
                $root->appendChild($bloque);
        }            
            
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
        
    }
    
    private function getAdminUnitWithoutSerie($userData){
        $instanceName = $userData['dataBaseName'];
        
        $select = "SELECT *FROM CSDocs_AdministrativeUnit WHERE idSerie = 0";
        
        $selectResult = $this->db->ConsultaSelect($instanceName, $select);
        
        if($selectResult['Estado'] != 1)
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al intentar obtener a Unidad Administrativa</p>Detalles:<br>".$selectResult['Estado']);
    
        XML::XmlArrayResponse("administrativeUnit", "area", $selectResult['ArrayDatos']);
    }
    
    private function mergeUserGroupAndAdminUnit($userData){
        $instanceName = $userData['dataBaseName'];
        
        $idUserGroup = filter_input(INPUT_POST, "idUserGroup");
        $idAdminUnit = filter_input(INPUT_POST, "idAdminUnit");
        
        $update = "UPDATE CSDocs_AdministrativeUnit SET idUserGroup = $idUserGroup WHERE idAdminUnit = $idAdminUnit";
        
        if(($updateResult = $this->db->ConsultaQuery($instanceName, $update)) != 1)
                return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al intentar crear la relación entre la Unidad Administrativa y el Grupo de Usuario Seleccionado</p>Detalles:<br><br>$updateResult");
    
        XML::XMLReponse("doneMerge", 1, "Relación creada.");
    }
    
    private function removeAdminUnit($userData){
        $instanceName = $userData['dataBaseName'];
        
        $idAdminUnit = filter_input(INPUT_POST, "idAdminUnit");
        
        $update = "UPDATE CSDocs_AdministrativeUnit SET IdSerie = 0, idUserGroup = 0 WHERE idAdminUnit = $idAdminUnit";
        
        if(($updateResult = $this->db->ConsultaQuery($instanceName, $update)) != 1)
                return XML::XMLReponse ("dondeMerge", 1, "<p><b>Error</b> al intentar eliminar la relación entre la serie y la Unidad Administrativa</p>Detalles:<br>$updateResult");
    
        XML::XMLReponse("adminUnitRemoved", 1, "Relación eliminada con la Unidad Administrativa");
    }
    
    private function removeMergeUserGroupAndAdminUnit($userData){
        $instanceName = $userData['dataBaseName'];
        
        $idUserGroup = filter_input(INPUT_POST, "idUserGroup");
        $idAdminUnit = filter_input(INPUT_POST, "idAdminUnit");
        
        $update = "UPDATE CSDocs_AdministrativeUnit SET idUserGroup = 0 WHERE idAdminUnit = $idAdminUnit";
        
        if(($updateResult = $this->db->ConsultaQuery($instanceName, $update)) != 1)
                return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al intentar eliminar relación entre el Grupo de Usuario y la Unidad Administrativa</p>Detalles:<br>$updateResult");
    
        XML::XMLReponse("removed", 1, "Relación eliminada");
    }
    
}

$admin = new AdministrativeUnit();
$admin->ajax();