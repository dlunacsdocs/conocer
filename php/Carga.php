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
 * Description of Carga
 *
 * @author daniel
 */
include_once 'XML.php';
include_once 'DataBase.php';
include_once 'DesignerForms.php';
class Carga {
    private $db;
    private $prefix;
    private $structure;
    public function __construct() {
        $this->db = new DataBase();
        $this->prefix = "COL ";
        $this->structure = $this->GetStructure();
    }
    public function start(){
        $conocerData = $this->getConocerDocuments();
        $columnNames = $this->getColumnNames($conocerData);
        
        $this->buildDirectoriesStructure($columnNames, $conocerData);
    }
    
    private function getColumnNames($arrayDatos){
        $columnNames = array();
        if(!isset($arrayDatos[0]))
            return null;
        
        $columns = $arrayDatos[0];
        foreach ($columns as $key => $value){
            $columnNames[$key] = $value;
        }
        return $columnNames;
    }
    
    private function getConocerDocuments(){
        $select = "SELECT *FROM ConocerDocuments";
        $data = $this->db->ConsultaSelect("CONOCER", $select);
        
        if($data['Estado'] != 1)
            return $data['Estado'];
        return $data['ArrayDatos'];
    }
    
    private function buildDirectoriesStructure($columnNames, $conocerData){
        $prefix = $this->prefix;
        for($cont = 1; $cont < 10; $cont++){
            echo "<pre>";
            foreach ($conocerData[$cont] as $key => $value){
//                echo "$key: $columnNames[$key] = $value || ";
            }

            $fondo = $conocerData[$cont]["$prefix"."1"];            
            $idFondo = $this->getIdDirectory($fondo, "$fondo.", "", 0, "fondo", "",$conocerData[$cont]);
            echo "<p>fondo: $fondo</p>";
            echo "idFondo: $idFondo";
            $subFondo = $conocerData[$cont]["$prefix"."2"];
            $idSubFondo = $this->getIdDirectory($subFondo, "$fondo.$subFondo/", "$fondo", $idFondo, "fondo", "/$idFondo/", $conocerData[$cont]);
            echo "<p>subfondo: $subFondo</p>";
            echo "<p>idSubFondo: $idSubFondo</p>";
            $seccion = $conocerData[$cont]["$prefix"."3"];
            echo "secc: $seccion";
            $idSection = $this->getIdDirectory($subFondo.".".$seccion, $fondo.".".$subFondo."/".$seccion."/", "$fondo.$subFondo/", $idSubFondo, "section", "/$idFondo/$idSubFondo/", $conocerData[$cont]);
            echo "</p>idSection: $idSection</p>";
            $serie = $conocerData[$cont]["$prefix"."4"];
            echo "<p>serie: $serie</p>";
            $idSerie = $this->getIdDirectory($subFondo.".".$seccion.".".$serie, $fondo.".".$subFondo."/".$seccion."/$serie/", $fondo.".".$subFondo."/".$seccion."/",  $idSection, "serie", "/$idFondo/$idSubFondo/$idSection/", $conocerData[$cont]);
            echo "<p>idSerie: $idSerie</p>";     
            $subserie = $conocerData[$cont]["$prefix"."5"];
            $idSubserie = "";
            $keyPath = "/$idFondo/$idSubFondo/$idSection/$idSerie/";
            if(strlen($subserie) > 0){
                echo "<p>Subserie: $subserie</p>";
                $idSerie = $this->getIdDirectory($subFondo.".".$seccion.".".$serie.".".$subserie, $fondo.".".$subFondo."/".$seccion."/$serie/", $fondo.".".$subFondo."/".$seccion."/$serie.$subserie/", $idSerie, "serie", "/$idFondo/$idSubFondo/$idSection/$idSerie/", $conocerData[$cont]);
                echo "<p>idSubserie: $idSubserie</p>";
                $keyPath.="$idSubserie/";
            }
            echo "<p>path: $keyPath</p>";
            $expediente = $conocerData[$cont]["$prefix"."19"];
            $idExpedient = $this->getIdDirectory(null, $expediente, $fondo.".".$subFondo."/".$seccion."/$serie.$subserie/",  $idSerie, "0", $keyPath, $conocerData[$cont], 1, 0);
            echo "<p>idExpediente: $idExpedient</p>";
            $legajo = $conocerData[$cont]["$prefix"."8"];
            echo "<p>legajo: $legajo</p>";
            $idLegajo = $this->getIdDirectory(null, $legajo, $expediente,  $idExpedient, "0", $keyPath."$idExpedient/", $conocerData[$cont], 0, 1);
            echo "</p>idLegajo: $idLegajo</p>";
            $frontPage = $this->buildFrontPage($conocerData);
//            var_dump($frontPage);
            echo "---------------------------------------------<br><br>";
        }
    }
    
    private function getIdDirectory($catalogKey, $catalogKeyPath,$parentCatalogKeyPath, $idParent, $catalogType, $path,$conocerData, $isFrontPage = 0, $isLegajo = 0){
        $select = "SELECT *FROM dir_Repositorio WHERE title = '$catalogKeyPath'";
        
        if((int)$isLegajo > 0)
            $select.=" AND parent_id = $idParent";
        
        $result = $this->db->ConsultaSelect("CONOCER", $select);
        
        if($result['Estado'] != 1)
            return $result['Estado'];
        if(count($result['ArrayDatos']) > 0)
            return $result['ArrayDatos'][0]['IdDirectory'];
        else
            return $this->addDirectory ($catalogKey, $catalogKeyPath, $parentCatalogKeyPath, $idParent, $catalogType, $path, $conocerData, $isFrontPage, $isLegajo);
    }
    
    private function addDirectory($catalogKey, $catalogKeyPath, $parentCatalogKeyPath, $idParent, $catalogType, $path, $conocerData, $isFrontPage, $isLegajo){
        $prefix = $this->prefix;
        $routFile = dirname(getcwd());
        $docDisposition = array();
        $idDocDisposition = 0;
        $autoincrement = $conocerData["$prefix"."7"];
        
        if($catalogKey != null)
            $docDisposition = $this->getIdDisposition($catalogKey);
        
        if(isset($docDisposition['idDocumentaryDisposition']))
            $idDocDisposition = $docDisposition['idDocumentaryDisposition'];
        
        echo "<p>idDocDisposition $catalogKey: $idDocDisposition</p>";
        
        $fields = "parent_id, title, path, idDocDisposition, catalogKey, 
                parentCatalogKey, catalogType, isFrontPage, isLegajo";
        $values = "$idParent, '$catalogKeyPath', '$path', $idDocDisposition, 
                '$catalogKeyPath', '$parentCatalogKeyPath', '$catalogType',
                $isFrontPage, $isLegajo";
        
        if((int)$isFrontPage > 0){
            $fields.=",templateName";
            $values.=", 'Template'";
            if((int)$autoincrement > 0){
                $fields.= ", autoincrement";
                $values.= ",$autoincrement";
            }
        }
        
        $insert = "INSERT INTO dir_Repositorio ($fields) VALUES ($values)";        
        $res = $this->db->ConsultaInsertReturnId("CONOCER", $insert);
        if(!(int)$res > 0)
            return $res;
        
        $folderPath = "$routFile/Estructuras/CONOCER/Repositorio"."$path".$res;
        if(($mkdir = mkdir($folderPath, 0777, true)))
            echo "<p>se ha creado el path $folderPath</p>";
        else
            echo "<p>Error al crear el path $folderPath. $mkdir</p>";
        
        return $res;
    }
    
    private function getIdDisposition($catalog){
        $select = "SELECT *FROM CSDocs_DocumentaryDisposition WHERE NameKey = '$catalog'";
        $result = $this->db->ConsultaSelect("CONOCER", $select);
        if($result['Estado'] != 1)
            return $result['Estado'];
        if(count($result['ArrayDatos'] > 0))
            return $result['ArrayDatos'][0];
        return 0;
    }
    
    private function buildFrontPage($conocerData){
        $prefix = $this->prefix;
        $routFile = dirname(getcwd());

        <?xml version="1.0"?>
            <template version="1.0" encoding="UTF-8" templateName="Template" enterpriseKey="CONOCER" repositoryName="Repositorio"><field><fieldValue>Secretaria de educaci&#xF3;n p&#xFA;blica</fieldValue>
                            <columnName>fondo</columnName>
                            <fieldName> Fondo</fieldName>
                            <tableName> repository</tableName>
                            <fieldType>TEXT</fieldType>
                            <fieldLength/>
                            <isCatalog>false</isCatalog>
                            <catalogOption>0</catalogOption></field><field><fieldValue>Promoci&#xF3;n y desarrollo</fieldValue>
                            <columnName>seccion</columnName>
                            <fieldName> Seccion</fieldName>
                            <tableName> repository</tableName>
                            <fieldType>TEXT</fieldType>
                            <fieldLength/>
                            <isCatalog>false</isCatalog>
                            <catalogOption>0</catalogOption></field><field><fieldValue>Comit&#xE9;s t&#xE9;cnicos en materia de est&#xE1;ndares de competencia</fieldValue>
                            <columnName>serie</columnName>
                            <fieldName> Serie</fieldName>
                            <tableName> repository</tableName>
                            <fieldType>TEXT</fieldType>
                            <fieldLength/>
                            <isCatalog>false</isCatalog>
                            <catalogOption>0</catalogOption></field><field><fieldValue/>
                            <columnName>subserie</columnName>
                            <fieldName> Subserie</fieldName>
                            <tableName> repository</tableName>
                            <fieldType>TEXT</fieldType>
                            <fieldLength/>
                            <isCatalog>false</isCatalog>
                            <catalogOption>0</catalogOption></field><field><fieldValue>2016-06-08</fieldValue>
                            <columnName>Fecha_Apertura</columnName>
                            <fieldName> Fecha_Apertura</fieldName>
                            <tableName> repository</tableName>
                            <fieldType>DATE</fieldType>
                            <fieldLength/>
                            <isCatalog>false</isCatalog>
                            <catalogOption>0</catalogOption></field><field><fieldValue/>
                            <columnName>Fecha_Cierre</columnName>
                            <fieldName> Fecha_Cierre</fieldName>
                            <tableName> repository</tableName>
                            <fieldType>DATE</fieldType>
                            <fieldLength/>
                            <isCatalog>false</isCatalog>
                            <catalogOption>0</catalogOption></field><field><fieldValue/>
                            <columnName>Fecha_Reserva</columnName>
                            <fieldName> Fecha_Reserva</fieldName>
                            <tableName> repository</tableName>
                            <fieldType>DATE</fieldType>
                            <fieldLength/>
                            <isCatalog>false</isCatalog>
                            <catalogOption>0</catalogOption></field><field><fieldValue/>
                            <columnName>Anos_Reserva</columnName>
                            <fieldName> Anos_Reserva</fieldName>
                            <tableName> repository</tableName>
                            <fieldType>INT</fieldType>
                            <fieldLength/>
                            <isCatalog>false</isCatalog>
                            <catalogOption>0</catalogOption></field><field><fieldValue/>
                            <columnName>Funcionario_Reserva</columnName>
                            <fieldName> Funcionario_Reserva</fieldName>
                            <tableName> repository</tableName>
                            <fieldType>TEXT</fieldType>
                            <fieldLength/>
                            <isCatalog>false</isCatalog>
                            <catalogOption>0</catalogOption></field><field><fieldValue/>
                            <columnName>Asunto</columnName>
                            <fieldName> Asunto</fieldName>
                            <tableName> repository</tableName>
                            <fieldType>TEXT</fieldType>
                            <fieldLength/>
                            <isCatalog>false</isCatalog>
                            <catalogOption>0</catalogOption></field><field><fieldValue>SEP.L9T/6NF/5/2016/3</fieldValue>
                            <columnName>Numero_Expediente</columnName>
                            <fieldName> Numero_Expediente</fieldName>
                            <tableName> repository</tableName>
                            <fieldType>TEXT</fieldType>
                            <fieldLength/>
                            <isCatalog>false</isCatalog>
                            <catalogOption>0</catalogOption></field><field><fieldValue>1</fieldValue>
                            <columnName>ArchivoTramite</columnName>
                            <fieldName> ArchivoTramite</fieldName>
                            <tableName> DocumentValidity</tableName>
                            <fieldType>INT</fieldType>
                            <fieldLength/>
                            <isCatalog>false</isCatalog>
                            <catalogOption>0</catalogOption></field><field><fieldValue>0</fieldValue>
                            <columnName>ArchivoConcentracion</columnName>
                            <fieldName> ArchivoConcentracion</fieldName>
                            <tableName> DocumentValidity</tableName>
                            <fieldType>INT</fieldType>
                            <fieldLength/>
                            <isCatalog>false</isCatalog>
                            <catalogOption>0</catalogOption></field><field><fieldValue>0</fieldValue>
                            <columnName>Confidencial</columnName>
                            <fieldName> Confidencial</fieldName>
                            <tableName> DocumentValidity</tableName>
                            <fieldType>INT</fieldType>
                            <fieldLength/>
                            <isCatalog>false</isCatalog>
                            <catalogOption>0</catalogOption></field><field><fieldValue>Art. 6, En la interpretaci&#xF3;n de esta Ley y de su Reglamento, as&#xED; como de las normas de car&#xE1;cter general a las que se refiere el art. 61, se deber&#xE1; favorecer el principio de m&#xE1;xima publicidad y disponibilidad de la informaci&#xF3;n en posesi&#xF3;n de los sujetos obligados.</fieldValue>
                            <columnName>Fundamento_Legal</columnName>
                            <fieldName> Fundamento_Legal</fieldName>
                            <tableName> undefined</tableName>
                            <fieldType>TEXT</fieldType>
                            <fieldLength/>
                            <isCatalog>true</isCatalog>
                            <catalogOption>6</catalogOption></field></template>

    }
    
    private function GetStructure(){
        $designer = new DesignerForms();
        $TypeStructure = "Repositorio";
        $DataBaseName = "CONOCER";
        $fields = array();
        $fullStructure = $designer->getArrayStructureFile($DataBaseName);
   
        if(!is_array($fullStructure))
            return "Error  $fullStructure";

        if(array_key_exists($TypeStructure,$fullStructure)){
            $Estructura = $fullStructure["$TypeStructure"];
            $ArrayEstructura = $designer->getPropertiesFromStructure($TypeStructure,$Estructura);
            if(is_array($ArrayEstructura)){
                for($cont = 0; $cont < count($ArrayEstructura['structure']); $cont++){
                    $fields[$ArrayEstructura['structure'][$cont]['name']] = $ArrayEstructura['structure'][$cont]['name'];
                } 
                return $fields;
            }
            else
                return $ArrayEstructura;
        }
        else
            return "<p>No existe el registro de estructura para <b>$TypeStructure</b>, o puede que no se haya creado correctamente</p>";
    }
}

$carga = new Carga();
$carga->start();
