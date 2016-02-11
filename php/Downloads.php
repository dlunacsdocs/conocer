<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Downloads
 *
 * @author Daniel
 */
$RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */
require_once "$RoutFile/apis/pclzip/pclzip.lib.php";
require_once 'XML.php';
class Downloads {
    public function __construct() {
        $this->Ajax();
    }
    
    private function Ajax()
    {
        $option = filter_input(INPUT_POST, "option");
        switch ($option)
        {
            case 'Download':$this->Download(); break;            
        }
        
        switch (filter_input(INPUT_GET, "option"))
        {
            case 'DownloadZip':$this->DownloadZip();break; 
        }
        
    }
    
                        
    /* Se transforma el XML que se recibe en un Directorio único con todos
     *  Los comprobantes organizados por emisor y dentro de este todos los receptores */
    private function Download()
    {       

        $RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */

        $DataBaseName=  filter_input(INPUT_POST, "DataBaseName");
        $IdUsuario=filter_input(INPUT_POST, "IdUser");
        $UserName = filter_input(INPUT_POST, "UserName");

        $xmlDownload=  filter_input(INPUT_POST, "XmlDownload");
//        $PathPrincipal="Estructuras/".$DataBaseName."/";
               
       $xml=  simplexml_load_string($xmlDownload);
       $descargas=$xml->File;
       $carpeta_raiz="../Download/$UserName/";
       
       if(file_exists($carpeta_raiz))
       {
           system("rm -R $carpeta_raiz");
       }      
       
       if(!($ResulMkdir = mkdir($carpeta_raiz)))
       {
           XML::XMLReponse("Error", 1, "<p><b>Error</b> No puso ser creado el directorio de descargas del usuario $UserName</p>");
           return 0;
       }
       
       system("chmod 0777 -R $carpeta_raiz");
       
       foreach($descargas as $child)
        {
            $carpeta_destino=$carpeta_raiz.$child->Path;
            if(!file_exists($carpeta_destino))
            {
                if(!mkdir($carpeta_destino,0777,true))
                {
                    XML::XMLReponse("Error", 0, "<p>Error al construir el directorio ".dirname($carpeta_destino) ."</p>");
                    return 0;
                }
            }    
            if(file_exists($child->RutaArchivo))
            {
                if(!copy($child->RutaArchivo, $carpeta_destino.$child->NombreArchivo))
                {
                   echo "<p>error al mover a ".$carpeta_destino.$child->NombreArchivo."</p>";
                   return 0;
                }                                        
            }                                
        }
        
        if(!file_exists($carpeta_raiz))
        {
            XML::XMLReponse("Error", 0, "<p>No pudo ser creado el directorio raíz de la descarga</p>");
            return 0;
        }
        $zip = trim($carpeta_raiz,'/\n').".zip";

        $zipfile = new PclZip($zip);
	$v_list = $zipfile->create($carpeta_raiz,PCLZIP_OPT_REMOVE_PATH, $carpeta_raiz);
        
        if ($v_list == 0) {
    	die ("Error: " . $zipfile->errorInfo(true));/* Si ocurré algún error este se devuelve */
	}                

        $this->respuesta_descarga($zip);   
        $this->deleteDirectory($carpeta_raiz);
    }
    
    /* Se envia la respuesta después de comprimir el archivo XML
     * y se devuelve estao 1 en caso de éxito y 0 en caso de Falló
     * Junto con la ruta del archivo a descargar, ya que el archivo se 
     * descargará en otra página */
    private function respuesta_descarga($zip)
    {
        $XML=new XML();
        if(!file_exists($zip))
        {
            $XML->ResponseXML("Error", 0, "Error al intentar descargar el paquete. ");
            return;
        }
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;   
        $root = $doc->createElement('ResponseDownload');
        $doc->appendChild($root);
        $respuesta=$doc->createElement('Download');
        /* Si el archivo existe se envia respuesta positiva */

        $estado=$doc->createElement("Estado",'1');
        $mensaje=$doc->createElement('Mensaje','¡Se generó correctamente el archivo de descarga!'); 
        $nombre_zip=$doc->createElement('RutaZip',$zip);

        $respuesta->appendChild($estado);
        $respuesta->appendChild($mensaje);
        $respuesta->appendChild($nombre_zip);
        
        $root->appendChild($respuesta);
        
        header ("Content-Type:text/xml");
        echo $doc->saveXML();
    }
    
    /* Descarga de archivo comprimido ZIP */
    private function DownloadZip()
    {
        $path_zip=filter_input(INPUT_GET, "RutaZip");        
        if(!file_exists($path_zip)){return;}        
        $nombre_archivo=  basename($path_zip);
        header("Content-type: application/octet-stream");
	header("Content-disposition: attachment; filename=$nombre_archivo");
	readfile($path_zip);
//        unlink($path_zip);
    }
    
    private function deleteDirectory($dir)
    {
        if (!file_exists($dir)) {
            return true;
        }

        if (!is_dir($dir)) {
            return unlink($dir);
        }

        foreach (scandir($dir) as $item) {
            if ($item == '.' || $item == '..') {
                continue;
            }

            if (!$this->deleteDirectory($dir . DIRECTORY_SEPARATOR . $item)) {
                return false;
            }
        }

        return rmdir($dir);
    }
    
}

$Downloads = new Downloads();