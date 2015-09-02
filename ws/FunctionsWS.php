<?php

$RoutFile = dirname(getcwd());        

require_once "$RoutFile/php/Session.php";
require_once("$RoutFile/php/DataBase.php");
require_once("$RoutFile/php/Enterprise.php");
require_once ("$RoutFile/php/Login.php");
require_once ("$RoutFile/php/Repository.php");
require_once ("$RoutFile/php/Catalog.php");
require_once ("$RoutFile/php/Tree.php");

function login($data)
{
    
    if(!isset($_SESSION))
        session_start();
    
    $login = new Login();
    $session = new Session();
      
    if(!isset($data['idInstance']))
        return array("error"=>"idInstance no encontrado.");
    if(!isset($data['instanceName']))
        return array('error'=>'instanceName no encontrado.');
    if(!isset($data['userName']))
        return array('error'=>'userName no encontrado.');
    
    /*Se comprueba si existía una sesión activa  */
    $idSession = $session->getIdSession();
    
    $userData = array();
    
    if($idSession!=null){
        $userData = $session->getSessionParameters ();
    }else{
        $idInstance = $data['idInstance'];
        $instanceName = $data['instanceName'];
        $userName = $data['userName'];
        $password = $data['password'];

        $userData = $login->searchRegisterUser($instanceName, $userName, $password);
        
    }
    
    if(!is_array($userData))
            return array("error" => $userData);
        if(count($userData)==0)
            return array("noAccess" => "Acceso denegado. Compruebe que tiene permisos para entrar al sistema al igual que su usuario o contraseña sean correctos");


    if(is_array($userData)){
        $text = '';
        if(isset($userData['IdUsuario']))
            $text.= $userData['IdUsuario'];
        if(isset($userData['Login']))
            $text.= $userData['Login'];
        if(isset($userData['IdGrupo']))
            $text.= $userData['IdGrupo'];
        if(isset($userData['Nombre']))
            $text.= $userData['Nombre'];
       
//        return array('error'=>"($idInstance, $instanceName,". $text);
        $idSession = $session->createSession($idInstance, $instanceName, $userData['IdUsuario'], $userData['Login'], $userData['IdGrupo'], $userData['Nombre']);
        return array('idSession'=>$idSession);
        
    }
    else
        return array("error"=>"Usuario o contraseña incorrectos");
}

function getInstances()
{
    $DB = new DataBase();
    $data = array();
    
    $QueryInstances = "SELECT *FROM instancias";
    
    $ResultQuery = $DB->ConsultaSelect("cs-docs", $QueryInstances);
    
    if($ResultQuery['Estado']!=1)
    {
        $data[] = array("message" => "Error inesperado: ".$ResultQuery['Estado']);
        return $data;
    }
        
    if(count($ResultQuery['ArrayDatos'])==0)
        $data[] = array("idInstance"=>0, "instanceName"=>"No existen instancias");
    
    for($cont = 0; $cont < count($ResultQuery['ArrayDatos']); $cont++){
        
        $idInstance = $ResultQuery['ArrayDatos'][$cont]['IdInstancia'];
        $instanceName = $ResultQuery['ArrayDatos'][$cont]['NombreInstancia'];
        
        $data[] = array("idInstance"=>$idInstance, "instanceName"=>$instanceName);
        
    }
    
    return $data;
}

function getEnterprises($data)
{
    $Enterprise = new Enterprise();
    $enterprisesArray = array();
    
    if(!isset($data['idSession']))
        $enterprisesArray[] = array("error"=>"Parámetro idSession no encontrado");
    if(!isset($data['userName']))
        $enterprisesArray[] =  array('error'=>'Parámetro userName no encontrado.');
    if(!isset($data['password']))
        $enterprisesArray[] = array('error'=>'Parámetro password no encontrado');
    if(!isset($data['instanceName']))
        $enterprisesArray[] = array('error'=>'Parámetro instanceName no encontrado.');
    
    if(count($enterprisesArray)>0){
        return $enterprisesArray;
    }
    
    $idSession = $data['idSession'];
        
    $enterprises = $Enterprise->getEnterprisesArray($data['instanceName']);
    
    session_id($idSession);
    
    if(!is_array($enterprises))
        return array("message"=>$enterprises);
    
    for($cont = 0; $cont < count($enterprises); $cont++){
        $enterprisesArray[] = array("idEnterprise"=>$enterprises[$cont]['IdEmpresa'], 
                            "enterpriseName"=>$enterprises[$cont]['NombreEmpresa'],
                            "enterpriseKey"=>$enterprises[$cont]['ClaveEmpresa']);
    }
    
    return $enterprisesArray;
}

function getRepositories($data){
    $repositoriesArray = array();
    
    if(!isset($data['idSession']))
        $repositoriesArray[] = array('error'=>'Párametro idSession no encontrado');
    if(!isset($data['userName']))
        $repositoriesArray[] =  array('error'=>'Parámetro userName no encontrado.');
    if(!isset($data['password']))
        $repositoriesArray[] = array('error'=>'Parámetro password no encontrado');
    if(!isset($data['enterpriseKey']))
        $repositoriesArray[] = array('error'=>'Párametro enterpriseKey no encontrado');
    
    if(count($repositoriesArray)>0)
        return $repositoriesArray;
    
    $repositories = array();
    $instanceName = $data['instanceName'];
    $enterpriseKey = $data['enterpriseKey'];
    $userName = $data['userName'];
    $password = $data['password'];
    $idGroup = 0;
    $idUser = 0;
    
    $Login = new Login();
    $Repository = new Repository();
   
    $userDetail = $Login->searchRegisterUser($instanceName ,$userName, $password);
    
    

    if(!is_array($userDetail)){
        $repositoriesArray[] = array("error"=>"Error inesperado. $userDetail");
        return $repositoriesArray;
    }
    else if(!isset($userDetail['IdGrupo'])){
        $repositoriesArray[] = array("message"=>"Primer if");
        
        $repositoriesArray[] = array("error"=>"No se encontrò al usuario en un grupo.");
        
    }else{
        $idGroup = $userDetail['IdGrupo'];
        $idUser = $userDetail['IdUsuario'];
        if($idGroup>0){
            $repositories = $Repository->GetRepositoriesList($instanceName, $enterpriseKey, $idGroup, $idUser);
        }else
            $repositoriesArray[] = array("error"=>"Id grupo no encontrado");
    }
          
    if(count($repositoriesArray)>0)
        return $repositoriesArray;
    
    for($cont = 0; $cont < count($repositories); $cont++){
        $repositoriesArray[] = array('idRepository'=>$repositories[$cont]['IdRepositorio'], 
            'repositoryName'=>$repositories[$cont]['NombreRepositorio']);        
    }
 
    return $repositoriesArray;
}

function getCatalogs($data){
    
    $Catalog = new Catalog();
    
    $catalogs = array();
    $error = array();
    
    if(!isset($data['instanceName']))
        $error[] = array('error'=>"No se encontró el parámetro instanceName");
    if(!isset($data['userName']))
        $error[] = array('error'=>'No se encontró el parámetro userName');
    if(!isset($data['password']))
        $error[] = array('error'=>'No se encontró el parámetro password');
    if(!isset($data['idRepository']))
        $error[] = array('error'=>'No se encontró el parámetro idRepository');
    
    if(count($error)>0)
        return $error;
    
    $idRepository = $data['idRepository'];
    $instanceName = $data['instanceName'];
    
    $catalogRequest = $Catalog->getCatalogsArray($instanceName, $idRepository);
            
    if(!is_array($catalogRequest)){
        $error[] =  array('error'=>$catalogRequest);
        return $error;
    }
    
    for($cont = 0; $cont < count($catalogRequest); $cont++){
        $catalogs[] = array('idCatalog'=>$catalogRequest[$cont]['IdCatalogo'], 
            'catalogName'=>$catalogRequest[$cont]['NombreCatalogo']);
    }
    
    if(count($catalogs)==0)
        $catalogs[] = array('idCatalog'=>0, 'catalogName'=>'No existen catálogos asociados al repositorio');
    
//    $catalogs[] = array("message"=>"catalogResponse WS ");
    
//    $catalogs[] = array('idCatalog'=>0, 'catalogName'=>'No existen catálogos asociados al repositorio');
    
    return $catalogs;
    
}

function getTreeStructure($data){
    
    $error = array();
    $Tree = new Tree();
    $treeStructure = array();
    
    if(!isset($data['instanceName']))
        $error[] = array('error'=>"No se encontró el parámetro instanceName");
    if(!isset($data['userName']))
        $error[] = array('error'=>'No se encontró el parámetro userName');
    if(!isset($data['password']))
        $error[] = array('error'=>'No se encontró el parámetro password');
    if(!isset($data['repositoryName']))
        $error[] = array('error'=>'No se encontró el parámetro repositoryName');
    
    if(count($error)>0)
        return $error;
    
    $instanceName = $data['instanceName'];
    $repositoryName = $data['repositoryName'];
    
    $directories = $Tree->getDirectoriesArray($instanceName, $repositoryName);
    
    if(!is_array($directories)){
        $error[] = array('error'=>'Error inesperado. '.$error);
        return $error;
    }
    
    for($cont = 0; $cont < count($directories); $cont++){
        $treeStructure[] = array('idDirectory' => $directories[$cont]['IdDirectory'],
            'idParent' => $directories[$cont]['parent_id'], 'dirname' => $directories[$cont]['title']);
    }
    
    
//    $error[] = array('message'=>'Respuesta desde WS Àrbol');
    
    return $treeStructure;
}