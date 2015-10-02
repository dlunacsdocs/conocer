<?php

$RoutFile = dirname(getcwd());

require_once "$RoutFile/php/Session.php";
require_once("$RoutFile/php/DataBase.php");
require_once("$RoutFile/php/Enterprise.php");
require_once ("$RoutFile/php/Login.php");
require_once ("$RoutFile/php/Repository.php");
require_once ("$RoutFile/php/Catalog.php");
require_once ("$RoutFile/php/Tree.php");
require_once ("$RoutFile/php/DesignerForms.php");
require_once ("$RoutFile/php/Catalog.php");
require_once ("$RoutFile/php/ContentManagement.php");

function login($data) {
    if (!isset($_SESSION))
        session_start();

    $login = new Login();
    $session = new Session();
    $error = array();

    if (!isset($data['idInstance']))
        $error[] = array("error" => "idInstance no encontrado.");
    if (!isset($data['instanceName']))
        $error[] = array('error' => 'instanceName no encontrado.');
    if (!isset($data['userName']))
        $error[] = array('error' => 'userName no encontrado.');

    if (count($error) > 0)
        return $error;

    /* Se comprueba si existía una sesión activa  */
    $idSession = $session->getIdSession();

    $userData = array();

    if ($idSession != null) {
        $userData = $session->getSessionParameters();
    } else {
        $idInstance = $data['idInstance'];
        $instanceName = $data['instanceName'];
        $userName = $data['userName'];
        $password = $data['password'];

        $userData = $login->searchRegisterUser($instanceName, $userName, $password);
    }

    if (!is_array($userData))
        return array("error" => $userData);
    if (count($userData) == 0)
        return array("noAccess" => "Acceso denegado. Compruebe que tiene permisos para entrar al sistema al igual que su usuario o contraseña sean correctos");

    if (is_array($userData)) {
        $text = '';
        if (isset($userData['IdUsuario']))
            $text.= $userData['IdUsuario'];
        if (isset($userData['Login']))
            $text.= $userData['Login'];
        if (isset($userData['IdGrupo']))
            $text.= $userData['IdGrupo'];
        if (isset($userData['Nombre']))
            $text.= $userData['Nombre'];

        $idSession = $session->createSession($idInstance, $instanceName, $userData['IdUsuario'], $userData['Login'], $userData['IdGrupo'], $userData['Nombre']);
        return array('idSession' => $idSession);
    } else
        return array("error" => "Usuario o contraseña incorrectos");
}

function getInstances() {
    $DB = new DataBase();
    $data = array();

    $QueryInstances = "SELECT *FROM instancias";

    $ResultQuery = $DB->ConsultaSelect("cs-docs", $QueryInstances);

    if ($ResultQuery['Estado'] != 1) {
        $data[] = array("message" => "Error inesperado: " . $ResultQuery['Estado']);
        return $data;
    }

    if (count($ResultQuery['ArrayDatos']) == 0)
        $data[] = array("idInstance" => 0, "instanceName" => "No existen instancias");

    for ($cont = 0; $cont < count($ResultQuery['ArrayDatos']); $cont++) {

        $idInstance = $ResultQuery['ArrayDatos'][$cont]['IdInstancia'];
        $instanceName = $ResultQuery['ArrayDatos'][$cont]['NombreInstancia'];

        $data[] = array("idInstance" => $idInstance, "instanceName" => $instanceName);
    }

    return $data;
}

function getEnterprises($data) {
    $Enterprise = new Enterprise();
    $enterprisesArray = array();

    if (!isset($data['idSession']))
        $enterprisesArray[] = array("error" => "Parámetro idSession no encontrado");
    if (!isset($data['userName']))
        $enterprisesArray[] = array('error' => 'Parámetro userName no encontrado.');
    if (!isset($data['password']))
        $enterprisesArray[] = array('error' => 'Parámetro password no encontrado');
    if (!isset($data['instanceName']))
        $enterprisesArray[] = array('error' => 'Parámetro instanceName no encontrado.');

    if (count($enterprisesArray) > 0) {
        return $enterprisesArray;
    }

    $idSession = $data['idSession'];

    $enterprises = $Enterprise->getEnterprisesArray($data['instanceName']);

    session_id($idSession);

    if (!is_array($enterprises))
        return array("message" => $enterprises);

    for ($cont = 0; $cont < count($enterprises); $cont++) {
        $enterprisesArray[] = array("idEnterprise" => $enterprises[$cont]['IdEmpresa'],
            "enterpriseName" => $enterprises[$cont]['NombreEmpresa'],
            "enterpriseKey" => $enterprises[$cont]['ClaveEmpresa']);
    }

    return $enterprisesArray;
}

function getRepositories($data) {
    $repositoriesArray = array();

    if (!isset($data['idSession']))
        $repositoriesArray[] = array('error' => 'Párametro idSession no encontrado');
    if (!isset($data['userName']))
        $repositoriesArray[] = array('error' => 'Parámetro userName no encontrado.');
    if (!isset($data['password']))
        $repositoriesArray[] = array('error' => 'Parámetro password no encontrado');
    if (!isset($data['enterpriseKey']))
        $repositoriesArray[] = array('error' => 'Párametro enterpriseKey no encontrado');

    if (count($repositoriesArray) > 0)
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

    $userDetail = $Login->searchRegisterUser($instanceName, $userName, $password);



    if (!is_array($userDetail)) {
        $repositoriesArray[] = array("error" => "Error inesperado. $userDetail");
        return $repositoriesArray;
    } else if (!isset($userDetail['IdGrupo'])) {
        $repositoriesArray[] = array("message" => "Primer if");

        $repositoriesArray[] = array("error" => "No se encontrò al usuario en un grupo.");
    } else {
        $idGroup = $userDetail['IdGrupo'];
        $idUser = $userDetail['IdUsuario'];
        if ($idGroup > 0) {
            $repositories = $Repository->GetRepositoriesList($instanceName, $enterpriseKey, $idGroup, $idUser);
        } else
            $repositoriesArray[] = array("error" => "Id grupo no encontrado");
    }

    if (count($repositoriesArray) > 0)
        return $repositoriesArray;

    for ($cont = 0; $cont < count($repositories); $cont++) {
        $repositoriesArray[] = array('idRepository' => $repositories[$cont]['IdRepositorio'],
            'repositoryName' => $repositories[$cont]['NombreRepositorio']);
    }

    return $repositoriesArray;
}

function getCatalogs($data) {

    $Catalog = new Catalog();

    $catalogs = array();
    $error = array();

    if (!isset($data['idSession']))
        $error[] = array('error' => 'No se encontró el parámetro idSession');
    if (!isset($data['instanceName']))
        $error[] = array('error' => "No se encontró el parámetro instanceName");
    if (!isset($data['userName']))
        $error[] = array('error' => 'No se encontró el parámetro userName');
    if (!isset($data['password']))
        $error[] = array('error' => 'No se encontró el parámetro password');
    if (!isset($data['idRepository']))
        $error[] = array('error' => 'No se encontró el parámetro idRepository');

    if (count($error) > 0)
        return $error;

    $idRepository = $data['idRepository'];
    $instanceName = $data['instanceName'];

    $catalogRequest = $Catalog->getCatalogsArray($instanceName, $idRepository);

    if (!is_array($catalogRequest)) {
        $error[] = array('error' => $catalogRequest);
        return $error;
    }

    for ($cont = 0; $cont < count($catalogRequest); $cont++) {
        $catalogs[] = array('idCatalog' => $catalogRequest[$cont]['IdCatalogo'],
            'catalogName' => $catalogRequest[$cont]['NombreCatalogo']);
    }

    if (count($catalogs) == 0)
        $catalogs[] = array('idCatalog' => 0, 'catalogName' => 'No existen catálogos asociados al repositorio');

//    $catalogs[] = array("message"=>"catalogResponse WS ");
//    $catalogs[] = array('idCatalog'=>0, 'catalogName'=>'No existen catálogos asociados al repositorio');

    return $catalogs;
}

function getTreeStructure($data) {

    $error = array();
    $Tree = new Tree();
    $treeStructure = array();

    if (!isset($data['idSession']))
        $error[] = array('error' => 'No se encontró el parámetro idSession');
    if (!isset($data['instanceName']))
        $error[] = array('error' => "No se encontró el parámetro instanceName");
    if (!isset($data['userName']))
        $error[] = array('error' => 'No se encontró el parámetro userName');
    if (!isset($data['password']))
        $error[] = array('error' => 'No se encontró el parámetro password');
    if (!isset($data['repositoryName']))
        $error[] = array('error' => 'No se encontró el parámetro repositoryName');

    if (count($error) > 0)
        return $error;

    $instanceName = $data['instanceName'];
    $repositoryName = $data['repositoryName'];

    $directories = $Tree->getDirectoriesArray($instanceName, $repositoryName);

    if (!is_array($directories)) {
        $error[] = array('error' => 'Error inesperado. ' . $error);
        return $error;
    }

    for ($cont = 0; $cont < count($directories); $cont++) {
        $treeStructure[] = array('idDirectory' => $directories[$cont]['IdDirectory'],
            'idParent' => $directories[$cont]['parent_id'], 'dirname' => $directories[$cont]['title']);
    }

    return $treeStructure;
}

function newDirectory($data){
    
    $error = "";
    
    if (!isset($data['idSession']))
        $error.= 'No se encontró el parámetro idSession. ';
    if (!isset($data['instanceName']))
        $error.=  "No se encontró el parámetro instanceName. ";
    if (!isset($data['userName']))
        $error.= 'No se encontró el parámetro userName. ';
    if (!isset($data['password']))
        $error.= 'No se encontró el parámetro password. ';
    if (!isset($data['repositoryName']))
        $error.= 'No se encontró el parámetro repositoryName. ';
    if(!isset($data['directoryTitle']))
        $error.= "No se encontró el parámetro directoryTitle";
    if(!isset($data['directoryPath']))
        $error.= "No se encontró el parámetro directoryPath";
    
    if(strlen($error)>0)
        return array("error"=>$error);
    
    
    
    
    return array("message"=>"Saludando desde el WS NewDirectory");
}

function getStructureDetails($data) {

    $Designer = new DesignerForms();
    $error = array();
    $message = array();

    $properties = array();

    if (!isset($data['idSession']))
        $error[] = array('error' => 'No se encontró el parámetro idSession');
    if (!isset($data['instanceName']))
        $error[] = array('error' => "No se encontró el parámetro instanceName");
    if (!isset($data['userName']))
        $error[] = array('error' => 'No se encontró el parámetro userName');
    if (!isset($data['password']))
        $error[] = array('error' => 'No se encontró el parámetro password');
    if (!isset($data['repositoryName']))
        $error[] = array('error' => 'No se encontró el parámetro repositoryName');
    if (!isset($data['structureName']))
        $error[] = array('error' => 'No se encontró el parámetro structureName');
    if (!isset($data['structureType']))
        $error[] = array('error' => 'No se encontró el parámetro structureType');

    $instanceName = $data['instanceName'];
    $repositoryName = $data['repositoryName'];
    $structureType = $data['structureType'];
    $structureName = $data['structureName'];
    $unrecognisedStructureType = 0;
    $StructureDetail = array();

    switch ($structureType) {
        case 'catalog':
            $unrecognisedStructureType = 1;
            $message[] = array('message' => 'Devolviendo estructura de catálogo');
            $structureName = $repositoryName . "_" . $structureName;
        case 'repository':
            $unrecognisedStructureType = 1;
            $message[] = array('message' => 'Devolviendo estructura de repositorio');
    }

    if ($unrecognisedStructureType == 0)
        $error[] = array('error' => 'Estructura solicitada no reconocida');

    if (count($error) > 0)
        return $error;

    $generalStructure = $Designer->getArrayStructureFile($instanceName);

    if (!is_array($generalStructure)) {
        $error[] = array('error' => $generalStructure);
        return $error;
    }

    $structureProperties = $Designer->getPropertiesFromStructure($structureType, $generalStructure["$structureName"]);

    if (!is_array($structureProperties)) {
        $error[] = array('error' => $structureProperties);
        return $error;
    } else
        $structureProperties = $structureProperties['structure'];

    for ($cont = 0; $cont < count($structureProperties); $cont++) {

        $fieldLenght = 0;
        $requiredField = "false";

        if (isset($structureProperties[$cont]['long']))
            $fieldLenght = $structureProperties[$cont]['long'];

        if (isset($structureProperties[$cont]['required']))
            $requiredField = $structureProperties[$cont]['required'];

        $properties[] = array('fieldName' => $structureProperties[$cont]['name'],
            'fieldType' => $structureProperties[$cont]['type'],
            'fieldLenght' => $fieldLenght, 'requiredField' => $requiredField);
    }


    if (count($structureProperties) == 0)
        $properties[] = array('message' => 'No existen propiedades definidas para la estructura solicitada');

    return $properties;
}

function getCatalogValues($data) {
    $Catalog = new Catalog();

    $error = array();

    if (!isset($data['idSession']))
        $error[] = array('error' => 'No se encontró el parámetro idSession');
    if (!isset($data['instanceName']))
        $error[] = array('error' => "No se encontró el parámetro instanceName");
    if (!isset($data['userName']))
        $error[] = array('error' => 'No se encontró el parámetro userName');
    if (!isset($data['password']))
        $error[] = array('error' => 'No se encontró el parámetro password');
    if (!isset($data['repositoryName']))
        $error[] = array('error' => 'No se encontró el parámetro repositoryName');
    if (!isset($data['catalogName']))
        $error[] = array('error' => 'No se encontró el parámetro catalogName');

    if (count($error) > 0)
        return $error;

    $instanceName = $data['instanceName'];
    $repositoryName = $data['repositoryName'];
    $catalogName = $data['catalogName'];
    $valuesRow = array();

    $catalogValues = $Catalog->getCatalogRecords($instanceName, $repositoryName, $catalogName);

    if (!is_array($catalogValues)) {
        $error[] = array('error' => $catalogValues);
        return $error;
    }

    for ($cont = 0; $cont < count($catalogValues); $cont++) {
        $valuesRow[] = array('valuesRow' => implode('||', $catalogValues[$cont]));
    }

    if (count($valuesRow) == 0)
        $valuesRow[] = array('message' => 'No se encontraron valores en el catálogo ' . $catalogName);

    return $valuesRow;
}

/*------------------------------------------------------------------------------
 * Método implementado por NuSoap para cargar un documento a CSDocs
 ------------------------------------------------------------------------------*/

function uploadDocument($data) {
    $error = "";
    
    if (!isset($data['idSession']))
        $error.= 'No se encontró el parámetro idSession. ';
    if (!isset($data['instanceName']))
        $error.=  "No se encontró el parámetro instanceName. ";
    if (!isset($data['userName']))
        $error.= 'No se encontró el parámetro userName. ';
    if (!isset($data['password']))
        $error.= 'No se encontró el parámetro password. ';
    if (!isset($data['repositoryName']))
        $error.= 'No se encontró el parámetro repositoryName. ';
    if (!isset($data['documentLocation']))
        $error.= 'No se encontró el parámetro documentLocation. ';
    if (!isset($data['fieldsChain']))
        $error.= 'No se encontró el parámetro fieldsChain. ';
    if (!isset($data['valuesChain']))
        $error.= 'No se encontró el parámetro valuesChain. ';

    if(strlen($error)>0)
        return array("error"=>$error);
    
    $server = $GLOBALS['server'];
    $Catalog = new Catalog();
    $Designer = new DesignerForms();
    $DB = new DataBase();

    $instanceName = $data['instanceName'];
    $repositoryName = $data['repositoryName'];
    $fieldsBlock = explode("||", $data['fieldsChain']);
    $fields = array();
    $valuesBlock = explode('||', $data['valuesChain']);
    $fieldsChain = "";
    $valuesChain = "";
    $RoutFile = dirname(getcwd());
    $Full = "";
    $location = "$RoutFile/Estructuras/$instanceName/$repositoryName/" . $data['documentLocation'];                               // Mention where to upload the file
    $pathDocumentDB = "Estructuras/$instanceName/$repositoryName/" . $data['documentLocation'];
    $fileName = basename($data['documentLocation']);
    $idDirectory = basename(dirname($location));
    $enterpriseKey = 0;
    $userName = $data['userName'];
    $extension = $extension = pathinfo(basename($location), PATHINFO_EXTENSION);
    $idEnterprise = 0;
    $idRepository = 0;
    $attachments = $server->getAttachments();

    if(!file_exists($RoutFile."/Estructuras/$instanceName"))
        return array("error"=>"No existe la instancia $instanceName en el sistema");
    
    if(!file_exists("$RoutFile/Estructuras/$instanceName/$repositoryName"))
        return array("error"=>"No existe el repositorio $repositoryName en el sistema");

    if (!file_exists(dirname($location)))
        return array("error" => "El destino del documento " . dirname($data['documentLocation']) . " no existe",
            "message" => "Confirme que la ruta la ha generado correctamente a partir del árbol del directorios"
            . " del repositorio $repositoryName");

    if (count($fieldsBlock) != count($valuesBlock))
        return array("error" => "No coincide el número de campos con el número de valores " . count($fieldsBlock) . " " . count($valuesBlock));

    for ($cont = 0; $cont < count($fieldsBlock); $cont++) {
        $fields[$fieldsBlock[$cont]] = $valuesBlock[$cont];
    }


    if (count($attachments) == 0)
        return array("error" => "No se encontraron attachments", "message" => "El sistema no detecta ningún documento adjunto");

    $catalogs = $Catalog->getArrayCatalogsNames($instanceName, 0, $repositoryName);

    IF (!is_array($catalogs))
        return array("error" => "Error al recuperar los catálogos ligados al repositorio $repositoryName. $catalogs");

    if (!file_exists("$RoutFile/Configuracion/$instanceName.ini"))
        return array("error" => "No existe el registro de estructura de la instancia $instanceName");

    $EstructuraConfig = parse_ini_file("$RoutFile/Configuracion/$instanceName.ini", true);

    $ArrayStructureUser = $Designer->ReturnStructure($repositoryName, $EstructuraConfig[$repositoryName]);

    if (!is_array($ArrayStructureUser))
        return array("error" => "No se obtuvo el registro de estructura del repositorio $repositoryName");

    /***************************************************************************
     *  Se analiza cada campo y se realiza el MATCH con el registro de estructura
     ***************************************************************************/

    for ($cont = 0; $cont < count($ArrayStructureUser); $cont++) {
        $Field = preg_replace('/\s+/', ' ', $ArrayStructureUser[$cont]['name']);
        $type = $ArrayStructureUser[$cont]['type'];

        if (isset($fields[$Field])) {
            $valor = trim($fields[$Field]);

            if (isset($ArrayStructureUser[$cont]['required']))
                if (strlen($valor) == 0 and ( strcasecmp($ArrayStructureUser[$cont]['required'], 'true') == 0))
                    return array("error" => "El campo $Field es obligatorio",
                        "message" => "El campo $Field no puede quedar vacio");

            if (strcasecmp($type, "INT") == 0 or strcasecmp($type, "FLOAT") == 0 or strcasecmp($type, "INTEGER") == 0 or strcasecmp($type, "DOUBLE") == 0) /* Si detecta un tipo numerico */ {

                if (intval($valor) != 0)
                    $valuesChain.=$valor . ",";
                else
                    $valuesChain.=" 0,";
            } else if (strcasecmp($type, "datetime") == 0) {
                if(strlen($valor)>0)
                    if (!validateDate($valor, "Y-d-m H:i:s") and !validateDate($valor, "Y/d/m H:i:s")
                            and ! validateDate($valor, "d-m-Y H:i:s") and !validateDate($valor, "m/d/Y H:i:s"))
                        return array("error" => "La fecha especificada en el campo $Field es incorrecta",
                            "message" => "La fecha puede ser incongruente o el formato no es válido Y-d-m H:i:s, "
                            . "Y/d/m H:i:s, d-m-Y H:i:s ó m/d/Y H:i:s");

                $date = "$valor";
                $newDate = date("Y-m-d H:i:s", strtotime($date));
+               $valor = $newDate;
                $valuesChain.="'" . $valor . "'" . ",";
            } else if (strcasecmp($type, "date") == 0) {
                if(strlen($valor)>0)
                    if (!validateDate($valor, "Y-d-m") and !validateDate($valor, "Y/m/d") and 
                            !validateDate($valor, "d-m-Y") and !validateDate($valor, "m/d/Y"))
                        return array("error" => "La fecha especificada en el campo $Field es incorrecta",
                            "message" => "La fecha puede ser incongruente o el formato no es válido Y-m-d, Y/m/d,"
                            . " d-m-Y ó m/d/Y");
                
                $date = "$valor";
                $newDate = date("Y-m-d", strtotime($date));
+                $valor = $newDate;
                $valuesChain.="'" . $valor . "'" . ",";
            } else /* TEXT, VARCHAR */
                $valuesChain.="'" . $valor . "'" . ",";

            $Full.=$valor . " , ";
            $fieldsChain.=$Field . ",";
        } else
            return array("error" => "No existe el Campo $Field", "message" => "Debe ser "
                . "agregado el campo $Field en la cadena de campos y en la de valores");
    }

    /* --------------------    Match con los catálogos ------------------------- */

    for ($cont = 0; $cont < count($catalogs); $cont++) {
        $catalogName = $catalogs[$cont]['NombreCatalogo'];

        if (!isset($fields[$catalogName]))
            return array("error" => "No existe el catálogo " . $catalogName,
                "message" => "Debe anexar el catálogo $catalogName a la "
                . "cadena de campos y a la de valores");

        $idCatalogOption = $fields[$catalogName];

        if (!is_numeric($idCatalogOption))
            return array("error" => "El valor del catálogo $catalogName debe ser numérico");

        $fieldsChain.=$catalogName . ",";
        $valuesChain.=$fields[$catalogName] . ",";

        $catalogRecords = $Catalog->getCatalogRecords($instanceName, $repositoryName, $catalogName, $idCatalogOption);

        if (!is_array($catalogRecords))
            return array("error" => "Error interno al intentar recuperar el contenido del catálogo $catalogName");

        for ($cont = 0; $cont < count($catalogRecords); $cont++) {
            $Full.=" " . implode(", ", $catalogRecords[$cont]);
        }
    }

    if (count($catalogs) > 0) {
        $idEnterprise = $catalogs[0]['IdEmpresa'];
        $idRepository = $catalogs[0]['IdRepositorio'];
        $enterpriseKey = $catalogs[0]['ClaveEmpresa'];
    } else {

        $Repository = new Repository();
        $EnterpriseRepositoryDetail = $Repository->getEnterprisesAndRepositoriesDetail($instanceName, $repositoryName);
        if (!is_array($EnterpriseRepositoryDetail))
            return array("error" => "Error interno. No fué posible recuperar el detalle del repositorio y la empresa.");

        if (count($EnterpriseRepositoryDetail) == 0)
            return array("error" => "El repositorio $repositoryName no cuenta con una empresa de relación");

        $idEnterprise = $EnterpriseRepositoryDetail[0]['IdEmpresa'];
        $idRepository = $EnterpriseRepositoryDetail[0]['IdRepositorio'];
        $enterpriseKey = $EnterpriseRepositoryDetail[0]['ClaveEmpresa'];
    }
    
    /***************************************************************************
     *  Almacenamiento fisico y lógico del documento
     ***************************************************************************/
    
    $documentData = $attachments[0]['data'];

    
    if (file_exists($location)) {
        $location = ContentManagement::RenameFile($location);
        $pathDocumentDB = dirname($pathDocumentDB) . "/" . basename($location);
        $fileName = basename($location);
    }

    file_put_contents($location, $documentData);
    
    $myFormatForView = date("Y-m-d H:i:s");
    
    $Full.=" $userName, $extension, $myFormatForView, $fileName";
    $fieldsChain.="idDirectory, IdEmpresa, TipoArchivo, RutaArchivo, UsuarioPublicador, FechaIngreso, NombreArchivo, Full";
    $valuesChain.= "$idDirectory , $idEnterprise, '$extension', '$pathDocumentDB', '$userName', '$myFormatForView', '$fileName', '$Full'";

    $insertIntoRepositorio = "INSERT INTO $repositoryName ($fieldsChain) VALUES ($valuesChain)";

    if (!(($idDocument = $DB->ConsultaInsertReturnId($instanceName, $insertIntoRepositorio)) > 0)){
        if(file_exists($location))
            unlink($location);
        return array("error" => "1: Error de consulta, no pudo cargarse el documento");
    }

    $insertIntoGlobal = "INSERT INTO RepositorioGlobal "
            . "(IdFile, IdEmpresa, IdRepositorio, IdDirectory, NombreEmpresa,"
            . "NombreRepositorio, NombreArchivo, TipoArchivo, RutaArchivo, UsuarioPublicador,"
            . "FechaIngreso, Full) VALUES ($idDocument, $idEnterprise, $idRepository,"
            . "$idDirectory, '$enterpriseKey', '$repositoryName', '$fileName', "
            . "'$extension', '$pathDocumentDB', '$userName', '$myFormatForView', '$Full')";

    if (!(($idGlobal = $DB->ConsultaInsertReturnId($instanceName, $insertIntoGlobal)) > 0)){
        if(file_exists($location))
            unlink($location);
        
        $DeleteFromRepository = "DELETE FROM $instanceName"."_"."$repositoryName WHERE IdRepositorio = $idDocument";
        $DB->ConsultaQuery($instanceName, $DeleteFromRepository);
        return array("error" => "2: Error al ingresar el documento a Global");
    }

    return array("idDocument" => "$idDocument", "message" => "$myFormatForView Documento $fileName almacenado con éxito en el repositorio $repositoryName ");
}

function validateDate($date, $format = 'Y-m-d H:i:s') {
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) == $date;
}
