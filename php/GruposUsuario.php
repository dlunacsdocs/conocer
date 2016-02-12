<?php

/**
 * Description of Grupos
 *
 * @author daniel
 */

require_once 'DataBase.php';
require_once 'XML.php';
require_once 'DesignerForms.php';
require_once 'Log.php';
require_once 'Session.php';


class Grupos {
    public function __construct() {
        $this->Ajax();
    }
    private function Ajax()
    {
        if(filter_input(INPUT_POST, "opcion")!=NULL and filter_input(INPUT_POST, "opcion")!=FALSE){
            
            $idSession = Session::getIdSession();
        
            if($idSession == null)
                return XML::XMLReponse ("Error", 0, "Repository::No existe una sesión activa, por favor vuelva a iniciar sesión");

            $userData = Session::getSessionParameters();
                             
            switch (filter_input(INPUT_POST, "opcion"))
            {
                case 'NewGroup':$this->NewGroup($userData); break;
                case 'DeleteGroup':$this->DeleteGroup(); break;
                case 'ModifyGroup':$this->ModifyGroup($userData); break;      
                case 'GetUsersGroups': $this->GetUsersGroups($userData);break;   
                case 'getUserGroupsWithoutAdminUnit': $this->getUserGroupsWithoutAdminUnit($userData); break;
                case "GetGroupMemebers":$this->GetGroupMemebers();break;
                case 'GetUsersWithoutGroup':$this->GetUsersWithoutGroup(); break;
                case 'AddUsersToGroup':$this->AddUsersToGroup(); break;
                case 'DeleteGroupMembers':$this->DeleteGroupMembers(); break;
                default: break;
            }  
        }
    }   
            
    private function NewGroup($userData)
    {
        $BD = new DataBase();
        $Log = new Log();
        
        $DataBaseName = $userData['dataBaseName'];
        $IdUser = $userData['idUser'];
        $NombreUsuario = $userData['userName'];
        $Nombre = filter_input(INPUT_POST, "name");
        $Descripcion = filter_input(INPUT_POST, "description");
        
        $InsertNewGroup = "INSERT INTO GruposUsuario (Nombre,Descripcion) VALUES ('$Nombre', '$Descripcion')";

        $ExistGroup = "SELECT *FROM GruposUsuario WHERE Nombre = '$Nombre'";
        
        $ResultExistGroup = $BD->ConsultaSelect($DataBaseName, $ExistGroup);
        
        if($ResultExistGroup['Estado']!=1)
            return XML::XMLReponse("Error", 0, "<p><b>Error</b> al descartar un grupo duplicado. ".$ResultExistGroup['Estado']."</p>");
        
        $NoExist = intval($ResultExistGroup['ArrayDatos']);
        
        if($NoExist>0)
            return XML::XMLReponse("SystemAlert", 0, "El grupo que ingreso ya se encuentra registrado o es un grupo reservado del sistema");
        
        if(!($IdNewGroup = $BD->ConsultaInsertReturnId($DataBaseName, $InsertNewGroup))>0)
            return XML::XMLReponse("Error", 0, "<p><b>Error</b> al registrar un nuevo <b>Grupo de Usuarios</b>. $IdNewGroup");
                
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("NewGroup");
        $doc->appendChild($root);   
        $IdGrupo = $doc->createElement("IdGrupo",$IdNewGroup);
        $root->appendChild($IdGrupo);
        $NombreGrupo = $doc->createElement("Nombre",$Nombre);
        $root->appendChild($NombreGrupo);  
        $DescripcionGrupo = $doc->createElement("Descripcion",$Descripcion);
        $root->appendChild($DescripcionGrupo);
        $Mensaje = $doc->createElement("Mensaje","Grupo '$Nombre' dado de alta con éxito");
        $root->appendChild($Mensaje);
        
        header ("Content-Type:text/xml");
        echo $doc->saveXML();           
        
        $Log->Write("42", $IdUser, $NombreUsuario, " '$Nombre'", $DataBaseName);
        
    }
    
    private function DeleteGroup()
    {
        $XML =new XML();
        $BD = new DataBase();
        $Log = new Log();
        $DataBaseName = filter_input(INPUT_POST, "DataBaseName");
        $IdUser = filter_input(INPUT_POST, "IdUsuario");
        $NombreUsuario =  filter_input(INPUT_POST, "NombreUsuario");
        $IdGroup = filter_input(INPUT_POST, "IdGroup");
        $NombreGrupo = filter_input(INPUT_POST, "NombreGrupo");
                
        if(strcasecmp($NombreGrupo, "Administradores")==0)
        {
            $XML->ResponseXML("Error", 0, "<p>El grupo administradores no puede eliminarse del sistema</p>");
            return 0;
        }
        
        $DeleteGroup = "DELETE FROM GruposUsuario WHERE IdGrupo = $IdGroup";
        if(($ResultDeleteGroup = $BD->ConsultaQuery($DataBaseName, $DeleteGroup))!=1)
        {
            $XML->ResponseXML("Error", 0, "<p><b>Error</b> al eliminar el grupo <b>$NombreGrupo</b>. $ResultDeleteGroup</p>");
        }
        
        $XML->ResponseXML("Deleted", 1, "<p>Se eliminó del sistema el Grupo '$NombreGrupo'</p>");
        
        $Log->Write("44", $IdUser, $NombreUsuario, " '$NombreGrupo'", $DataBaseName);
    }
    
    private function ModifyGroup($userData)
    {
        $BD = new DataBase();
        $Log = new Log();
        
        $DataBaseName = $userData['dataBaseName'];
        $IdUser = $userData['userName'];
        $NombreUsuario =  $userData['userName'];
        $IdGroup = filter_input(INPUT_POST, "IdGroup");
        $NuevoNombreGrupo = filter_input(INPUT_POST, "NewGroupName");
        $Descripcion = filter_input(INPUT_POST, "NewGroupDescription");
        $OldGroupName = filter_input(INPUT_POST, "OldGroupName");
        $NombreGrupo = filter_input(INPUT_POST, "NombreGrupo");        
        
        if(strcasecmp($NombreGrupo, "Administradores")==0 or strcasecmp($NuevoNombreGrupo, "Administradores")==0 or strcasecmp($IdGroup, "1")==0)
            return XML::XMLReponse("SystemAlert", 0, "El nombre del grupo es un elemento del sistema y no puede modificarse");
        
        $ExistGroup = "SELECT *FROM GruposUsuario WHERE Nombre = '$NuevoNombreGrupo'";
        $UpdateGroup = "UPDATE GruposUsuario SET Nombre = '$NuevoNombreGrupo', Descripcion = '$Descripcion' WHERE IdGrupo = $IdGroup";
        
        if(strcasecmp($NuevoNombreGrupo, $NombreGrupo)!= 0){
            $ResultExistGroup = $BD->ConsultaSelect($DataBaseName, $ExistGroup);
            if($ResultExistGroup['Estado']!=1)
                return XML::XMLReponse("Error", 0, "<p><b>Error</b> al descartar un grupo duplicado. ".$ResultExistGroup['Estado']."</p>");
        }
        
        
        $NoExist = intval($ResultExistGroup['ArrayDatos']);
        
        if($NoExist>0)
            return XML::XMLReponse("Duplicate", 0, "El grupo que ingreso ya se encuentra registrado o es un grupo reservado del sistema");
        
        if(($ResultUpdate = $BD->ConsultaQuery($DataBaseName, $UpdateGroup))!=1)
            XML::XMLReponse("Error", 0, "<p><b>Error</b> al actualizar la información. $ResultUpdate</p>");
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("Modify");
        $doc->appendChild($root);   
        $IdGrupo = $doc->createElement("IdGrupo",$IdGroup);
        $root->appendChild($IdGrupo);
        $XmlNombreGrupo = $doc->createElement("Nombre",$NuevoNombreGrupo);
        $root->appendChild($XmlNombreGrupo);  
        $DescripcionGrupo = $doc->createElement("Descripcion",$Descripcion);
        $root->appendChild($DescripcionGrupo);
        $Mensaje = $doc->createElement("Mensaje","<p>Información actualizada del Grupo '$NuevoNombreGrupo'</p>");
        $root->appendChild($Mensaje);
        
        header ("Content-Type:text/xml");
        echo $doc->saveXML();           
        
        $Log->Write("43", $IdUser, $NombreUsuario, " '$NuevoNombreGrupo'", $DataBaseName);
        
    }
    
    
    private function GetUsersGroups($userData)
    {
        $BD = new DataBase();
        
        $DataBaseName = $userData['dataBaseName'];
        $Consulta = "SELECT *FROM GruposUsuario";
        $Usuarios = $BD->ConsultaSelect($DataBaseName, $Consulta);

        if($Usuarios['Estado']!=true)
            return XML::XMLReponse("Error", 0, "<p>Ocurrió un error al consultar los usuarios ".$Consulta['Estado']."</p>");
        
        if(!(count($Usuarios['ArrayDatos'])>0))
            return XML::XMLReponse("Error", 0, "No existen Usuarios Registrados");     

        XML::XmlArrayResponse("Grupos", "Grupo", $Usuarios['ArrayDatos']);
        
    }
    
    private function getUserGroupsWithoutAdminUnit($userData){
        $BD = new DataBase();
        
        $DataBaseName = $userData['dataBaseName'];
        $Consulta = "SELECT *FROM GruposUsuario";
        $Usuarios = $BD->ConsultaSelect($DataBaseName, $Consulta);

        if($Usuarios['Estado']!=true)
            return XML::XMLReponse("Error", 0, "<p>Ocurrió un error al consultar los usuarios ".$Consulta['Estado']."</p>");
        
        if(!(count($Usuarios['ArrayDatos'])>0))
            return XML::XMLReponse("Error", 0, "No existen Usuarios Registrados");     

        XML::XmlArrayResponse("Grupos", "Grupo", $Usuarios['ArrayDatos']);
    }
    
    private function GetGroupMemebers()
    {
        $BD= new DataBase();
        $DataBaseName=  filter_input(INPUT_POST, "DataBaseName");                
//        $IdGroup= filter_input(INPUT_POST, "IdGrupo");    /* Variable de tipo environment */
//        $NombreGrupo = filter_input(INPUT_POST, "NombreGrupo");     /* Variable de tipo environment */
        
        $IdGrupoUsuario = filter_input(INPUT_POST, "IdGrupoUsuario");
//        $NombreGrupoUsuario = filter_input(INPUT_POST, "NombreGrupoUsuario");
        
        $Consulta="select usu.IdUsuario, usu.Login, usu.Descripcion from CSDocs_Usuarios usu INNER JOIN GruposControl gc "
                . "ON usu.IdUsuario = gc.IdUsuario WHERE gc.IdGrupo = $IdGrupoUsuario";
        
        $Usuarios = $BD->ConsultaSelect($DataBaseName, $Consulta);
        
        if($Usuarios['Estado']!=1)
            return XML::XMLReponse("Error", 0, "<p>Ocurrió un error al consultar los usuarios ".$Usuarios['Estado']."</p>"); 
            
        XML::XmlArrayResponse("Usuarios", "Member", $Usuarios['ArrayDatos']);
    }
    
    private function GetUsersWithoutGroup()
    {
        $BD= new DataBase();
        $DataBaseName=  filter_input(INPUT_POST, "DataBaseName");
        $IdGroup= filter_input(INPUT_POST, "IdGrupo");        
        
        $Consulta="SELECT *FROM CSDocs_Usuarios usu WHERE usu.IdUsuario NOT IN (SELECT gc.IdUsuario FROM GruposControl gc)";
        $Usuarios=$BD->ConsultaSelect($DataBaseName, $Consulta);
        
        if($Usuarios['Estado']!=1)
            return XML::XMLReponse("Error", 0, "<p>Ocurrió un error al consultar los usuarios ".$Usuarios['Estado']."</p>");       
     
        XML::XmlArrayResponse("Usuarios", "Member", $Usuarios['ArrayDatos']);
    }
    
    private function AddUsersToGroup()
    {
        $XML=new XML();
        $BD= new DataBase();
        $DataBaseName=  filter_input(INPUT_POST, "DataBaseName");
//        $IdUsuario = filter_input(INPUT_POST, "IdUsuario");
//        $NombreUsuario = filter_input(INPUT_POST, "NombreUsuario");
        $IdGroup= filter_input(INPUT_POST, "IdGrupo");
        $NombreGrupo = filter_input(INPUT_POST, "NombreGrupo");
        $xml = filter_input(INPUT_POST, "UsersXml");
        $UsersXml=  simplexml_load_string($xml);
        $ListUsers_ = '';
        
        $QueryInsert_ = "INSERT INTO GruposControl (IdGrupo,IdUsuario) VALUES ";
        $Values = '';
        foreach ($UsersXml->User as $nodo)
        {
            $Values.=" (".$IdGroup.", ".$nodo->IdUsuario."),";
            $ListUsers_.= $nodo->Login.", ";
        }
        $ListUsers = trim($ListUsers_,",");
        $QueryInsert = $QueryInsert_.trim($Values, ",");
        
        if(($ResultInsert = $BD->ConsultaQuery($DataBaseName, $QueryInsert))!=1)
        {
            $XML->ResponseXML("Error", 0, "<p><b>Error</b> al agregar los usuarios al grupo <b>$NombreGrupo</b></br>.</p><br><p>Detalles:</p><br>$ResultInsert");
            return 0;
        }
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("AddUserToGroup");
        $doc->appendChild($root);   
                
        foreach ($UsersXml->User as $nodo)
        {
            $AddUser = $doc->createElement("Added");
            $IdUsuarioXml = $doc->createElement("IdUsuario", $nodo->IdUsuario);
            $AddUser->appendChild($IdUsuarioXml); 
            $LoginXml = $doc->createElement("Login", $nodo->Login);
            $AddUser->appendChild($LoginXml);
            $DescripcionXml = $doc->createElement("Descripcion", $nodo->Descripcion);
            $AddUser->appendChild($DescripcionXml);
            $root->appendChild($AddUser);
        }
        
        $MensajeXml = $doc->createElement("Mensaje","Se integró a '$ListUsers' al grupo '$NombreGrupo'");
        $root->appendChild($MensajeXml);
        
        header ("Content-Type:text/xml");
        echo $doc->saveXML();    
        
        
    }
    
    private function DeleteGroupMembers()
    {
        $XML=new XML();
        $BD= new DataBase();
        $DataBaseName=  filter_input(INPUT_POST, "DataBaseName");
//        $IdUser = filter_input(INPUT_POST, "IdUsuario");
//        $NombreUsuario =  filter_input(INPUT_POST, "NombreUsuario");      
//        $IdGroup= filter_input(INPUT_POST, "IdGrupo");
        $NombreGrupo = filter_input(INPUT_POST, "NombreGrupo");
        $xml = filter_input(INPUT_POST, "UsersXml");
        $UsersXml=  simplexml_load_string($xml);
        $ListUsers_ = '';
        
        $QueryDelete_ = "DELETE FROM GruposControl WHERE ";
        $Values = '';
        foreach ($UsersXml->User as $nodo)
        {
            $Values.=" IdUsuario = ".$nodo->IdUsuario." OR";
            $ListUsers_.= " ".$nodo->Login.",";
        }
        $ListUsers = trim($ListUsers_,",");
        $QueryDelete = $QueryDelete_.trim($Values, "OR");
        
        if(($ResultInsert = $BD->ConsultaQuery($DataBaseName, $QueryDelete))!=1)
        {
            $XML->ResponseXML("Error", 0, "<p><b>Error</b> al agregar los usuarios al grupo <b>$NombreGrupo</br>.</p> <p>Detalles</p><br>$ResultInsert");
            return 0;
        }
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("DeleteUser");
        $doc->appendChild($root);   
                
        foreach ($UsersXml->User as $nodo)
        {
            $DeletedUser = $doc->createElement("Deleted");
            $IdUsuarioXml = $doc->createElement("IdUsuario", $nodo->IdUsuario);
            $DeletedUser->appendChild($IdUsuarioXml); 
            $root->appendChild($DeletedUser);
        }
        
        $MensajeXml = $doc->createElement("Mensaje","Se eliminaron los usuarios del grupo '$NombreGrupo' a los usuarios '$ListUsers'");
        $root->appendChild($MensajeXml);
        
        header ("Content-Type:text/xml");
        echo $doc->saveXML();           
    }
    
}


$Grupos = new Grupos();
