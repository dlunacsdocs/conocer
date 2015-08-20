<?php
/**
 * Description of Instance
 *
 * @author Daniel
 */

require_once 'DataBase.php';
require_once 'XML.php';


class Instance {
    public function __construct() {
        $option = filter_input(INPUT_POST, "option");
        switch ($option)
        {
            case 'GetInstances': $this->GetInstances(); break;
            case "DeleteInstance": $this->DeleteInstance(); break;
        }
    }
    
    private function DeleteInstance()
    {
        $DB = new DataBase();
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $UserName = filter_input(INPUT_POST, "UserName");
        $IdInstance = filter_input(INPUT_POST, "IdInstance");
        $InstanceName = filter_input(INPUT_POST, "InstanceName");
        $RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */
        
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
        
        XML::XMLReponse("DeleteInstance", 1, "Instancia $InstanceName eliminada");
        
    }
    
    private function GetInstances()
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
