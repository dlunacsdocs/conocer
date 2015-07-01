<?php
/*******************************************************************************
 *  Clase para buscar al usuario en la BD y acceso al sistema                  *
 *                                                                             *
 *******************************************************************************/
require_once 'DataBase.php';
require_once "Log.php";
require_once "XML.php";
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
        }
    }
    /*
     *  Se obtiene el listado de instancias de la BD y las devulve en un XML
     */
    private function getInstances()
    {
        $XML = new XML();
        $ListInstancias=  $this->getInstancesBD();
        if($ListInstancias['Estado']!=1)
        {
            $XML->ResponseXML("Error",0, $ListInstancias['Estado']);
            return;
        }
        
        $Instancias=$ListInstancias['Instancias'];
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement('Instancias');
        $doc->appendChild($root); 
        
        if($Instancias==0)
        {
            $Instancia=$doc->createElement("Instancia");
            $IdInstancia=$doc->createElement("IdInstancia",0);
            $Instancia->appendChild($IdInstancia);
            $NombreInstancia=$doc->createElement("NombreInstancia","No existen Instancias...");
            $Instancia->appendChild($NombreInstancia);  
            $root->appendChild($Instancia);
        }
        
        for ($cont=0;$cont<count($Instancias);$cont++)
        {
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
    
    private function getInstancesBD()
    {
        $estado=1;
        $instancias=0;
        $BD= new DataBase();
        $conexion=  $BD->Conexion();
        if (!$conexion) {
            $estado= mysql_error();            
            return $estado;
        }
       
        $sql="SELECT *FROM instancias";
        mysql_select_db("cs-docs",  $conexion);  
        $resultado=mysql_query($sql,  $conexion);
        if(!$resultado)
            {
                $estado= mysql_error();    
            }
            else
            {
                $instancias=array();
                 while($fila = mysql_fetch_assoc($resultado))
                {                     
                     $array=array("IdInstancia"=>$fila['IdInstancia'],"NombreInstancia"=>$fila['NombreInstancia']);
                     array_push($instancias,$array);
                }
                if($instancias==false)
                {
                    $instancias=0;
                }
            }
            
        mysql_close($conexion);
        $array_resultado=array("Estado"=>$estado, "Instancias"=>$instancias);
        return $array_resultado;
    }
    
    private function login()
    {
        $Log = new Log();        
        $XML = new XML();
        $bd = new DataBase();
        
        $user = filter_input(INPUT_POST, "UserName");
        $pass = filter_input(INPUT_POST, "Password");
        $DataBaseName = filter_input(INPUT_POST, "DataBaseName");
        $IdDataBase = filter_input(INPUT_POST, "IdDataBase");
        
        $ResultSelect = array();   
        
        if(strcasecmp($user, 'root')==0)
        {
            $SelectUsuario = "SELECT *FROM Usuarios WHERE Login COLLATE utf8_bin ='root' and Password COLLATE utf8_bin ='$pass'";      
            $ResultSelect = $bd ->ConsultaSelect("cs-docs", $SelectUsuario);
        }
        else
        {
            $SelectUsuario = "SELECT usu.IdUsuario, usu.Login, gc.IdGrupo, gu.Nombre FROM Usuarios usu 
            INNER JOIN GruposControl gc ON gc.IdUsuario=usu.IdUsuario
            LEFT JOIN GruposUsuario gu ON gu.IdGrupo = gc.IdGrupo
            WHERE usu.Login  COLLATE utf8_bin ='$user' AND usu.Password  COLLATE utf8_bin ='$pass' AND usu.estatus=1";
            $ResultSelect = $bd ->ConsultaSelect($DataBaseName, $SelectUsuario);
        }
                                                    
        if($ResultSelect['Estado']!=1)
        {
            $XML->ResponseXML("Error", 0, "<p><b>Error</b> de inicio de sesión.</p><br>Detalles:<br><p> ". $ResultSelect['Estado'] ."</p>");
            return;
        }
            
        if(count($ResultSelect['ArrayDatos'])===0)
            $Resultado=array("Login"=>0,"IdUsuario"=>-1, "IdGrupo"=>0, "Nombre"=>0);
        else
        $Resultado = $ResultSelect['ArrayDatos'][0];
        
        if(strcasecmp("root", $user)==0)
        {
            $Resultado['IdGrupo'] = 1;            
            $Resultado['Nombre'] = "Administradores";
        }

        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement('StartSession');
        $doc->appendChild($root); 
        $Login = $doc->createElement("Login",$Resultado['Login']);
        $root->appendChild($Login);
        $Estado=$doc->createElement("Estado",1);
        $root->appendChild($Estado);
        $Id=$doc->createElement("IdUsuario",$Resultado['IdUsuario']);        
        $root->appendChild($Id);                                
        $IdGrupo = $doc->createElement("IdGrupo",$Resultado['IdGrupo']);
        $root->appendChild($IdGrupo);
        $NombreGrupo = $doc->createElement("NombreGrupo",$Resultado['Nombre']);
        $root->appendChild($NombreGrupo);        
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
        
        if(!($IdDataBase>0))
            $DataBaseName = "NoDataBase";
        
         $Log->Write ("1", $Resultado['IdUsuario'], $user," '$user'", $DataBaseName);
    }    
}

$Login=new Login();
