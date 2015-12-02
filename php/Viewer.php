<?php
require_once 'Session.php';
require_once 'DataBase.php';
require_once 'XML.php';
/**
 * Realiza las conversiones pertinentes de distintos documentos para poder 
 * observar su vista prevía en el visor de imágenes del cliente CSDocs.
 *
 * @author daniel
 */

$RoutFile = dirname(getcwd());        

class Viewer {
    public function __construct() {
        $this->Ajax();
    }

    private function Ajax()
    {
        if(filter_input(INPUT_POST, "option")!=NULL and filter_input(INPUT_POST, "option")!=FALSE){
            
            $idSession = Session::getIdSession();
        
            if($idSession == null)
                return XML::XMLReponse ("Error", 0, "Viewer::No existe una sesión activa, por favor vuelva a iniciar sesión");

            $userData = Session::getSessionParameters();
            
            switch (filter_input(INPUT_POST, "option"))
            {
                case 'imageProcessingToConvert': $this->imageProcessingToConvert($userData); break;
            }
        }
    }
    
    private function imageProcessingToConvert($userData){
        $functionToExecute = filter_input(INPUT_POST, "functionToExecute");
        $filePath = filter_input(INPUT_POST, "filePath");
        
        if(method_exists("Viewer", $functionToExecute))
            $this->$functionToExecute($userData, $filePath);
        else
            echo ("No existe la función para procesar el tipo de imagen. $functionToExecute()");
    }
    
    private function processTif($userData, $filePath){
        
        $dataBaseName = $userData['dataBaseName'];
        $userName = $userData['userName'];
        $RoutFile = dirname(getcwd());        
        
        $nameWithoutExt = pathinfo($filePath, PATHINFO_FILENAME);
        $tempPath = "$RoutFile/Estructuras/_TEMP_FILES_/$dataBaseName/$userName/$nameWithoutExt.jpg";
        $tempPathToClient = "../Estructuras/_TEMP_FILES_/$dataBaseName/$userName/$nameWithoutExt.jpg";

        $output = array();
        
        if(!file_exists(dirname($tempPath)))
            if(!($TempDirCreationResult = mkdir(dirname($tempPath), 0777, true)))
                    return XML::XMLReponse ("Error", 0, "<p><b>Error</b> no pudo "
                            . "ser creado el directorio temporal</p>Detalles:<br>$TempDirCreationResult");
        
        if(file_exists($tempPath))
            unlink ($tempPath);
        
        if(!file_exists($filePath))
            return XML::XMLReponse("Error", 0, "<p><b>Error</b> no existe el documento a procesar</p>");
                        
        $exec = "convert $filePath -units PixelsPerInch -density 72 -quality 60 -resize 535 $tempPath";
          
        exec($exec, $output);
        
        if(count($output) > 0)
            return XML::XMLReponse ("Error", 0, "Resultado del procesamiento del documento tif. ". implode(",",$output));
                    
        
        if(!file_exists($tempPath))
            return XML::XMLReponse ("Error", 0, "No se ha creado el documento temporal");
        
        $doc  = new DOMDocument('1.0','utf-8');
        libxml_use_internal_errors(true);
        $doc->formatOutput = true;
        $root = $doc->createElement("tempPath", $tempPathToClient);
        $doc->appendChild($root); 
        header ("Content-Type:text/xml");
        echo $doc->saveXML();

    }
    
}

$Viewer = new Viewer();