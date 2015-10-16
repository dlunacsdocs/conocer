<?php
/**
 * Description of Instance
 *
 * @author Daniel
 */

require_once 'DataBase.php';
require_once 'XML.php';
require_once 'Session.php';

if (!isset($_SESSION))
    session_start();

class Instance {
    public function __construct() {
        $option = filter_input(INPUT_POST, "option");
        switch ($option)
        {
            case 'getInstances': $this->getInstances(); break;
            case "DeleteInstance": $this->DeleteInstance(); break;
            case 'buildNewInstance': $this->buildNewInstance(); break;
        }
    }
    
    private function buildNewInstance(){
        $DB = new DataBase();
        $instanceName = filter_input(INPUT_POST, "instanceName");
        $userName = filter_input(INPUT_POST, "userName");
        
        $RoutFile = dirname(getcwd());
        
        $createSchema = "CREATE DATABASE $instanceName 
                        DEFAULT CHARACTER SET utf8
                        DEFAULT COLLATE utf8_general_ci";
        
        if(file_exists("$RoutFile/Estructuras/$instanceName"))
                return XML::XMLReponse("Error", 0, "La instancia ingresada ya existe.");
        
        if(($result = $DB->ConsultaQuery("", $createSchema))!=1)
                return XML::XMLReponse ("Error", 0, "<b>Error</b> al intentar crear la instancia $instanceName.<br>Detalles:<br>$result" );
        
        if(($resultBuildInstanceControl = $DB->CreateCSDocsControl($instanceName))!=1){
                $DB->ConsultaQuery("", "DROP DATABASE IF EXISTS $instanceName");
                return XML::XMLReponse ("Error", 0, "<b>Error</b> al crear la estructura de control de la instancia <b>$instanceName</b>. $resultBuildInstanceControl");
        }
        if($resultBuildInstanceControl == 0){
            $DB->ConsultaQuery("", "DROP DATABASE IF EXISTS $instanceName");
        }
        
        $InsertInstance = "INSERT INTO instancias (NombreInstancia, fechaCreacion, usuarioCreador) VALUES ('$instanceName', 'now()', '$userName')";
        
        if(($resultInsert = $DB->ConsultaQuery("cs-docs", $InsertInstance))!=1){
            $DB->ConsultaQuery("", "DROP DATABASE IF EXISTS $instanceName");
            return XML::XMLReponse("Error", 0, "<b>Error</b> al intentar registrar la instancia. <br>Detalles:<br>$resultInsert");
        }
        
        mkdir("$RoutFile/Estructuras/$instanceName", 0777);
        
        /* Archivo que almacena la configuración de la estrucutra de usuarios, empresas, repositorios, etc */
        touch("$RoutFile/Configuracion/$instanceName.ini");
       
        return XML::XMLReponse("newInstanceBuilded", 1, "Instancia construida con éxito.");
        
    }
    
    private function DeleteInstance()
    {
        $DB = new DataBase();
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $UserName = filter_input(INPUT_POST, "UserName");
        $IdInstance = filter_input(INPUT_POST, "IdInstance");
        $InstanceName = filter_input(INPUT_POST, "InstanceName");
        
        $idSession = Session::getIdSession();

        if($idSession == null)
                return XML::XMLReponse ("Error", 0, "Tree:No existe una sesión activa, por favor vuelva a iniciar sesión");
            
        $userData = Session::getSessionParameters();
        
        /* Sí el usuario inicio sesión en la misma instancia que va a eliminar, se destruye la sesión */
        if(is_array($userData)){
            if(isset($userData['dataBaseName']))
                Session::destroySession ();
        }
        
        $RoutFile = dirname(getcwd());
        
        $QueryDrop = "DROP DATABASE IF EXISTS $InstanceName";
        if(($Result = $DB->ConsultaQuery("cs-docs", $QueryDrop))!=1)
        {
            XML::XMLReponse("Error", 0, "<p><b>Error</b> al eliminar la instancia $InstanceName</p>".$QueryDrop);
            return 0;
        }
        
        $DeleteRegister = "DELETE FROM instancias WHERE IdInstancia = $IdInstance";
        if(($ResultDelete = $DB->ConsultaQuery("cs-docs", $DeleteRegister))!=1)
        {
            XML::XMLReponse("Error", 0, "<p><b>Error</b> al eliminar el registro de la instancia en cs-docs</p>");
            return 0;
        }
                
        if(file_exists("$RoutFile/Configuracion/$InstanceName.ini"))
            unlink("$RoutFile/Configuracion/$InstanceName.ini");
        
        if(file_exists("$RoutFile/Configuracion/$InstanceName"))
            exec("rm -R $RoutFile/$InstanceName");
        
        if(file_exists("$RoutFile/Configuracion/Catalogos/$InstanceName"))
            exec("rm -R $RoutFile/Configuracion/Catalogos/$InstanceName");
        
        if(file_exists("$RoutFile/Estructuras/$InstanceName"))
            exec("rm -R $RoutFile/Estructuras/$InstanceName");    
        
        if(file_exists("$RoutFile/Configuracion/MassiveUpload/$InstanceName"))
            exec("rm -R $RoutFile/Configuracion/MassiveUpload/$InstanceName"); 
        
        if(file_exists("$RoutFile/Configuracion/Catalogs/$InstanceName"))
            exec("rm -R $RoutFile/Configuracion/Catalogs/$InstanceName"); 
        
        if(file_exists("$RoutFile/Configuracion/EmptyTrash/$InstanceName"))
            exec("rm -R $RoutFile/Configuracion/EmptyTrash/$InstanceName"); 
        
        if(file_exists("$RoutFile/Configuracion/RestoreTrash/$InstanceName"))
            exec("rm -R $RoutFile/Configuracion/RestoreTrash/$InstanceName"); 
        
        if(file_exists("$RoutFile/Configuracion/DeleteDirectory/$InstanceName"))
            exec("rm -R $RoutFile/Configuracion/DeleteDirectory/$InstanceName");  
        
        if(file_exists("/volume1/Publisher/$InstanceName"))
            exec("rm -R /volume1/Publisher/$InstanceName");  
        
        if(file_exists("$RoutFile/Log/$InstanceName"))
            exec ("rm -R $RoutFile/Log/$InstanceName");
                
        XML::XMLReponse("DeleteInstance", 1, "Instancia $InstanceName eliminada");
        
    }
    
    private function getInstances()
    {        
        $instances = $this->getInstancesArray();
        
        if(is_array($instances))
            XML::XmlArrayResponse("Instances", "Instance", $instances);
        else
            XML::XMLReponse("Error", 0, "<p><b>Error</b> al obtener el listado de instancias del sistema</p><br><br>Detalles:<br><br>".$instances);

    }
    
    function getInstancesArray()
    {
        $DB = new DataBase();
        
        $QueryInstances = "SELECT *FROM instancias";
        $ResultQuery = $DB->ConsultaSelect("cs-docs", $QueryInstances);
        
        if($ResultQuery['Estado']!=1)
            return $ResultQuery['Estado'];
        else
            return $ResultQuery['ArrayDatos'];
    }
    
}

$instances = new Instance();
