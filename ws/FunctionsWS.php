<?php

$RoutFile = dirname(getcwd());        

require_once "$RoutFile/php/Session.php";
require_once("$RoutFile/php/DataBase.php");
require_once("$RoutFile/php/Enterprise.php");
require_once ("$RoutFile/php/Login.php");
require_once ("$RoutFile/php/Repository.php");

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
    
    $Login = new Login();
    $Repository = new Repository();
    
    
    $userDetail = $Login->searchRegisterUser($instanceName ,$userName, $password);

    if(!is_array($userDetail)){
        $repositoriesArray[] = array("error"=>"Error inesperado. $userDetail");
        return $repositoriesArray;
    }
    else if($userDetail['idGrupo']>0)       
        $repositoriesArray[] = array("message"=>"Primer if");
//        $repositories = $Repository->GetRepositoriesList($instanceName, $enterpriseKey, $userDetail['idGrupo'], $userDetail['IdUsuario']);
    else
        $repositoriesArray[] = array('error' => "Ocurrió un error. ");
//    
    if(count($repositoriesArray)>0)
        return $repositoriesArray;
    
    $repositoriesArray[] = array("message"=>"$instanceName $enterpriseKey".$userDetail['IdGrupo'].$userDetail['IdUsuario']);
    
//    $query = "SELECT  em.IdEmpresa, re.IdRepositorio, re.NombreRepositorio FROM Repositorios re "
//                . "INNER JOIN RepositoryControl rc ON rc.IdRepositorio = re.IdRepositorio "
//                . "INNER JOIN Empresas em on re.ClaveEmpresa=em.ClaveEmpresa "
//                . "WHERE rc.IdGrupo = $IdGroup AND re.ClaveEmpresa = '$EnterpriseKey'";
    
//    for($cont = 0; $cont < count($repositories); $cont++){
//        $repositoriesArray[] = array('idRepository'=>$repositories[$cont]['IdRepositorio'], 
//            'repositoryName'=>$repositories[$cont]['NombreRepositorio']);        
//    }
//     array('message' => "Resultado obtenido ".  implode(',',  $repositories));
//         $repositoriesArray[] = array('message' => "Resultado obtenido $idGroup");
//
//    
    return $repositoriesArray;
}