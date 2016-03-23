<?php
/**
 * Description of MassiveUploadSources
 *      Clase que lee xml de diferentes fuentes (Capture, Alfresco, Documentum, etc)
 *
 * @author Daniel
 */
$RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */
class UploadSources
{
    private $Source;
    public function __construct($Source) {
        $this->Source = $Source;
    }
    
    function GetArrayCaptureXml(SimpleXMLElement $xml)
    {
        $node = array();
        if(count($xml->children())>0)
            $node = $this->GetArrayCaptureXml($xml->children());

        foreach ($xml->children() as $tag => $value)
        {
            $node[] = $value->attributes();           
        }

        return $node;
    }
    
    
    
    function ReadCSDocsXml($DefaultStructure,$EstructuraProperties, $repositoryName ,$Catalogs,$FileNameXml, $MassiveUploadSettings)
    {        
        $RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT");
        $DataBaseName = $MassiveUploadSettings['DataBaseName'];
        $UserName = $MassiveUploadSettings['UserName'];
        $estado = 1;
        $NoExisteCampo = 0;    
        
        $Fields = '';
        $Values = '';
        $Full = '';
        if(!file_exists($FileNameXml))
        {
            echo "<p>No se encontró el archivo ".basename($FileNameXml)." </p>";
            MassiveUpload::LogLoadMassive($UserName, "No se encontró el archivo ".  basename($FileNameXml));  
            return 0;
        }
        
        $xml= simplexml_load_file($FileNameXml);
        $CamposUsuarioXML=$xml->Field;           
        
        $ArrayCamposDefaultXml=array();
        for($cont=0; $cont < count($CamposUsuarioXML); $cont++)
        {
            $campoXml=trim($CamposUsuarioXML[$cont]," ");
            $Value=trim($CamposUsuarioXML[$cont]['Value']," ");
            $ArrayCamposDefaultXml[$campoXml]=$Value;
        }     
        
        /* Sí existen catálogos en el XML se buscan y se guarda su Nombre y Id */        
        $CatalogFields = array();
        foreach ($xml->List as $campo)
        {
            $CatalogName=$campo['name'];
            $IdList=$campo['IdList'];
            $CatalogFields["$CatalogName"]=array("CatalogName"=>$CatalogName,"IdCatalog"=>$IdList);                        
        }
      
        /***********************************************************************
         *                       Campos Definidos por el Usuario               *
         ***********************************************************************/

        for($cont=0; $cont<count($EstructuraProperties); $cont++)
        {                
            $Field=preg_replace('/\s+/', ' ',$EstructuraProperties[$cont]['name']);
            $type=$EstructuraProperties[$cont]['type'];   

            if(isset($ArrayCamposDefaultXml[$Field]))
            {
                $valor=$ArrayCamposDefaultXml[$Field];
       
                if(strcasecmp($type, "INT")==0 or strcasecmp($type, "FLOAT")==0 or strcasecmp($type, "INTEGER")==0 or strcasecmp($type, "DOUBLE")==0) /* Si detecta un tipo numerico */
                {   
                    if(intval($valor)!=0)
                        $Values.=$valor.",";
                    else
                        $Values.=" 0,";   
                }
                else    /* Demás tipos de datos llevan ' ' */
                    $Values.="'".$valor."'".",";
                
                $Full.=$valor." , ";
                $Fields.=$Field.",";
            }
            else
            {
                MassiveUpload::LogLoadMassive($UserName, "No existe el Campo $Field en  ".  basename($FileNameXml));
                echo "<p>No existe el Campo $Field en ".  basename($FileNameXml)."</p>";
                $NoExisteCampo=1;
            }
        }/* Fin For */
        
        
        /***********************************************************************
         *          Se hace Match Con los catálogos existentes en el Sistema   *                     
         ***********************************************************************/
        for($cont=0; $cont<count($Catalogs); $cont++)
        {            
            if(!(strlen($Catalogs[$cont]['NombreCatalogo'])>0)){continue;}
                $NombreCatalogo=$Catalogs[$cont]['NombreCatalogo'];
                
            if(!isset($CatalogFields["$NombreCatalogo"]))
            {
                MassiveUpload::LogLoadMassive($UserName, "No existe el Catálogo $NombreCatalogo en  ".  basename($FileNameXml));
                echo "<p>No existe el List <b>$NombreCatalogo</b> en ".  basename($FileNameXml)."</p>";
                $NoExisteCampo=1;
                continue;
            }

           $IdList = $CatalogFields[$NombreCatalogo]['IdCatalog'];

           /* Se obtiene los registros de cada catálogo a través de sus archivo de registros  */
           $RutaRegistroCatalogo = "$RoutFile/Configuracion/Catalogs/$DataBaseName/$UserName/$repositoryName"."_"."$NombreCatalogo.ini";
           if(!file_exists($RutaRegistroCatalogo))
           {
               echo "<p>No existe el archivo de registro del Catálogo <b>$NombreCatalogo</b>.</p>"; 
               return 0;               
           }
           
           $RegistrosCatalogo = parse_ini_file ($RutaRegistroCatalogo,true);
           
           if($RegistrosCatalogo == false)
           {
               echo "<b>Error.</b> No pudo abrirse el documento de almacenamiento del catálogo <b>$NombreCatalogo</b>";
               return 0;
           }

           /* Sí existe el registro con el Id se toman sus campos para añadirlos a FullText */
           if(isset($RegistrosCatalogo["$NombreCatalogo"]["$IdList"]))
           {
               $Full.=$RegistrosCatalogo["$NombreCatalogo"]["$IdList"]." , ";
               $Values.=$CatalogFields[$NombreCatalogo]['IdCatalog'].",";            
               $Fields.=$NombreCatalogo.",";                         
           }
           else
           {
               MassiveUpload::LogLoadMassive($UserName, "No existe el campo con el Id = $IdList del catálogo $NombreCatalogo en  ".  basename($FileNameXml));
               echo "<p>No existe el campo con el Id = $IdList en el catálogo <b>$NombreCatalogo</b> dentro de ".  basename($FileNameXml)."</p>";
               $NoExisteCampo=1;
           }                                                                                                                                 
        }
        
        if($NoExisteCampo==1)
               $estado = 0;
        
                        
        return array("Estado"=>$estado, "Fields"=>$Fields, "Values"=>$Values, "Full"=>$Full);
    }
    
    private function ReadCaptureXml($DefaultStructure, $EstructuraProperties, $repositoryName,  $Catalogs, $FileNameXml, $MassiveUploadSettings)
    {                               
        $RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT");
        $DataBaseName = $MassiveUploadSettings['DataBaseName'];
        $UserName = $MassiveUploadSettings['UserName'];
        $estado = 1;
        $NoExisteCampo = 0;    
        
        if(!file_exists($FileNameXml))
        {
            echo "<p>No se encontró el archivo ".basename($FileNameXml)." </p>";
            MassiveUpload::LogLoadMassive($UserName, "No se encontró el archivo ".  basename($FileNameXml));  
            return 0;
        }
        
         $xml = simplexml_load_file($FileNameXml);
        $NodesArray = $this->GetArrayCaptureXml($xml);
//        var_dump($NodesArray);
        
        $Fields = '';
        $Values = '';
        $Full = '';
        
        /* Se hace match con los campos definidos por el usuario y los campos del xml */
        $ArrayCamposDefaultXml=array();
        for($cont=0; $cont < count($NodesArray); $cont++)
        {
            $campoXml=trim($NodesArray[$cont]['name']," ");
            $Value=trim($NodesArray[$cont]['value']," ");
            $ArrayCamposDefaultXml[$campoXml]=$Value;
        }         
        
        /***********************************************************************
         *                       Campos Definidos por el Usuario               *
         ***********************************************************************/

        for($cont=0; $cont<count($EstructuraProperties); $cont++)
        {                
            $Field=preg_replace('/\s+/', ' ',$EstructuraProperties[$cont]['name']);
            $type=$EstructuraProperties[$cont]['type'];   

            if(isset($ArrayCamposDefaultXml[$Field]))
            {
                $valor=$ArrayCamposDefaultXml[$Field];
       
                if(strcasecmp($type, "INT")==0 or strcasecmp($type, "FLOAT")==0 or strcasecmp($type, "INTEGER")==0 or strcasecmp($type, "DOUBLE")==0) /* Si detecta un tipo numerico */
                {   
                    if(intval($valor)!=0)
                        $Values.=$valor.",";
                    else
                        $Values.=" 0,";   
                }
                else    /* Demás tipos de datos llevan ' ' */
                    $Values.="'".$valor."'".",";
                
                $Full.=$valor." , ";
                $Fields.=$Field.",";
            }
            else
            {
                MassiveUpload::LogLoadMassive($UserName, "No existe el Campo $Field en  ".  basename($FileNameXml));
                echo "<p>No existe el Campo $Field en ".  basename($FileNameXml)."</p>";
                $NoExisteCampo=1;
            }
        }/* Fin For */
        
        /***********************************************************************
         *          Se hace Match Con los catálogos existentes en el Sistema   *                     
         ***********************************************************************/
        for($cont=0; $cont<count($Catalogs); $cont++)
        {            
            if(!(strlen($Catalogs[$cont]['NombreCatalogo'])>0)){continue;}
                $NombreCatalogo=$Catalogs[$cont]['NombreCatalogo'];
                
            if(!isset($ArrayCamposDefaultXml["$NombreCatalogo"]))
            {
                MassiveUpload::LogLoadMassive($UserName, "No existe el List $NombreCatalogo en  ".  basename($FileNameXml));
                echo "<p>No existe el List <b>$NombreCatalogo</b> en ".  basename($FileNameXml)."</p>";
                $NoExisteCampo=1;
                continue;
            }

           $IdList = $ArrayCamposDefaultXml[$NombreCatalogo];

           /* Se obtiene los registros de cada catálogo a través de sus archivo de registros  */
           $RutaRegistroCatalogo = "$RoutFile/Configuracion/Catalogs/$DataBaseName/$UserName/$repositoryName"."_"."$NombreCatalogo.ini";
           if(!file_exists($RutaRegistroCatalogo))
           {
               echo "<p>No existe el archivo de registro del Catálogo <b>$NombreCatalogo</b>.</p>"; 
               return 0;               
           }
                     
           if(filesize($RutaRegistroCatalogo)==0)
           {
               echo "<p>El catálogo <b>$NombreCatalogo</b> no contiene registros</p>";
               return 0;
           }
           
           $RegistrosCatalogo = parse_ini_file ($RutaRegistroCatalogo,true);
           
           if($RegistrosCatalogo == false)
           {
               echo "<b>Error.</b> No pudo abrirse el documento de almacenamiento del catálogo <b>$NombreCatalogo</b>";
               return 0;
           }

           /* Sí existe el registro con el Id se toman sus campos para añadirlos a FullText */
           if(isset($RegistrosCatalogo["$NombreCatalogo"]["$IdList"]))
           {
               $Full.=$RegistrosCatalogo["$NombreCatalogo"]["$IdList"]." , ";
               $Values.=$IdList.",";            
               $Fields.=$NombreCatalogo.",";                         
           }
           else
           {
               MassiveUpload::LogLoadMassive($UserName, "No existe el campo con el Id = $IdList del catálogo $NombreCatalogo en  ".  basename($FileNameXml));
               echo "<p>No existe el campo con el Id = $IdList en el List <b>$NombreCatalogo</b> en ".  basename($FileNameXml)."</p>";
               $NoExisteCampo=1;
           }                                                                                                                                 
        }
        
        if($NoExisteCampo==1)
               $estado = 0;
               
        return array("Estado"=>$estado, "Fields"=>$Fields, "Values"=>$Values, "Full"=>$Full);
    }
    
    public function ReadXml($DefaultStructure,$EstructuraProperties, $repositoryName ,$Catalogos,$FileNameXml, $MassiveUploadSettings)
    {
        switch($this->Source)
        {
            case "1":
            {
                $Result = $this->ReadCSDocsXml($DefaultStructure, $EstructuraProperties, $repositoryName, $Catalogos, $FileNameXml, $MassiveUploadSettings);
                return $Result;
            }
            case "2":
            {
                $Result = $this->ReadCaptureXml($DefaultStructure, $EstructuraProperties, $repositoryName, $Catalogos, $FileNameXml, $MassiveUploadSettings);
                return $Result;
            }                        
            default: return 0;
        }
    }
    
    public function GetPathXsd()
    {
        $RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */

        switch($this->Source)
        {
            case "1":
            {
                $CapturePath = "$RoutFile/Configuracion/UploadSources/CSDocs_1.0.xsd";
                if(file_exists($CapturePath))
                    return $CapturePath;
                else
                    return 0;
            }
            case "2":
            {
                $CapturePath = "$RoutFile/Configuracion/UploadSources/capture_5.0.4.xsd";
                if(file_exists($CapturePath))
                    return $CapturePath;
                else
                    return 0;
            }            
        }
    }
}
