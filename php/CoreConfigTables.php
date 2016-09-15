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
 * Clase que permite comprobar si esxisten recursos o tablas del sistema
 * 
 * Description of CoreConfig
 *
 * @author daniel
 */
include_once 'DataBase.php';
class CoreConfigTables {
    private $db;
    
    public function __construct() {
        $this->db = new DataBase();
    }
    
    public function checkResource($resouceName){
        $status = 0;
        $serverRoute = dirname(dirname(getcwd()));
        $coreFilePath = $serverRoute . "/Configuracion/coreResource/core.ini";

        if (!file_exists(dirname($coreFilePath)))
            if (!mkdir(dirname($coreFilePath)))
                return "No fue posible crear el directorio coreResource";
            
        if(!file_exists($coreFilePath))
            if (!($touch = touch($coreFilePath)))
                return "No fue posible crear el archivo CoreConfig::core. $touch";
        
        $iniFile = parse_ini_file($coreFilePath);
        
        if(!is_array($iniFile))
            return "No fue posible obtener la informacion del control core CoreConfigTables:: $iniFile";

        if(isset($iniFile[$resouceName]))
            $status = 1;

        return $status;
    }
    
    private function writeResource($tableName){
        $status = 0;
        $serverRoute = dirname(dirname(getcwd()));
        $coreFilePath = $serverRoute . "/Configuracion/coreResource/core.ini";
        $iniFile = parse_ini_file($coreFilePath);

        if (!($fopen = fopen($coreFilePath, "a+")))
            return "No fue posible abrir el archivo CoreConfig::core";
        
        if (!is_array($iniFile)) {
            fclose($fopen);
            return "No fue posible obtener el array de core CoreConfig:: $iniFile";
        }

        if(isset($iniFile[$tableName]))
            $status = "Ya existe el recurso $tableName";
        else{
            fwrite ($fopen, "$tableName=1");
            $status = 1;
        }
        
        return $status;
    }
    
    public function createTable($instanceName, $tableName, $query){
        $checkResource = $this->checkResource($tableName);
        
        if(strcspn($checkResource, 1) == 0)
            return 1;
        if(strcspn($checkResource, 0) != 0)
            return $checkResource;  /* Devuelve el error */
        
        if(($result = $this->db->ConsultaQuery($instanceName, $query)) != 1 )
            return $result;     /* Devuelve el error de consulta  */
        
        return $this->writeResource($tableName);
    }

}
