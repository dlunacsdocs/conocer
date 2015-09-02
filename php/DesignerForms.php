<?php
require_once 'DataBase.php';
require_once 'XML.php';
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of DesignerForms
 *
 * @author daniel
 */
if(!isset($_SESSION))
    session_start();

class DesignerForms {
    public function __construct() {
        $this->ajax();
    }
    
    private function ajax()
    {
        switch (filter_input(INPUT_POST, "opcion"))
        {
            case 'GetStructure': $this->GetStructure(); break; 
            case 'GetAllStructure': $this->GetAllStructure(); break;
        }
    }   
    /*************************************************************************
     * Se obtiene la estructura de la Tabla diseñada por el usuario, tomandola
     * del archivo de configuración generado al Construir una instancia
     */
    private function GetStructure()
    {
        $TypeStructure=filter_input(INPUT_POST, "TypeStructure");
        $DataBaseName=filter_input(INPUT_POST, "DataBaseName");
        
        if(!file_exists("../Configuracion/$DataBaseName.ini"))
            return XML::XMLReponse("Error", 0,"<p>No existe el archivo de configuración estructural.</p>");
        
        if(($Estructura = parse_ini_file ("../Configuracion/$DataBaseName.ini",true))===FALSE)
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al abrir el registro de estructura de la instancia $DataBaseName</p><br>Detalles:<br><br>$Estructura");
        
        if(array_key_exists($TypeStructure,$Estructura))
        {
            $Estructura=$Estructura["$TypeStructure"];
            $this->ReturnXMLStructure($TypeStructure,$Estructura);
        }
        else
            return XML::XMLReponse("Error", 0,"<p>No existe el registro de estructura para $TypeStructure, o puede que no se haya creado correctamente</p>");
    }
    /* Devuelve la estrucutura por default y la definida por el usuario */
    private function GetAllStructure()
    {
        $XML=new XML();
        $TypeStructure=filter_input(INPUT_POST, "TypeStructure");
        $DataBaseName=filter_input(INPUT_POST, "DataBaseName");
        $catalogo=0;
        if(!file_exists("../Configuracion/$DataBaseName.ini")){$XML->ResponseXML("Error", 0,"<p>No existe el archivo de configuración estructural.</p>");return;}
        $Estructura_=parse_ini_file ("../Configuracion/$DataBaseName.ini",true); 
        if(!array_key_exists($TypeStructure,$Estructura_))
        {
            $XML->ResponseXML("Error", 0,"<p>No existe el registro de estructura para $TypeStructure, o puede que no se haya creado correctamente</p>");
            return 0;
        }       
        
        $Estructura=$Estructura_["$TypeStructure"];
        $ArrayEstructura=array();
        for($cont=0;$cont<count($Estructura);$cont++)
        {
            $cadena=explode('###', $Estructura[$cont]);
            $ArrayIteracion=array();

            if($cadena[0]=='Properties')/* Definición dada por el usuario */
            {
                for($a=1;$a<count($cadena);$a++)/* En 1 se ignora el primer elemento que es Properties */
                {
                    $CadenaCampo=  explode(" ", $cadena[$a]); /* Dívide en dos cada bloque type###valor  del  archivo de configuración*/
                    if(!array_filter($CadenaCampo))continue;
                    $type=$CadenaCampo[0];$type_valor=$CadenaCampo[1];
                    $ArrayIteracion[$type]=$type_valor;
                }
                $ArrayEstructura[]=$ArrayIteracion;
            }
            else
            {
                if($cadena[0]=='Tipo')/* Cuando es un catálogo */
                {
                    $ArrayIteracion['Tipo']=$cadena[1];
                    $ArrayEstructura[]=$ArrayIteracion;
                    $catalogo=1;       /* Bandera que detecta cuando es de tipo catálogo */
                }
                $ArrayIteracion['Campo']='P';
                $ArrayIteracion['name']=$cadena[0];
                for($a=1;$a<count($cadena);$a++)/* En 1 se ignora el primer elemento que es Properties */
                {
                    $CadenaCampo=  explode(" ", $cadena[$a]);
                    if(!array_filter($CadenaCampo))continue;
                    $type=$CadenaCampo[0];$type_valor=$CadenaCampo[1];
                    $ArrayIteracion[$type]=$type_valor;
                }     
                $ArrayEstructura[]=$ArrayIteracion;
            }              
        }
               
        if(!(count($ArrayEstructura)>0)){$XML->ResponseXML("Error", 0,"<p>No existe el registro de estructura para uuarios, o puede que no se haya creado correctamente</p>");}        
        $this->CreateXMLStruct($ArrayEstructura,$catalogo); 
    }
    
    /**************************************************************************
     *  Se devuelve un XML con la Estrcutra generada por el usuario.
     *      
     *      El parámetro estructura tiene la siguiente forma (Ejemplo)
     * 
     *      Estructura {
     *                  "Seccion"=>Array{
     *                      Empresa=Empresa
                            Empresa[]=NombreEmpresa###type###VARCHAR###long###100###required###true###
                            Empresa[]=Descripcion###type###TEXT###required###true###
                            Empresa[]=ClaveEmpresa###type###VARCHAR###long###50###required###true###
                            Empresa[]=Properties###name###Direccion###type###VARCHAR###long###200###required###false###
                            Empresa[]=Properties###name###Telefono###type###INT###long###15###required###false###
                            Empresa[]=Properties###name###FechaFundacion###type###DATE###required###false###
     *              }
     *          }
     *  Los valores vienen separados por ###, siempre se comienza por un valor de default en este caso es 
     * NombreEmpresa y Descripcion
     * Luego se siguen las propiedades dadas por el usuario y empiezan con "Properties".
     * 
     */
    function ReturnXMLStructure($TypeStructure,$Estructura)
    {
        $catalogo=0;
        $XML=new XML();
        $ArrayEstructura=array();
        for($cont=0;$cont<count($Estructura);$cont++)
        {
            $cadena=explode('###', $Estructura[$cont]);
            $ArrayIteracion=array();

            if($cadena[0]=='Properties')/* Definición dada por el usuario */
            {
                for($a=1;$a<count($cadena);$a++)/* En 1 se ignora el primer elemento que es Properties */
                {
                    $CadenaCampo=  explode(" ", $cadena[$a]); /* Dívide en dos cada bloque type###valor  del  archivo de configuración*/
                    if(!array_filter($CadenaCampo))continue;
                    $type=$CadenaCampo[0];$type_valor=$CadenaCampo[1];
                    $ArrayIteracion[$type]=$type_valor;
                }
                $ArrayEstructura[]=$ArrayIteracion;
            }
            else
            {
                if($cadena[0]=='Tipo')/* Cuando es un catálogo */
                {
                    $ArrayIteracion['Tipo']=$cadena[1];
                    $ArrayEstructura[]=$ArrayIteracion;
                    $catalogo=1;       /* Bandera que detecta cuando es de tipo catálogo */
                }
//                $ArrayIteracion['Campo']='P';
//                $ArrayIteracion['name']=$cadena[0];
//                for($a=1;$a<count($cadena);$a++)/* En 1 se ignora el primer elemento que es Properties */
//                {
//                    $CadenaCampo=  explode(" ", $cadena[$a]);
//                    if(!array_filter($CadenaCampo))continue;
//                    $type=$CadenaCampo[0];$type_valor=$CadenaCampo[1];
//                    $ArrayIteracion[$type]=$type_valor;
//                }     
//                $ArrayEstructura[]=$ArrayIteracion;
            }                        
        }
        if(!(count($ArrayEstructura)>0)){$XML->ResponseXML("Error", 0,"<p>No existe el registro de estructura para uuarios, o puede que no se haya creado correctamente</p>");}        
        $this->CreateXMLStruct($ArrayEstructura,$catalogo);    
    }
    
    /***************************************************************************
     * Devuelve los campos por default
     */
    function ReturnStructureDefault($TypeStructure,$Estructura)
    {
        $ArrayEstructura=array();
        for($cont=0;$cont<count($Estructura);$cont++)
        {
            $cadena=explode('###', $Estructura[$cont]);
            $ArrayIteracion=array();

            if($cadena[0]!='Properties')/* Definición dada por el usuario */
            {
                if($cadena[0]=='Tipo')/* Cuando es un catálogo */
                {
                    $ArrayIteracion['Tipo']=$cadena[1];
                    $ArrayEstructura[]=$ArrayIteracion;
                }
                $ArrayIteracion['Campo']='Default';
                $ArrayIteracion['name']=$cadena[0];
                for($a=1;$a<count($cadena);$a++)/* En 1 se ignora el primer elemento que es Properties */
                {
                    $CadenaCampo=  explode(" ", $cadena[$a]);
                    if(!array_filter($CadenaCampo)){continue;}
                    $type=$CadenaCampo[0];$type_valor=$CadenaCampo[1];
                    $ArrayIteracion[$type]=$type_valor;
                }     
                $ArrayEstructura[]=$ArrayIteracion;
            }                        
        }
        
        return $ArrayEstructura;
    }
    
    function ReturnStructure($TypeStructure,$Estructura)
    {
        $catalogo=0;
        $ArrayEstructura=array();
        
        for($cont=0;$cont<count($Estructura);$cont++)
        {
            $cadena=explode('###', $Estructura[$cont]);
            $ArrayIteracion=array();

            if($cadena[0]=='Properties')/* Definición dada por el usuario */
            {
                for($a=1;$a<count($cadena);$a++)/* En 1 se ignora el primer elemento que es Properties */
                {
                    $CadenaCampo=  explode(" ", $cadena[$a]); /* Dívide en dos cada bloque type###valor  del  archivo de configuración*/
                    if(!array_filter($CadenaCampo))continue;
                    $type=$CadenaCampo[0];$type_valor=$CadenaCampo[1];
                    $ArrayIteracion[$type]=$type_valor;
                }
                $ArrayEstructura[]=$ArrayIteracion;
            }
            else
            {
                if($cadena[0]=='Tipo')/* Cuando es un catálogo */
                {
                    $ArrayIteracion['Tipo']=$cadena[1];
                    $ArrayEstructura[]=$ArrayIteracion;
                    $catalogo=1;       /* Bandera que detecta cuando es de tipo catálogo */
                }
//                $ArrayIteracion['Campo']='P';
//                $ArrayIteracion['name']=$cadena[0];
//                for($a=1;$a<count($cadena);$a++)/* En 1 se ignora el primer elemento que es Properties */
//                {
//                    $CadenaCampo=  explode(" ", $cadena[$a]);
//                    if(!array_filter($CadenaCampo))continue;
//                    $type=$CadenaCampo[0];$type_valor=$CadenaCampo[1];
//                    $ArrayIteracion[$type]=$type_valor;
//                }     
//                $ArrayEstructura[]=$ArrayIteracion;
            }                        
        }
        
        return $ArrayEstructura;
    }
    
    private function CreateXMLStruct($ArrayStruct,$catalogo)
    {
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("Estructura");
        $doc->appendChild($root);       
        for($cont=0;$cont<count($ArrayStruct);$cont++)
        {
            $Campo=$doc->createElement("Campo");
            if($catalogo==1){$Campo=$doc->createElement("Campo");$tipo=$doc->createElement("tipo",$ArrayStruct[$cont]['Tipo']);$Campo->appendChild($tipo); $root->appendChild($Campo); $catalogo=0; continue;}
                        
            $name=$doc->createElement("name",$ArrayStruct[$cont]['name']);
            $Campo->appendChild($name);
            $type=$doc->createElement("type",$ArrayStruct[$cont]['type']);            
            $Campo->appendChild($type);
            if(isset($ArrayStruct[$cont]['long']))
            {
                $long=$doc->createElement("long",$ArrayStruct[$cont]['long']);
                $Campo->appendChild($long);
            }
            if(isset($ArrayStruct[$cont]['required']))
            {
                $required=$doc->createElement("required",$ArrayStruct[$cont]['required']);
                 $Campo->appendChild($required);
            }
            
            $root->appendChild($Campo);
        }       
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
    }
    
    public static function CreateProperty($FieldName, $FieldType, $FieldLength, $RequiredField)
    {
        $FieldTypeMysql = '';
        
        if((int)($FieldLength)>0)
        {
//            $FieldType.="($FieldLength)";
            $FieldTypeMysql = "$FieldType($FieldLength)";
            $FieldLength = "long ".$FieldLength."###";         
        }    
        else
            $FieldTypeMysql = $FieldType;
        
        if(strcasecmp($RequiredField, "true")==0)
                $FieldTypeMysql.= " NOT NULL";
        
        if(strcasecmp($RequiredField, "true")!=0 and strcasecmp($RequiredField, "false")!=0)
                $RequiredField = '';
        else
            $RequiredField = "required $RequiredField###";
        
        $NewProperty = "Properties###name $FieldName###type $FieldType###$FieldLength$RequiredField";
    
        $FieldDetail = array("FieldDetail"=>$NewProperty, "FieldMySql"=>$FieldTypeMysql);
        
        return $FieldDetail;
    }
    
    /* Función que elimina del archivo de configuración un campo de  */
    public static function DeleteField($DataBaseName, $StructureName,  $FieldName)
    {
        $RoutFile = dirname(getcwd());        
        
        if(!file_exists("$RoutFile/Configuracion/$DataBaseName.ini"))
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> no existe el registro de estructura de la intsnaica <b>$DataBaseName</b></p>");
        
        if(!($Structure = parse_ini_file("$RoutFile/Configuracion/$DataBaseName.ini")))
                return XML::XmlArrayResponse ("Error", 0, "<p><b>Error</b> al intentar abrir el registro de estructura de la instancia <b>$DataBaseName</b></p>");
        
        if(!($gestor = fopen("$RoutFile/Configuracion/$DataBaseName.ini", "w")))
                return XML::XMLReponse("Error", 0, "<p><b>Error</b> al intentar abrir el registro de estructura de la instancia <b>$DataBaseName</b><br>Detalles:<br><br>$gestor");
        
        foreach ($Structure as $key =>$Section)
        {
            fwrite($gestor,";#############################################################################".PHP_EOL);
            fwrite($gestor, ";--------  $key --------".PHP_EOL);
            fwrite($gestor,";#############################################################################".PHP_EOL);
            fwrite($gestor, "$key=$key".PHP_EOL);
            for($cont = 0; $cont < count($Section); $cont++)
            {
                $property = explode("###", $Section[$cont]);
                if(strcasecmp($StructureName, $key)==0)
                    if(strcasecmp($property[0], "Properties")==0)
                    {
                        $Field = explode(" ", $property[1]);
                        if(strcasecmp($FieldName, $Field[1])==0)
                            continue;
                    }
                fwrite($gestor, $key."[]=".$Section[$cont].PHP_EOL);
            }
        }
        
        fclose($gestor);
        
        return 1;
    }
    
    public static function AddPropertyIntoStructureConfig($DataBaseName,$StructureName, $NewProperty)
    {

        if(!file_exists("../Configuracion/$DataBaseName.ini"))
            return "No existe la estructura de configuración de $DataBaseName";
        
        if(!$Structure = parse_ini_file("../Configuracion/$DataBaseName.ini", true))
                return "La estructura del archivo de configuración de $DataBaseName es incorrecta";
        
        $Structure[$StructureName][] = $NewProperty;
        
        if(!($gestor = fopen("../Configuracion/$DataBaseName.ini", "w")))
                return $gestor;
        
        foreach ($Structure as $key =>$Section)
        {
            fwrite($gestor,";#############################################################################".PHP_EOL);
            fwrite($gestor, ";--------  $key --------".PHP_EOL);
            fwrite($gestor,";#############################################################################".PHP_EOL);
            fwrite($gestor, "$key=$key".PHP_EOL);
            for($cont = 0; $cont < count($Section); $cont++)
            {
                fwrite($gestor, $key."[]=".$Section[$cont].PHP_EOL);
            }
        }
        
        fclose($gestor);
        
        return 1;
    }
    
    /* Elimina una estructura completa p.e. un repositorio */
    public static function DeleteStructure($DataBaseName, $StructureName)
    {
        $RoutFile = dirname(getcwd());        
        
        if(!file_exists("$RoutFile/Configuracion/$DataBaseName.ini"))
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> no existe el registro de estructura de la intsnaica <b>$DataBaseName</b></p>");
        
        if(!($Structure = parse_ini_file("$RoutFile/Configuracion/$DataBaseName.ini")))
                return XML::XmlArrayResponse ("Error", 0, "<p><b>Error</b> al intentar abrir el registro de estructura de la instancia <b>$DataBaseName</b></p>");
        
        if(!($gestor = fopen("$RoutFile/Configuracion/$DataBaseName.ini", "w")))
                return XML::XMLReponse("Error", 0, "<p><b>Error</b> al intentar abrir el registro de estructura de la instancia <b>$DataBaseName</b><br>Detalles:<br><br>$gestor");
        
            foreach ($Structure as $key =>$Section)
            {
                    if(strcasecmp($StructureName, $key)!=0)
                    {
                        fwrite($gestor,";#############################################################################".PHP_EOL);
                        fwrite($gestor, ";--------  $key --------".PHP_EOL);
                        fwrite($gestor,";#############################################################################".PHP_EOL);
                        fwrite($gestor, "$key=$key".PHP_EOL);
                        for($cont = 0; $cont < count($Section); $cont++)
                        {
                            fwrite($gestor, $key."[]=".$Section[$cont].PHP_EOL);
                        }
                    }           
        }
        
        fclose($gestor);
        
        return 1;
    }
      
//    function write_ini_file($assoc_arr, $path, $has_sections=FALSE)
//    { 
//        $content = ""; 
//        if ($has_sections) { 
//            foreach ($assoc_arr as $key=>$elem) { 
//                $content .= "[".$key."]\n"; 
//                foreach ($elem as $key2=>$elem2) { 
//                    if(is_array($elem2)) 
//                    { 
//                        for($i=0;$i<count($elem2);$i++) 
//                        { 
//                            $content .= $key2."[] = \"".$elem2[$i]."\"\n"; 
//                        } 
//                    } 
//                    else if($elem2=="") $content .= $key2." = \n"; 
//                    else $content .= $key2." = \"".$elem2."\"\n"; 
//                } 
//            } 
//        } 
//        else { 
//            foreach ($assoc_arr as $key=>$elem) { 
//                if(is_array($elem)) 
//                { 
//                    for($i=0;$i<count($elem);$i++) 
//                    { 
//                        $content .= $key."[] = \"".$elem[$i]."\"\n"; 
//                    } 
//                } 
//                else if($elem=="") $content .= $key." = \n"; 
//                else $content .= $key." = \"".$elem."\"\n"; 
//            } 
//        } 
//
//        if (!$handle = fopen($path, 'w')) { 
//            return false; 
//        }
//    }
    
}

$designer=new DesignerForms();
