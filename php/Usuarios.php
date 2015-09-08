<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Usuarios
 *
 * @author daniel
 */
require_once 'DataBase.php';
require_once 'XML.php';
require_once 'DesignerForms.php';
require_once 'Log.php';
require_once __DIR__.'/Encrypter.php';

$RoutFile = dirname(getcwd());        


class Usuarios {
    static $userName =  null;
    static $idUser = 0;
    static $idGroup = 0;
    static $groupName = null;
    
    public function __construct() {
        $this->Ajax();
    }
    private function Ajax()
    {
        switch (filter_input(INPUT_POST, "opcion"))
        {
            case "ExistRoot":$this->ExisteRoot();break;
            case 'AddUser': $this->AddUser(); break;
            case 'AddXmlUser': $this->AddXmlUser(); break;
            case 'UsersList': $this->UsersList();break;            
            case 'GetUsersDiffGroup': $this->GetUsersDiffGroup();break;
            case 'AddUserToGroup': $this->AddUserToGroup();break;
            case 'DeleteUserFromGroup': $this->DeleteUserFromGroup(); break;
            case 'GetInfoUser':$this->GetInfoUser(); break;
            case 'ModifyUser':$this->ModifyUser(); break;
            case 'CM_RemoveUser':$this->CM_RemoveUser(); break;                                         
        }      
    }           
    
    private function AddUser()
    {
        $BD= new DataBase();
        
        $UserXml = filter_input(INPUT_POST, "UserXml");
        $xml =  simplexml_load_string($UserXml);
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $UserName = filter_input(INPUT_POST, "UserName");
        $DataBaseName = filter_input(INPUT_POST, "DataBaseName");
        $RoutFile = dirname(getcwd());        
        $UserLogin = '';
        $Password = '';
                       
        if(!file_exists("$RoutFile/version/config.ini"))
        {
            XML::XMLReponse("Error", 0, "<p><b>Error</b><br><br> El registro de configuración de CSDocs no existe. Reportelo directamente con CSDocs</p>");
            return 0;
        }
        
        $EncryptedSetting = parse_ini_file("$RoutFile/version/config.ini", true);
        if($EncryptedSetting === FALSE)
        {
            XML::XMLReponse("Error", 0, "<p><b>Error</b> en el registro de configuración de CSDocs $EncryptedSetting</p>");
            return 0;
        }
        
        $UsersNumber_ = $this->CheckUsersNumber($DataBaseName);
        if($UsersNumber_['Estado']!=1)
        {
            XML::XMLReponse("Errro", 0, "<p><b>Error</b> al obtener el numéro de usuarios en el sistema</p><br>Detalles:<br><br>".$UsersNumber_['Estado']);
            return 0;
        }
        $UsersNumber = $UsersNumber_['ArrayDatos']['COUNT(*)'];        

        $UsersNumberEncrypted = $EncryptedSetting['UsersNumber'];
        $UserNumberDecrypted = Encrypter::decrypt($UsersNumberEncrypted);
        
        if($UsersNumber>=$UserNumberDecrypted)
        {
            XML::XMLReponse("warning", 0, "<p>Advertencia</p> <br><br><p>Numéro de usuarios alcanzado para su versión de CSDocs</p>");
            return 0;
        }                                                
        
        $ValuesChain=''; $FieldsChain = '';
        foreach ($xml as $field)
        {            
            $FieldValue = $field->FieldValue;
            $FiledType = $field->FieldType;
            $FieldName = $field->FieldName;
            
            if(strcasecmp($FieldName, "Password")==0)
            {
                $Password = $FieldValue;
                if(strlen ($Password)<=4)
                {
                    XML::XMLReponse("warning", 0, "<p><b>Error</b> contraseña demasiado corta </p>");
                    return 0;
                }
            }
            
            if(strcasecmp($FieldName, "Login")==0)
            {
                $UserLogin = $FieldValue;
                if(strcasecmp($UserLogin, 'root')==0)
                {
                    XML::XMLReponse("warning", 0, "<p>No puede utilizarse este nombre de usuario ya que es parte del sistema</p>");
                    return 0;
                }
            }
            
//            echo "<p>FieldName = $field->FieldName FieldValue = $FieldValue  FieldType = $FiledType</p>";
            $FormattedField = DataBase::FieldFormat($FieldValue, $FiledType);
//            echo "<p>Campo formateado = $FormattedField</p>";
            if(strcasecmp($FormattedField, 0)!=0)
            {
                $ValuesChain.= $FormattedField.", ";
                $FieldsChain.=$FieldName.", ";
            }                
        }
        
        $ValuesChain_ = trim($ValuesChain, ", ");
        $FieldsChain_ = trim($FieldsChain, ", ");
        
        $ExistUser = $this->CheckIfExistUser($DataBaseName, $UserLogin);
        
        if($ExistUser===1)
        {
            XML::XMLReponse('warning', 0, "El nombre de usuario ya está registrado");
            return 0;
        }
        else if($ExistUser!==0 and $ExistUser!==1)
        {
            XML::XMLReponse("Error", 0, "<p><b>Error</b> al comprobar existencia del usuario que desea ingresar</p><br>Detalles:<br><br>$ExistUser");
            return 0;
        }
            
        $QInsertUser = "INSERT INTO Usuarios ($FieldsChain_) VALUES ($ValuesChain_)";
        
        if(!($IdNewUser = $BD->ConsultaInsertReturnId($DataBaseName, $QInsertUser))>0)
        {
            XML::ReturnError("<p><b>Error</b> al intentar registrar el nuevo usuario</p><br>Detalles:<br><br>$IdNewUser");
            return 0;
        }
        $InsertIntoCSDocs = "INSERT INTO Usuarios (Login, Password) VALUES ('$UserLogin', '$Password')";
        if(!($BD->ConsultaInsertReturnId("cs-docs",$InsertIntoCSDocs))>0)
        {
            $DeleteNewUser = "DELETE FROM Usuarios WHERE IdUsuario = $IdNewUser";
            $BD->ConsultaQuery($DataBaseName, $DeleteNewUser);
            return 0;
        }
        
        XML::XMLReponse("AddUser", 1, "<p>Usuario $UserLogin ingresado(a) con éxito a la instancia $DataBaseName </p>");
        
        Log::WriteEvent("15", $IdUser, $UserName, " '$UserLogin'", $DataBaseName);
    }
    
    private function CheckUsersNumber($DataBaseName)
    {
        $DB = new DataBase();
        $estado=true;
        $conexion = $DB->Conexion();
        if (!$conexion) {
            $estado= mysql_error();
            $error=array("Estado"=>$estado, "ArrayDatos"=>0);
            return $error;
        }

        mysql_select_db($DataBaseName,  $conexion);  
        $query="SELECT COUNT(*) FROM Usuarios";
        $select=mysql_query($query,  $conexion);
        if(!$select)
            {
                $estado= mysql_error(); 
                $error=array("Estado"=>$estado, "ArrayDatos"=>0);
                return $error;
            }    
        
        $ResultadoConsulta=  mysql_fetch_assoc($select);
        mysql_close($conexion);
            
        $Resultado=array("Estado"=>$estado, "ArrayDatos"=>$ResultadoConsulta);
        return $Resultado;
    }
    
    private function CheckIfExistUser($DataBaseName, $UserName)
    {
        $BD = new DataBase();
        $ExistUser = $BD->ConsultaSelect($DataBaseName, "SELECT *FROM Usuarios WHERE Login = '$UserName'"); 
        if($ExistUser['Estado']!=1)
        {
            echo "<p>Error al comprobar existencia del usuario en el sistema. ". $ExistUser['Estado'] ."</p>";
            return $ExistUser['Estado'];
        }
        if(count($ExistUser['ArrayDatos'])>0)
            return 1;
        else
            return 0;
    }
    
    private function CM_RemoveUser()
    {
        $BD= new DataBase();

        $DataBaseName= filter_input(INPUT_POST, "DataBaseName");
        $IdUser= filter_input(INPUT_POST, "IdUser");
        $IdRemoveUser=  filter_input(INPUT_POST, "IdRemoveUser");
        $nombre_usuario=  filter_input(INPUT_POST, "nombre_usuario");
        $NameUserToRemove = filter_input(INPUT_POST, "NameUserToRemove");
        $Password = filter_input(INPUT_POST, "Password");

        if($IdRemoveUser==$IdUser and $nombre_usuario!='root'){XML::XMLReponse("Error", 0, "No puede eliminarse así mismo."); return;}
        
        $ConsultaDelete="DELETE FROM Usuarios WHERE IdUsuario=$IdRemoveUser";
        $ResultadoConsulta=$BD->ConsultaQuery($DataBaseName, $ConsultaDelete);
        if($ResultadoConsulta!=1)
        {
            XML::XMLReponse("Error", 0, "Error de Consulta. $ResultadoConsulta. ");
            return;
        }
        
        $DeleteFromCsdocs = "DELETE FROM Usuarios WHERE Login = '$NameUserToRemove' AND Password = '$Password'";
        if(($ResultDelete = $BD->ConsultaQuery($DataBaseName, $DeleteFromCsdocs))!=1)
        {
            XML::XMLReponse("Error", 0, "<p><b>Error</b> al eliminar el usuario del contenedor de usuarios de CSDocs. Esto puede alterar el control del límite de usuarios de su versión de CSDocs, pongase en contacto con soporte técnico</p>");
            return 0;
        }
        
        XML::XMLReponse("RemoveUser", 1, "<p>Usuario $NameUserToRemove eliminado con éxito </p>");
        Log::WriteEvent("17", $IdUser, $nombre_usuario, " '$NameUserToRemove'", $DataBaseName);                
    }
    
    private function ModifyUser()
    {
        $BD= new DataBase();
        $XmlModify=  filter_input(INPUT_POST, "ModifyFileXml");
        $DataBaseName= filter_input(INPUT_POST, "DataBaseName");
        $IdUser= filter_input(INPUT_POST, "IdUser");
        $IdModifyUser=  filter_input(INPUT_POST, "IdModifyUser");
        $UserNameModiffied = filter_input(INPUT_POST, "UserNameModiffied");
        $UserName = filter_input(INPUT_POST, "UserName");
        $xml=  simplexml_load_string($XmlModify);

        $Update="UPDATE Usuarios SET ";
        
        for($cont=0; $cont<count($xml->Campo); $cont++)
        {
            $value=$xml->Campo[$cont]->value;
            $name=$xml->Campo[$cont]->name;
            $type=$xml->Campo[$cont]->type;
          
            $FormattedField = DataBase::FieldFormat($value, $type);
            if(strcasecmp($FormattedField, 0)!=0)
            {
                $Update.="$name = $FormattedField,";
            }
        }
        
        $Update=  trim($Update,',');
        $Update.=" WHERE IdUsuario=$IdModifyUser";
        
        $ResulUpdate=$BD->ConsultaQuery($DataBaseName, $Update);
        if($ResulUpdate!=1)
        {
            XML::XMLReponse("Error", 0, "Error al actualizar los datos. $ResulUpdate");
            return 0;
        }
        
        Log::WriteEvent("16", $IdUser, $UserName, " $UserNameModiffied", $DataBaseName);
        XML::XMLReponse("Modify", 1, "Datos actualizados con éxito.");
        
        
    }
    
    /***************************************************************************
     * Editar la informacion de un Usuario
     */
    private function GetInfoUser()
    {
        $XML=new XML();
        $BD= new DataBase();
        $designer=new DesignerForms();
        $IdUser=  filter_input(INPUT_POST, "IdUser");
        $DataBaseName=  filter_input(INPUT_POST, "DataBaseName");
        $QueryInfoUser="SELECT *FROM Usuarios WHERE IdUsuario=$IdUser";
        $InfoUser=$BD->ConsultaSelect($DataBaseName, $QueryInfoUser);
//        var_dump($InfoUser);
        $EstructuraConfig=parse_ini_file ("../Configuracion/$DataBaseName.ini",true);
        $ArrayStructuUser=$designer->ReturnStructure("Usuarios", $EstructuraConfig["Usuarios"]);
        $StructDefault=$designer->ReturnStructureDefault("Usuarios", $EstructuraConfig["Usuarios"]);
        /*  Una vez obtenida la estructura definida por el usuario se
         *  devuelven los datos en un XML hacia el cliente */
//        var_dump($StructDefault);
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("Usuario");
        $doc->appendChild($root);   
        for($cont=0; $cont<count($StructDefault); $cont++)
        {
            $NombreCampo=$StructDefault[$cont]['name'];
            $ValorCampo=$InfoUser['ArrayDatos'][0][$NombreCampo];
            $columna=$doc->createElement($NombreCampo,$ValorCampo);
            $root->appendChild($columna);
        }
        
        for($cont=0; $cont<count($ArrayStructuUser); $cont++)
        {
            $NombreCampo=$ArrayStructuUser[$cont]['name'];
            $ValorCampo=$InfoUser['ArrayDatos'][0][$NombreCampo];
            $columna=$doc->createElement($NombreCampo,$ValorCampo);
            $root->appendChild($columna);
        }
        
        header ("Content-Type:text/xml");
        echo $doc->saveXML();           
    }
    
    /***************************************************************************
     * 
     * Retira a un usuario de un grupo y lo mueve a NoGroup
     * 
     */
    private function DeleteUserFromGroup()
    {
        $BD= new DataBase();
        $DataBaseName=  filter_input(INPUT_POST, "DataBaseName");                
        $IdUser=filter_input(INPUT_POST, "IdUser");
        
        $Consulta="UPDATE Usuarios SET IdRol=1 WHERE IdUsuario=$IdUser";
        if(($Grupo=$BD->ConsultaQuery($DataBaseName, $Consulta))!=true){XML::XMLReponse("Error", 0, "Error en la asignación de grupo. $Grupo");}
        else{XML::XMLReponse("DeleteUserFromGroup", "1", "Usuario movido a NoGroup");}
    }
    
    /******************************************************************************
     * 
     * Agrega un Usuario a un Grupo independientemente de en que grupo se encuentre
     * 
     */
    private function AddUserToGroup()
    {
        $BD= new DataBase();
        $DataBaseName=  filter_input(INPUT_POST, "DataBaseName");                
        $IdUser=filter_input(INPUT_POST, "IdUser");
        $IdGroupDestination=filter_input(INPUT_POST, "IdGroupDestination");
        
        $Consulta="UPDATE Usuarios SET IdRol=$IdGroupDestination WHERE IdUsuario=$IdUser";
        if(($Grupo=$BD->ConsultaQuery($DataBaseName, $Consulta))!=true){XML::XMLReponse("Error", 0, "Error en la asignación de grupo. $Grupo");}
        else{XML::XMLReponse("UserToGroup", "1", "Agregado con éxito");}
    }
    
    /***************************************************************************
     * Obtiene los usuarios que pertenecen a otros grupos diferentes a uno seleccionado
     */
    private function GetUsersDiffGroup()
    {
        $XML=new XML();
        $BD= new DataBase();
        $DataBaseName=  filter_input(INPUT_POST, "DataBaseName");
        $IdGroup= filter_input(INPUT_POST, "IdGroup");
        $Consulta="select IdUsuario,Nombre,IdRol,Login from Usuarios  where IdRol!=$IdGroup and estatus=1";
        $Usuarios=$BD->ConsultaSelect($DataBaseName, $Consulta);
        if($Usuarios['Estado']!=true){XML::XMLReponse("Error", 0, "<p>Ocurrió un error al consultar los usuarios ".$Consulta['Estado']."</p>"); return;}
        $XML->ResponseXmlFromArray("Usuarios", "Usuario", $Usuarios['ArrayDatos']);
    }

    /****************************************************************************
     * Esta función regresa el listado de usuarios registrados en el sistema
     */
    private function UsersList()
    {
        $XML=new XML();
        $BD= new DataBase();
        $DataBaseName=  filter_input(INPUT_POST, "DataBaseName");
        $Consulta="SELECT *FROM Usuarios where estatus=1";
        $Usuarios=$BD->ConsultaSelect($DataBaseName, $Consulta);

        if($Usuarios['Estado']!=true){XML::XMLReponse("Error", 0, "<p>Ocurrió un error al consultar los usuarios ".$Consulta['Estado']."</p>"); return;}
        $XML->ResponseXmlFromArray("ListUsers", "Usuario", $Usuarios['ArrayDatos']);        
    }


    /****************************************************************************
     *  Se agrega un usuario nuevo al sistema desde la consola de Usuarios.
     */
    function AddXmlUser()
    {        
        $XML=new XML();
        $BD= new DataBase();
        $ValidacionEsquema=$XML->validacion_xml();
        if(strcasecmp($ValidacionEsquema, 0)==0)
        {       
            return;
        }     
        $RutaXML=$ValidacionEsquema;
        $xml=  simplexml_load_file($RutaXML);  
        foreach ($xml->children() as $valor)
        {
            $array_nodos[]=$valor->getName();
        }
        
        /******************************* USUARIOS *****************************/
        
        if(array_search('EstructuraUsuarios', $array_nodos)!==false)
        {
            echo "<p>Encontrado CrearEstructuraUsuarios Peso = ".count($xml->EstructuraUsuarios->InsertUsuario)."</p>";
            $StructUsuario=$xml->EstructuraUsuarios->InsertUsuario;
            $BD->insertar_usuario($StructUsuario);   
        } 
        else
        {
            $XML->ResponseXML("Error", 0, "<p>Introduzca un XML con la estructura para Usuarios</p>");
        }
    }

    /**************************************************************************
     * function: @SearchRoot
     * Comprueba que exista el usuario root al momento de iniciar sesión
     **************************************************************************/

    private function ExisteRoot()
    {
        /* Se crea instancia por default y user root */
       $DataBase=new DataBase();
       $DataBase->CreateInstanciaCSDOCS();
       $root=$DataBase->ExistUserRoot();
       if(($root['Peso']==0))
       {
           $DataBase->InsertUserRoot();
       }       
    }    
    
}
$usuarios=new Usuarios();
