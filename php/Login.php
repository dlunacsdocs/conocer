<?php
/*******************************************************************************
 *  Clase para buscar al usuario en la BD y acceso al sistema                  *
 *            
 *  @author daniel                                                                 *
 *******************************************************************************/
//require_once 'DataBase.php';
require_once "Log.php";
require_once "XML.php";
//require_once 'Usuarios.php';
require_once 'Session.php';

if(!isset($_SESSION))
    session_start();

$RoutFile = dirname(getcwd());

class Login {
    public function __construct() {
        
        $this->ajax();
    }
    
    private function ajax()
    {
        switch (filter_input(INPUT_POST, "opcion"))
        {
            case 'Login': $this->login(); break;
            case 'getInstances': $this->getInstances(); break;
            case 'checkSessionExistance': $this->checkSessionExistance(); break;
        }
    }
    
    private function checkSessionExistance()
    {
        $idSession = Session::getIdSession();
        
        if($idSession==null)
                return XML::XMLReponse ("widthOutSession", 0, "No existe sesión activa.");
        
        $userParameters = Session::getSessionParameters();
   
        $idInstance = $userParameters['idDataBase'];
        
        if(!((int) $idInstance > 0))
            $idInstance = 0;
        
        $sessionParameters = array('IdUsuario'=>$userParameters['idUser'] ,'Login'=>$userParameters['userName'], 
            'IdGrupo'=>$userParameters['idGroup'], 'Nombre'=>$userParameters['groupName'], 
            'idSession'=>$userParameters['idSession'], 'dataBaseName'=>$userParameters['dataBaseName'],
            'idDataBase'=>$idInstance);
        
        Session::$idSession = $userParameters['idSession'];
        
        $this->loginResponse($sessionParameters);
    }
    
    
    /*
     *  Se obtiene el listado de instancias de la BD y las devulve en un XML
     */
    private function getInstances()
    {   
        $db = new DataBase();
        
        $query = "SELECT *FROM instancias";
        
        $queryResult = $db->ConsultaSelect('cs-docs', $query);
        
        if($queryResult['Estado']!=1)
            return XML::XMLReponse("Error",0, $queryResult['Estado']);
        
        $Instancias=$queryResult['ArrayDatos'];
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement('Instancias');
        $doc->appendChild($root); 
        
        if(count($Instancias)==0){
            $Instancia=$doc->createElement("Instancia");
            $IdInstancia=$doc->createElement("IdInstancia",0);
            $Instancia->appendChild($IdInstancia);
            $NombreInstancia=$doc->createElement("NombreInstancia","No existen Instancias...");
            $Instancia->appendChild($NombreInstancia);  
            $root->appendChild($Instancia);
        }
        
        for ($cont=0;$cont<count($Instancias);$cont++){
            $Instancia=$doc->createElement("Instancia");
            $IdInstancia=$doc->createElement("IdInstancia",$Instancias[$cont]['IdInstancia']);
            $Instancia->appendChild($IdInstancia);
            $NombreInstancia=$doc->createElement("NombreInstancia",$Instancias[$cont]['NombreInstancia']);
            $Instancia->appendChild($NombreInstancia);  
            $root->appendChild($Instancia);
        }     
        
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
    }
    
    private function login()
    {        
        $RoutFile = dirname(getcwd());
        
        $user = trim(filter_input(INPUT_POST, "UserName"));
        $pass = trim(filter_input(INPUT_POST, "Password"));
        $DataBaseName = filter_input(INPUT_POST, "DataBaseName");
        $IdDataBase = filter_input(INPUT_POST, "IdDataBase");
        
        $idSession = Session::getIdSession();
//        var_dump($idSession);
        $ResultSelect = array();
        
        if(strlen($user)>0)
            $ResultSelect = $this->searchRegisterUser($DataBaseName, $user, $pass);
        
        if(!is_array($ResultSelect))
            return XML::XMLReponse("Error", 0, "<p><b>Error</b> de inicio de sesión.</p><br>Detalles:<br><p> ". $ResultSelect ."</p>");

            
        if(count($ResultSelect)===0)
            $Resultado=array("Login"=>0,"IdUsuario"=>-1, "IdGrupo"=>0, "Nombre"=>0, 'dataBaseName'=>$DataBaseName);
        else{
            $Resultado = $ResultSelect;
            
            DataBase::$dataBaseName = $DataBaseName;
            DataBase::$idDataBaseName = $IdDataBase;
            
            if(!($IdDataBase>0))
                $Resultado['dataBaseName'] = "NoDataBase";
            else
                $Resultado['dataBaseName'] = $DataBaseName;
        }
         
        
        $Resultado['idDataBase'] = $IdDataBase;
        
        if($Resultado['IdUsuario']>0 and file_exists("$RoutFile/web/Estructuras/$DataBaseName")){
//            if($idSession==null)
//                return XML::XMLReponse ("Error", 0, "Ya hay una sesión iniciada.");
            Session::$idSession = Session::createSession($IdDataBase ,$DataBaseName, 
                    $Resultado['IdUsuario'], $Resultado['Login'], $Resultado['IdGrupo'], $Resultado['Nombre']);
            
            Session::$idSession = Session::getIdSession(); 
        }
        else
            Session::$idSession = null;
            
        $this->loginResponse($Resultado);
    }
    
    private function loginResponse($Resultado)
    {                
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement('StartSession');
        $doc->appendChild($root); 
        $idInstance = $doc->createElement("idInstance", $Resultado['idDataBase']);
        $root->appendChild($idInstance);
        $instance = $doc->createElement("instanceName", $Resultado['dataBaseName']);
        $root->appendChild($instance);
        $Estado=$doc->createElement("Estado",1);
        $root->appendChild($Estado);
        $Login = $doc->createElement("Login",$Resultado['Login']);
        $root->appendChild($Login);
        $Id=$doc->createElement("IdUsuario",$Resultado['IdUsuario']);        
        $root->appendChild($Id);                                
        $IdGrupo = $doc->createElement("IdGrupo",$Resultado['IdGrupo']);
        $root->appendChild($IdGrupo);
        $NombreGrupo = $doc->createElement("NombreGrupo",$Resultado['Nombre']);
        $root->appendChild($NombreGrupo);     
        $xmlIdSession = $doc->createElement("idSession", Session::$idSession);
        $root->appendChild($xmlIdSession);
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
        
         Log::WriteEvent ("1", $Resultado['IdUsuario'], $Resultado['IdUsuario']," '". $Resultado['Login']."'", $Resultado['dataBaseName']);
    }
    
    public function searchRegisterUser($instanceName ,$userName, $password)
    {
        $RoutFile = dirname(getcwd());

        $bd = new DataBase();
        
        $ResultSelect = array();
        
        if(strcasecmp($userName, 'root')==0)
        {
            $SelectUsuario = "SELECT *FROM Usuarios WHERE Login COLLATE utf8_bin ='root' and Password COLLATE utf8_bin ='".md5(trim($password))."'";      
            
            $ResultSelect = $bd ->ConsultaSelect("cs-docs", $SelectUsuario);
        }
        else
        {
            $SelectUsuario = "SELECT usu.IdUsuario, usu.Login, gc.IdGrupo, gu.Nombre FROM Usuarios usu 
            INNER JOIN GruposControl gc ON gc.IdUsuario=usu.IdUsuario
            LEFT JOIN GruposUsuario gu ON gu.IdGrupo = gc.IdGrupo
            WHERE usu.Login  COLLATE utf8_bin ='$userName' AND usu.Password  COLLATE utf8_bin ='".md5(trim($password))."'";
            
            if(!file_exists("$RoutFile/web/Estructuras/$instanceName")){
                $ResultSelect['Estado'] = 1;
                $ResultSelect['ArrayDatos'] = array();
            }
            else
                $ResultSelect = $bd ->ConsultaSelect($instanceName, $SelectUsuario);
        }
        
        if($ResultSelect['Estado']!=1)
            return $ResultSelect['Estado'];
        
        if(count($ResultSelect['ArrayDatos'])>0){
            if(strcasecmp("root", $userName)==0)
            {
                $ResultSelect['ArrayDatos'][0]['IdGrupo'] = 1;            
                $ResultSelect['ArrayDatos'][0]['Nombre'] = "Administradores";
            }
            
            return $ResultSelect['ArrayDatos'][0];
        }
        else
            return array();
        
    }
    
    private function createUserSession($idUser, $userName, $dataBaseName)
    {
        $_SESSION[$dataBaseName]['idUser'] = $idUser;
        $_SESSION[$dataBaseName]['userName'] = $userName;
        $_SESSION[$dataBaseName]['dataBaseName'] = $dataBaseName;
        
        $sessionId = session_id();
        
        DataBase::$dataBaseName = $dataBaseName;
    }
}

$Login=new Login();
