<?php
/*------------------------------------------------------------------------------
 *  Description of Catalog
 * 
 *   Clase que administra los catálogos del sistema, responde a las peticiones del
 *   usuario tales como: 
 *      Mostrar el contenido de un catálogo
 *      Modificar
 *      Agregar
 *      Editar
 *      Agregar una nueva estructura de catálogo
 * 
 * @author Daniel
 *-----------------------------------------------------------------------------*/
$RoutFile = dirname(getcwd());        

require_once './DataBase.php';
require_once './Log.php';
require_once './XML.php';

class Catalog {
    public function __construct() {
        $this->Ajax();
    }
    
    private function Ajax()
    {
        switch (filter_input(INPUT_POST, "opcion"))
        {
            case "GetCatalogRecordsInXml": $this->GetCatalogRecordsInXml(); break;
            case 'AddCatalogoXML':$this->AddCatalogoXML();break;
            case 'ModifyCatalogRecord':$this->ModifyCatalogRecord();break;
            case 'AddNewRecord':$this->AddNewRecord();break;
            case 'AddNewColumn': $this->AddNewColumn(); break;
            default: echo "<p>Petición incorrecta</p>"; break;
        }
    }  
    
    private function AddNewColumn()
    {
        $BD= new DataBase();
        $XML=new XML();
        $Log = new Log();
        $Designer = new DesignerForms();
        
        $RepositoryName = filter_input(INPUT_POST, "RepositoryName");
        $NewFieldName = filter_input(INPUT_POST, "FieldName");
        $Required = filter_input(INPUT_POST, "RequiredField");
        $FieldLength = filter_input(INPUT_POST, "FieldLength");
        $FieldType = filter_input(INPUT_POST, "FieldType");
        $CatalogName = filter_input(INPUT_POST, "CatalogName");
        $DataBaseName = filter_input(INPUT_POST, "DataBaseName");
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $UserName = filter_input(INPUT_POST, "UserName");
        
        if($FieldLength>0)
        {
            $PropertyFieldLength = "long $FieldLength###";   /* Archivo config */
            $FieldLength = "($FieldLength)";            
        }
        else
        {
            $PropertyFieldLength = "";
            $FieldLength = '';
        }
        
        if(strcasecmp($FieldType, "TEXT")!=0)
               $AddForeigKey =  ", ADD FOREIGN KEY ($NewFieldName) REFERENCES $CatalogName ($NewFieldName)";
        else
            $AddForeigKey = '';
        
        if(strcasecmp($Required, "true")==0)
            $Null = "NOT NULL";
        else
            $Null = "";      
        $AlterCatalog = "ALTER TABLE $CatalogName ADD COLUMN $NewFieldName $FieldType $FieldLength $Null";        
//        echo "<br><br>$AlterCatalog<br>";
        if(($ResultAlterCatalog = $BD->ConsultaQuery($DataBaseName, $AlterCatalog))!=1)
        {
            $XML->ResponseXML("Error", 0, "<p><b>Error</b> al insertar la nueva columna en <b>$CatalogName</b></p><br>Detalles:<br><br>$ResultAlterCatalog");
            return 0;
        }  
        
        $NewProperty = "Properties###name $NewFieldName###type $FieldType###".$PropertyFieldLength."required $Required###";
        $RegisterProperty = DesignerForms::AddPropertyIntoStructureConfig($DataBaseName, "Catalogo_$CatalogName", $NewProperty);       
        
        if(strcasecmp($RegisterProperty, 1)!=0)
        {
            echo $RegisterProperty;
            $RemoveNewColumn = "ALTER TABLE $CatalogName DROP COLUMN $NewFieldName";
            $BD->ConsultaQuery($DataBaseName, $RemoveNewColumn);
            return 0;
        }                              
        
        $XML->ResponseXML("AddNewColumn", 1, "Columna $NewFieldName agregada a $CatalogName");                
    }
    
    private function AddNewRecord()
    {
        $BD= new DataBase();
        $XML=new XML();
        $Log = new Log();
        
        $NombreCatalogo=filter_input(INPUT_POST, "CatalogName");
        $xmlResponse=filter_input(INPUT_POST, "XmlReponse");
        $DataBaseName=  filter_input(INPUT_POST, "DataBaseName");
        $RegistroCatalogo='';    /* Cadena que genera el registro de la fila insertada en ../Configuracion/NombreCatalogo.ini */
        
        /* Xml que contiene los campos a regresar al cliente para la inserción en la tabla que lista un catálogo */
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("AddNewRecord");
        $doc->appendChild($root);   
        
        /* Fin declaración XML */
        
        
        $xml=  simplexml_load_string($xmlResponse);
        $cadenaCampos='';
        $cadenaValores='';        
        
        foreach ($xml->MetaData as $metadata)
        {
            $RegistroCatalogo.=$metadata->value." , "; 
            $cadenaCampos.=$metadata->name.",";
            $type=$metadata->type;
            $value=$metadata->value;
            
            if(strcasecmp($type,"int")==0 or strcasecmp($type,"integer")==0 or strcasecmp($type,"float")==0 or strcasecmp($type,"double")==0) /* Si detecta un tipo numerico */
            {
                if(!(is_numeric("$value")))
                    $cadenaValores.="0,";
                else
                    $cadenaValores.=$metadata->value.",";
            }
            else
                $cadenaValores.="'".$metadata->value."'".",";
            
            /* Campos y valores devueltos al cliente */
            $Field = $doc->createElement("Field");
            $FieldName = $doc->createElement("FieldName", $metadata->name);
            $Field->appendChild($FieldName);
            $FieldType = $doc->createElement("FieldType", $type);
            $Field->appendChild($FieldType);
            $FieldValue = $doc->createElement("FieldValue", $value);
            $Field->appendChild($FieldValue);
            $root->appendChild($Field);
        }
        
        $RegistroCatalogo=  trim($RegistroCatalogo,' , ');
        
        $cadenaValores = trim($cadenaValores,',');  /* Quita la última Coma ( , ) */
        $cadenaCampos = trim($cadenaCampos,',');
        
        $query="INSERT INTO $NombreCatalogo (".$cadenaCampos .") VALUES (".$cadenaValores.")";
         
        $IdNewRow=$BD->ConsultaInsertReturnId($DataBaseName, $query);
        
        if(!$IdNewRow>0)
        {          
            $XML->ResponseXML("Error", 0, "<p>Error al agregar los nuevos datos al catálogo $NombreCatalogo verifique sus datos. $IdNewRow</p>");
            return;
        }                                       
            
        $IdRow = $doc->createElement("IdCatalog", $IdNewRow);
        $root->appendChild($IdRow);
        $Mensaje = $doc->createElement("Mensaje", "Registro añadido");
        $root->appendChild($Mensaje);
        header ("Content-Type:text/xml");
        echo $doc->saveXML();  
            
    }
    
    private function ModifyCatalogRecord()
    {
        $XML=new XML();
        $BD= new DataBase();
        $Log = new Log();
        
        $DataBaseName=  filter_input(INPUT_POST, "DataBaseName");
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $UserName = filter_input(INPUT_POST, "UserName");
        $IdRepository = filter_input(INPUT_POST, "IdRepository");
        $IdCatalog = filter_input(INPUT_POST, "IdCatalog");
        $CatalogName = filter_input(INPUT_POST, "CatalogName");
        $FieldName = filter_input(INPUT_POST, "FieldName");                        
        $FieldType = filter_input(INPUT_POST, "FieldType");
        $NewValue = filter_input(INPUT_POST, "NewValue");
        
        if(strcasecmp($FieldType, "varchar")==0 or strcasecmp($FieldType, "int")==0 or strcasecmp($FieldType, "integer")==0 or strcasecmp($FieldType, "float")==0)
            $NewField = "$FieldName = $NewValue";
        else
            $NewField = "$FieldName = '$NewValue'";
        
        $UpdateCatalog = "UPDATE $CatalogName SET $NewField WHERE Id$CatalogName = $IdCatalog";
               
        if(($ResultUpdate = $BD->ConsultaQuery($DataBaseName, $UpdateCatalog))!=1)
        {
            $XML->ResponseXML("Error", 0, "<p><b>Error</b> al actualizar el catálogo</p><br>Detalles:<br><br>$ResultUpdate");
            return 0;
        }
        
        echo $NewValue;   /* Se imprime el valor ya que la salida se plasma sobre el campo que se está modificando */
        
        $Log->Write('10', $IdUser, $UserName, " '$CatalogName' que contiene la clave '$IdCatalog' su nuevo valor es '$NewValue'", $DataBaseName);
    }
    
    private function GetCatalogRecordsInXml()
    {
        $XML=new XML();
        $BD= new DataBase();
        $DataBaseName=  filter_input(INPUT_POST, "DataBaseName");
//        $IdUsuario=  filter_input(INPUT_POST, "IdUsuario");
//        $IdRepositorio=  filter_input(INPUT_POST, "IdRepositorio");
        $NombreCatalogo=  filter_input(INPUT_POST, "CatalogName");
        $TipoCatalogo=  filter_input(INPUT_POST, "CatalogType");
        $ListSearch='';
        if($TipoCatalogo=='ListSearch'){$ListSearch=' LIMIT 25';}
        $Consulta="SELECT *FROM $NombreCatalogo $ListSearch";
        $Catalogos=$BD->ConsultaSelect($DataBaseName, $Consulta);        
        if($Catalogos['Estado']!=1){$XML->ResponseXML("Error", 0, "<p><b>Error</b> al consultar el Catálogo <b>$NombreCatalogo</b></p><br>Detalles:<br><br>".$Catalogos['Estado']); return;}
        $XML->ResponseXmlFromArray("Catalog", "CatalogRecord", $Catalogos['ArrayDatos']); 
    }
    
        /***************************************************************************
     * Crea un nuevo Catálogo
     */
    private function AddCatalogoXML()
    {
        $XML=new XML();
        
        $ValidacionEsquema=$XML->validacion_xml();
        if(strcasecmp($ValidacionEsquema, 0)==0)
            return;
        
        $RutaXML=$ValidacionEsquema;
        $xml=  simplexml_load_file($RutaXML);  
        
        foreach ($xml->children() as $valor)
        {
            $array_nodos[]=$valor->getName();
        }
        
       if(array_search('EstructuraRepositorio', $array_nodos)!==false)
        {
            $Repositorio=$xml->EstructuraRepositorio->CrearEstructuraCatalogo;                                              
            $InsertRepositorio=$this->InsertCatalogIntoRepository($Repositorio);
            if($InsertRepositorio === 1)
                echo "<p>Catálogo(s) insertado(s) correctamente</p>";
        }
        else
        {
            $XML->ResponseXML("Error", 0, "No se encontro una estructura para insertar");
        } 
    }
    
    function InsertCatalogIntoRepository($CatalogDetail)
    {
        $DB = new DataBase();
        
        $DataBaseName = filter_input(INPUT_POST, "DataBaseName");
        $ClaveEmpresa = filter_input(INPUT_POST, "ClaveEmpresa"); 
        $NombreRepositorio = filter_input(INPUT_POST, "NombreRepositorio");
        $IdRepository = filter_input(INPUT_POST, "IdRepository");
            
        foreach ($CatalogDetail->ListProperties as $ListProperties)
        {                                                            
            foreach ($ListProperties as $list)
            {                            
                $TipoCatalogo = $list['TipoCatalogo'];

                if($TipoCatalogo!=true)
                    continue;

                $NombreCatalogo= $list['name'];
                 
                /* Se comprueba si el catálogo no se encuentra repetido */
                
                $RepositoryFields_ = $DB->GetTableFields($DataBaseName, $NombreRepositorio);

                if($RepositoryFields_['Estado']!=1)
                {
                    echo "<p><b>Error</b> al obtener los campos del Repositorio</p><br>Detalles:<br><br>".$RepositoryFields_['Estado'];
                    return 0;
                }

                $RepositoryFields = $RepositoryFields_['ArrayDatos'];

                for ($cont = 0; $cont < count($RepositoryFields); $cont++)
                {
                    if(strcasecmp($RepositoryFields[$cont]['Field'], $NombreCatalogo)==0)
                    {
                        echo "<p>El nombre del catálogo que quiere ingresar a este repositorio ya <b>existe</b></p>";
                        return 0;
                    }                
                }
                /* / */

                $List=$list->children();/* Properties de un List */
                $CatalogAttr = array("Tipo"=>$list->getName(),"Struct"=>$ListProperties->children());
                
                $TablaCatalogo="CREATE TABLE IF NOT EXISTS $NombreCatalogo (Id$NombreCatalogo int(11) NOT NULL AUTO_INCREMENT, ";

                foreach ($List as $valor)
                {
                    if($valor['long']>0)
                        $TablaCatalogo.=$valor['name']." ". $valor['type']."(".$valor['long']."), ";
                    else
                        $TablaCatalogo.=$valor['name']." ". $valor['type'].", ";                                      
                }

                $configStructure=array("TipoEstructura"=>"Catalogo","DataBaseName"=>$DataBaseName,"Estructura"=>$CatalogAttr);

                $TablaCatalogo.="PRIMARY KEY (`Id$NombreCatalogo`)" /* Al modificar, modificar también en la llave foranea del query de repositorio */
                    . ") ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8";

                if(($ResultCrearCatalogo = $DB->crear_tabla($DataBaseName,$TablaCatalogo))!=1)
                {
                    return "<p>Error al crear el catálogo <b>$NombreCatalogo</b></p>";
                }
                
                /* Se registra el catálogo en la tabla catálogos */
                $InsertCatalog = "INSERT INTO Catalogos (IdRepositorio, NombreCatalogo) VALUES ($IdRepository, '$NombreCatalogo')";
                if(($ResultInsertCatalog = $DB->ConsultaQuery($DataBaseName, $InsertCatalog))!=1)
                {
                    echo "<p><b>Error</b> al registrar el catálogo</p><br>Detalles:<br><br>".$ResultInsertCatalog;
                    $DeleteCatalog = "DROP TABLE $NombreCatalogo";
                    $DB->ConsultaQuery($DataBaseName, $DeleteCatalog);
                    return 0;
                }
                
                $DB->WriteConfigCatalogo("Catalogo_$NombreCatalogo",$configStructure);

                $AlterTable="ALTER TABLE $NombreRepositorio ADD COLUMN $NombreCatalogo INT NOT NULL, ADD INDEX $NombreCatalogo ($NombreCatalogo), ADD FOREIGN KEY ($NombreCatalogo) REFERENCES $NombreCatalogo (Id$NombreCatalogo)";

                if(($ResultAlterTable = $DB->ConsultaQuery($DataBaseName, $AlterTable))==1)
                    echo "<p>Relaciones del catálogo <b>$NombreCatalogo</b> construidas.</p>";
                else
                {
                    $DeleteCatalog = "DROP TABLE $NombreCatalogo";
                    $DB->ConsultaQuery($DataBaseName, $DeleteCatalog);
                    echo  "<b>Error</b> al crear las relaciones del catálogo <b>$NombreCatalogo</b><br><br>Detalles:<br><br> $ResultAlterTable";
                }

            }
        }
        
        return 1;
    }
}

$Catalog = new Catalog();