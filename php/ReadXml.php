<?php
require_once 'DataBase.php';
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ReadXml
 *
 * @author daniel
 */
class ReadXml {
    public function __construct() {
        $this->read_xml();
    }
    /* Se válida el xml contra un esquema */
    private function validacion_xml($ruta_xml)
    {
        $estado=FALSE;
        $xml = new DOMDocument(); 
        $xml->load($ruta_xml);
        if ($xml->schemaValidate('../Configuracion/Esquema_CSDOCS1.0.xsd'))
        {           
           $estado=TRUE;
        } 
        
        return $estado;
    }
    private function read_xml()
    {
        $ruta_xml="../Esquema.xml";
        if(!file_exists($ruta_xml)){echo "No existe el archivo xml";return;}
        /* Se válida el xml */
        if((!$validacion=$this->validacion_xml($ruta_xml)))
        {echo "Archivo Invalido"; return;}
        
        $xml=  simplexml_load_file($ruta_xml);  
        /* Se obtiene  los nodos hijos */
        foreach ($xml->children() as $valor)
        {
//            printf("<p>".$valor->getName()."</p>");
            $array_nodos[]=$valor->getName();
        }
        
        $bd=new DataBase();
        
        
       /******************************* INSTANCIA BD *****************************/
        
//       $InstanciasBD=array_search("CrearInstanciaBD", $array_nodos);
        if(array_search('CrearInstanciaBD', $array_nodos)!==false)
        {            
            echo "<p>Encontrado InstanciasBD</p>";
            $child=$xml->CrearInstanciaBD->InstanciaBD;
            foreach ($child as $instancia)
            {
                printf ("<p>Creando instancia ".$instancia."</p>");
                $bd->CreateIntanciaDataBase($instancia);
            }
            
      
  
        }
        
        /******************************* EMPRESAS *****************************/
        if (array_search('EstructuraEmpresas', $array_nodos) !== false) {
            echo "<p>Encontrado CrearEstructuraEmpresas=" . count($xml->EstructuraEmpresas->CrearEstructuraEmpresa) . "</p>";
            $EstructuraEmpresa=$xml->EstructuraEmpresas->CrearEstructuraEmpresa;
            $bd->CrearEstructEmpresa($EstructuraEmpresa);
        }
        
        /**************************** INSERT EMPRESAS **************************/
        if (array_search('EstructuraEmpresas', $array_nodos) !== false) {
            echo "<p>Encontrado InsertEmpresas Peso=" . count($xml->EstructuraEmpresas->InsertEmpresa) . "</p>";
            $InsertEmpresas = $xml->EstructuraEmpresas->InsertEmpresa;
            $bd->insertar_empresa($InsertEmpresas);
        }


        /******************************* REPOSITORIOS *****************************/
        
        if(array_search('EstructuraRepositorio', $array_nodos)!==false)
        {
            echo "<p>Encontrado EstructuraRepositorio Peso =".count($xml->EstructuraRepositorio->CrearEstructuraRepositorio)."</p>";
            $detalle=array();
            
            /* Estrucutra Completa de CrearRepositorio */
            $Repositorio=$xml->EstructuraRepositorio->CrearEstructuraRepositorio;             
                                   
            /* Estructura para la creación del repositorio */                    
            $bd->crear_repositorio($Repositorio);
        }                                
        
        /******************************* CATALOGOS *****************************/
        
        if(array_search('Catalogos', $array_nodos)!==false)
        {
            $detalle_catalogo=array();
            echo "<p>Encontrado Catalogos Peso = ".count($xml->Catalogos->Catalogo)."</p>";
            
            
            $catalogos=$xml->Catalogos->Catalogo;
            if(count($catalogos)>0)
            {                
                $contador=0;
                foreach ($catalogos as $catalogo)
                {
                    $detalle=array("NombreCatalogo"=>$catalogo->NombreCatalogo, "Descripcion"=>$catalogo->Descripcion
                            );
                                 
                }
                
            }
            $bd->crear_catalogo($detalle_catalogo);
        }   
        
        /******************************* USUARIOS *****************************/
        
        if(array_search('EstructuraUsuarios', $array_nodos)!==false)
        {
            echo "<p>Encontrado CrearEstructuraUsuarios Peso = ".count($xml->EstructuraUsuarios->CrearEstructuraUsuario)."</p>";
            $StructUsuario=$xml->EstructuraUsuarios->CrearEstructuraUsuario;
            $bd->CrearStructUsuario($StructUsuario);
       
        }   
        
    }     
}

$read_xml=new ReadXml();