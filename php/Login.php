<?php
/*******************************************************************************
 *  Clase para buscar al usuario en la BD y acceso al sistema                  *
 *                                                                             *
 *******************************************************************************/
require_once 'DataBase.php';
require_once "Log.php";
require_once "XML.php";
require_once 'Usuarios.php';
require_once 'Session.php';

if(!isset($_SESSION))
    session_start();


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
   
        $sessionParameters = array('IdUsuario'=>$userParameters['idUser'] ,'Login'=>$userParameters['userName'], 
            'IdGrupo'=>$userParameters['idGroup'], 'Nombre'=>$userParameters['groupName'], 
            'idSession'=>$userParameters['idSession']);
        
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
        $user = filter_input(INPUT_POST, "UserName");
        $pass = filter_input(INPUT_POST, "Password");
        $DataBaseName = filter_input(INPUT_POST, "DataBaseName");
        $IdDataBase = filter_input(INPUT_POST, "IdDataBase");
        
        $idSession = Session::getIdSession();
//        var_dump($idSession);
        if($idSession!=null)
                return XML::XMLReponse ("Error", 0, "Ya hay una sesión iniciada.");
        
        $ResultSelect = $this->searchRegisterUser($DataBaseName, $user, $pass);
        
        if(!is_array($ResultSelect))
            return XML::XMLReponse("Error", 0, "<p><b>Error</b> de inicio de sesión.</p><br>Detalles:<br><p> ". $ResultSelect ."</p>");

            
        if(count($ResultSelect)===0)
            $Resultado=array("Login"=>0,"IdUsuario"=>-1, "IdGrupo"=>0, "Nombre"=>0);
        else{
            $Resultado = $ResultSelect[0];
            
            DataBase::$dataBaseName = $DataBaseName;
            DataBase::$idDataBaseName = $IdDataBase;
            
            if(!($IdDataBase>0))
                $Resultado['dataBaseName'] = "NoDataBase";
            else
                $Resultado['dataBaseName'] = $DataBaseName;
        }
        
        if(strcasecmp("root", $user)==0)
        {
            $Resultado['IdGrupo'] = 1;            
            $Resultado['Nombre'] = "Administradores";
        }
        
        if(isset($Resultado['IdUsuario']))
            Usuarios::$idUser = $Resultado['IdUsuario'];
        if(isset($Resultado['Login']))
            Usuarios::$userName = $Resultado['Login'];
        if(isset($Resultado['IdGrupo']))
            Usuarios::$idGroup = $Resultado['IdGrupo'];
        if(isset($Resultado['NombreGrupo']))
            Usuarios::$groupName = $Resultado['NombreGrupo'];
        
        if($Resultado['IdUsuario']>0)
            Session::$idSession = Session::createSession(DataBase::$dataBaseName ,DataBase::$dataBaseName, 
                    Usuarios::$idUser,  Usuarios::$userName, $Resultado['IdGrupo'], $Resultado['Nombre']);
      
        $this->loginResponse($Resultado);
    }
    
    private function loginResponse($Resultado)
    {                
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement('StartSession');
        $doc->appendChild($root); 
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
    
    private function searchRegisterUser($instanceName ,$userName, $password)
    {
        $bd = new DataBase();
        
        $ResultSelect = array();
        
        if(strcasecmp($userName, 'root')==0)
        {
            $SelectUsuario = "SELECT *FROM Usuarios WHERE Login COLLATE utf8_bin ='root' and Password COLLATE utf8_bin ='$password'";      
            
            $ResultSelect = $bd ->ConsultaSelect("cs-docs", $SelectUsuario);
        }
        else
        {
            $SelectUsuario = "SELECT usu.IdUsuario, usu.Login, gc.IdGrupo, gu.Nombre FROM Usuarios usu 
            INNER JOIN GruposControl gc ON gc.IdUsuario=usu.IdUsuario
            LEFT JOIN GruposUsuario gu ON gu.IdGrupo = gc.IdGrupo
            WHERE usu.Login  COLLATE utf8_bin ='$userName' AND usu.Password  COLLATE utf8_bin ='$password'";
            
            $ResultSelect = $bd ->ConsultaSelect($instanceName, $SelectUsuario);
        }
        
        if($ResultSelect['Estado']!=1)
            return $ResultSelect['Estado'];
        else
            return $ResultSelect['ArrayDatos'];
        
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
