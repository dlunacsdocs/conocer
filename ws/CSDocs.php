<?php

/*
 *  Script que da de alta los web services para la interpolación de información
 *  con el sistema CSDocs.
 */

ini_set('memory_limit', '-1');

$RoutFile = dirname(getcwd());        

require_once("$RoutFile/apis/soap/lib/nusoap.php");
require_once $RoutFile.'/apis/soap/lib/nusoapmime.php';

require_once("FunctionsWS.php");


session_start(); 
  
$server = new nusoapservermime();

$server->configureWSDL('Servicios Web de CSDocs', 'urn:ecm');

$server->soap_defencoding = 'UTF-8';
$server->decode_utf8 = false;
/*******************************************************************************
 *                                  LOGIN                                      *
 *******************************************************************************/


// Parametros de entrada
$server->wsdl->addComplexType(  'loginRequest', 
                                'complexType', 
                                'struct', 
                                'all', 
                                '',
                                array('idInstance' => array('name' => 'idInstance', 'type' => 'xsd:integer'),
                                      'instanceName' => array('name' => 'instanceName', 'type' => 'xsd:string'),
                                      'userName'   => array('name' => 'userName','type' => 'xsd:string'),
                                      'password'    => array('name' => 'password','type' => 'xsd:string')
                                )
);

// Parametros de Salida
$server->wsdl->addComplexType(  'loginReponse', 
                                'complexType', 
                                'struct', 
                                'all', 
                                '',
                                array('idSession'   => array('name' => 'idSession','type' => 'xsd:string'),
                                      'error'   => array('name' => 'error','type' => 'xsd:string'),
                                      'noAccess'   => array('name' => 'noAccess','type' => 'xsd:string'),
                                      'message'   => array('name' => 'message','type' => 'xsd:string')
                                )
);

$server->register(  'login', // nombre del metodo o funcion
                    array('loginRequest' => 'tns:loginRequest'), // parametros de entrada
                    array('loginReponse' => 'tns:loginReponse'), // parametros de salida
                    'urn:ecm', // namespace
                    'urn:login', // soapaction debe ir asociado al nombre del metodo
                    'rpc', // style
                    'encoded', // use
                    'Inicio de sesión dentro del sistema CSDocs' // documentation
);

/*******************************************************************************
 *                              INSTANCIAS                                     *
 *******************************************************************************/

// Parametros de Salida
$server->wsdl->addComplexType(  'instanceData', 
                                'complexType', 
                                'struct', 
                                'all', 
                                '',
                                array('idInstance'   => array('name' => 'idInstance','type' => 'xsd:integer'),
                                      'instanceName'   => array('name' => 'instanceName','type' => 'xsd:string'),
                                    'message' => array('name'=>'message', 'type'=>'xsd:string')
                                )
);

// Complex Array ++++++++++++++++++++++++++++++++++++++++++
$server->wsdl->addComplexType('instanceList',
                              'complexType',
                              'array',
                              '',
                              'SOAP-ENC:Array',
                              array(),
                              array(
                                  array(
                                      'ref' => 'SOAP-ENC:arrayType',
                                      'wsdl:arrayType' => 'tns:instanceData[]'
                                  )
                              ),
                              "tns:instanceData"
);

$server->register(  'getInstances', // nombre del metodo o funcion
                    array(), // parametros de entrada
                    array('instanceList' => 'tns:instanceList'), // parametros de salida
                    'urn:ecm', // namespace
                    'urn:getInstances', // soapaction debe ir asociado al nombre del metodo
                    'rpc', // style
                    'encoded', // use
                    'Retorna el registro de instancias dadas de alta en el sistema' // documentation
);

/*******************************************************************************
 *                                EMPRESAS                                     *
 *******************************************************************************/

// Parametros de entrada
$server->wsdl->addComplexType(  'enterpriseRequest', 
                                'complexType', 
                                'struct', 
                                'all', 
                                '',
                                array('idSession'   => array('name' => 'instanceName','type' => 'xsd:string'),
                                      'userName'   => array('name' => 'userName','type' => 'xsd:string') ,   
                                      'password'   => array('name' => 'password','type' => 'xsd:string') ,   
                                      'instanceName'   => array('name' => 'instanceName','type' => 'xsd:string')                                )
);

// Parametros de salida
$server->wsdl->addComplexType(  'enterpriseResponse', 
                                'complexType', 
                                'struct', 
                                'all', 
                                '',
                                array('idEnterprise'   => array('name' => 'userName','type' => 'xsd:integer'),
                                      'enterpriseName'    => array('name' => 'password','type' => 'xsd:string'),
                                      'enterpriseKey'    => array('name' => 'enterpriseKey','type' => 'xsd:string'),
                                      'error'    => array('name' => 'error','type' => 'xsd:string'),
                                      'message'    => array('name' => 'message','type' => 'xsd:string')
                                )
);

// Complex Array ++++++++++++++++++++++++++++++++++++++++++
$server->wsdl->addComplexType('enterpriseList',
                              'complexType',
                              'array',
                              '',
                              'SOAP-ENC:Array',
                              array(),
                              array(
                                  array(
                                      'ref' => 'SOAP-ENC:arrayType',
                                      'wsdl:arrayType' => 'tns:enterpriseResponse[]'
                                  )
                              ),
                              "tns:enterpriseResponse"
);

$server->register(  'getEnterprises', // nombre del metodo o funcion
                    array('enterpriseRequest' => 'tns:enterpriseRequest'), // parametros de entrada
                    array('enterpriseResponse' => 'tns:enterpriseList'), // parametros de salida
                    'urn:ecm', // namespace
                    'urn:getEnterprises', // soapaction debe ir asociado al nombre del metodo
                    'rpc', // style
                    'encoded', // use
                    'Retorna el listado de empresas asociadas a una instancia' // documentation
);

/*******************************************************************************
 *                                REPOSITORIOS                                 *
 *******************************************************************************/

// Parametros de entrada
$server->wsdl->addComplexType(  'repositoryRequest', 
                                'complexType', 
                                'struct', 
                                'all', 
                                '',
                                array('idSession'   => array('name' => 'idSession','type' => 'xsd:string'),
                                      'userName'   => array('name' => 'userName','type' => 'xsd:string') ,   
                                      'password'   => array('name' => 'password','type' => 'xsd:string') ,   
                                      'instanceName'   => array('name' => 'instanceName','type' => 'xsd:string'),
                                      'enterpriseKey'   => array('name' => 'enterpriseKey','type' => 'xsd:string'))
);

// Parametros de salida
$server->wsdl->addComplexType(  'repositoryResponse', 
                                'complexType', 
                                'struct', 
                                'all', 
                                '',
                                array('idEnterprise'   => array('name' => 'idEnterprise','type' => 'xsd:integer'),
                                      'idRepository'    => array('name' => 'idRepository','type' => 'xsd:integer'),
                                      'repositoryName'    => array('name' => 'repositoryName','type' => 'xsd:string'),
                                      'error'    => array('name' => 'error','type' => 'xsd:string'),
                                      'message'    => array('name' => 'message','type' => 'xsd:string')
                                )
);

// Complex Array ++++++++++++++++++++++++++++++++++++++++++
$server->wsdl->addComplexType('repositoryList',
                              'complexType',
                              'array',
                              '',
                              'SOAP-ENC:Array',
                              array(),
                              array(
                                  array(
                                      'ref' => 'SOAP-ENC:arrayType',
                                      'wsdl:arrayType' => 'tns:repositoryResponse[]'
                                  )
                              ),
                              "tns:repositoryResponse"
);

$server->register(  'getRepositories', // nombre del metodo o funcion
                    array('repositoryRequest' => 'tns:repositoryRequest'), // parametros de entrada
                    array('repositoryResponse' => 'tns:repositoryList'), // parametros de salida
                    'urn:ecm', // namespace
                    'urn:getRepositories', // soapaction debe ir asociado al nombre del metodo
                    'rpc', // style
                    'encoded', // use
                    'Retorna el listado de positorios relacionados a una empresa' // documentation
);

/*******************************************************************************
 *                                CATALOGOS                                    *
 *******************************************************************************/

// Parametros de entrada
$server->wsdl->addComplexType(  'catalogRequest', 
                                'complexType', 
                                'struct', 
                                'all', 
                                '',
                                array('idSession'   => array('name' => 'idSession','type' => 'xsd:string'),
                                      'userName'   => array('name' => 'userName','type' => 'xsd:string') ,   
                                      'password'   => array('name' => 'password','type' => 'xsd:string') ,   
                                      'instanceName'   => array('name' => 'instanceName','type' => 'xsd:string'),
                                      'repositoryName'   => array('name' => 'repositoryName','type' => 'xsd:string'))
);

// Parametros de salida
$server->wsdl->addComplexType(  'catalogResponse', 
                                'complexType', 
                                'struct', 
                                'all', 
                                '',
                                array('idCatalog'   => array('name' => 'idCatalog','type' => 'xsd:integer'),
                                      'catalogName'    => array('name' => 'catalogName','type' => 'xsd:String'),
                                      'error'    => array('name' => 'error','type' => 'xsd:string'),
                                      'message'    => array('name' => 'message','type' => 'xsd:string')
                                )
);

// Complex Array ++++++++++++++++++++++++++++++++++++++++++
$server->wsdl->addComplexType('catalogList',
                              'complexType',
                              'array',
                              '',
                              'SOAP-ENC:Array',
                              array(),
                              array(
                                  array(
                                      'ref' => 'SOAP-ENC:arrayType',
                                      'wsdl:arrayType' => 'tns:catalogResponse[]'
                                  )
                              ),
                              "tns:catalogResponse"
);

$server->register(  'getCatalogs', // nombre del metodo o funcion
                    array('catalogRequest' => 'tns:catalogRequest'), // parametros de entrada
                    array('catalogResponse' => 'tns:catalogList'), // parametros de salida
                    'urn:ecm', // namespace
                    'urn:getCatalogs', // soapaction debe ir asociado al nombre del metodo
                    'rpc', // style
                    'encoded', // use
                    'Retorna el listado de catálogos asociados a un repositorio' // documentation
);

/*******************************************************************************
 *                                    ÁRBOL                                    *
 *******************************************************************************/

// Parametros de entrada
$server->wsdl->addComplexType(  'requestTreeStructure', 
                                'complexType', 
                                'struct', 
                                'all', 
                                '',
                                array('idSession'   => array('name' => 'idSession','type' => 'xsd:string'),
                                      'userName'   => array('name' => 'userName','type' => 'xsd:string') ,   
                                      'password'   => array('name' => 'password','type' => 'xsd:string') ,   
                                      'instanceName'   => array('name' => 'instanceName','type' => 'xsd:string'),
                                      'repositoryName'   => array('name' => 'repositoryName','type' => 'xsd:string'))
);

// Parametros de salida
$server->wsdl->addComplexType(  'responseTreeStructure', 
                                'complexType', 
                                'struct', 
                                'all', 
                                '',
                                array('idDirectory'   => array('name' => 'idDirectory','type' => 'xsd:integer'),
                                      'idParent'   => array('name' => 'idParent','type' => 'xsd:integer'),
                                      'dirname'    => array('name' => 'dirname','type' => 'xsd:String'),
                                      'error'    => array('name' => 'error','type' => 'xsd:string'),
                                      'message'    => array('name' => 'message','type' => 'xsd:string')
                                )
);

// Complex Array ++++++++++++++++++++++++++++++++++++++++++
$server->wsdl->addComplexType('nodesTreeStructure',
                              'complexType',
                              'array',
                              '',
                              'SOAP-ENC:Array',
                              array(),
                              array(
                                  array(
                                      'ref' => 'SOAP-ENC:arrayType',
                                      'wsdl:arrayType' => 'tns:responseTreeStructure[]'
                                  )
                              ),
                              "tns:responseTreeStructure"
);

$server->register(  'getTreeStructure', // nombre del metodo o funcion
                    array('requestTreeStructure' => 'tns:requestTreeStructure'), // parametros de entrada
                    array('responseTreeStructure' => 'tns:nodesTreeStructure'), // parametros de salida
                    'urn:ecm', // namespace
                    'urn:getTreeStructure', // soapaction debe ir asociado al nombre del metodo
                    'rpc', // style
                    'encoded', // use
                    'Retorna la estructura de directorios de un repositorio' // documentation
);

/*******************************************************************************
 *                             GET STRUCTURE DETAIL                            *
 *******************************************************************************/

// Parametros de entrada
$server->wsdl->addComplexType(  'requestStructureDetails', 
                                'complexType', 
                                'struct', 
                                'all', 
                                '',
                                array('idSession'       => array('name' => 'idSession','type' => 'xsd:string'),
                                      'userName'        => array('name' => 'userName','type' => 'xsd:string') ,   
                                      'password'        => array('name' => 'password','type' => 'xsd:string') ,   
                                      'instanceName'    => array('name' => 'instanceName','type' => 'xsd:string'),
                                      'repositoryName'  => array('name' => 'repositoryName','type' => 'xsd:string'),
                                      'structureName'   => array('name' => 'structureName','type' => 'xsd:string'),
                                      'structureType'   => array('name' => 'structureType','type' => 'xsd:string'))
);

// Parametros de salida
$server->wsdl->addComplexType(  'responseStructureDetails', 
                                'complexType', 
                                'struct', 
                                'all', 
                                '',
                                array('fieldName'   => array('name' => 'fieldName','type' => 'xsd:string'),
                                      'fieldType'   => array('name' => 'fieldType','type' => 'xsd:string'),
                                      'fieldLenght'    => array('name' => 'fieldLenght','type' => 'xsd:string'),
                                      'requiredField'    => array('name' => 'requiredField','type' => 'xsd:string'),
                                      'error'    => array('name' => 'error','type' => 'xsd:string'),
                                      'message'    => array('name' => 'message','type' => 'xsd:string')
                                )
);

// Complex Array ++++++++++++++++++++++++++++++++++++++++++
$server->wsdl->addComplexType('structureFields',
                              'complexType',
                              'array',
                              '',
                              'SOAP-ENC:Array',
                              array(),
                              array(
                                  array(
                                      'ref' => 'SOAP-ENC:arrayType',
                                      'wsdl:arrayType' => 'tns:responseStructureDetails[]'
                                  )
                              ),
                              "tns:responseStructureDetails"
);

$server->register(  'getStructureDetails', // nombre del metodo o funcion
                    array('requestStructureDetails' => 'tns:requestStructureDetails'), // parametros de entrada
                    array('responseStructureDetails' => 'tns:structureFields'), // parametros de salida
                    'urn:ecm', // namespace
                    'urn:getStructureDetails', // soapaction debe ir asociado al nombre del metodo
                    'rpc', // style
                    'encoded', // use
                    'Retorna los campos que constituyen una empresa, repositorio o un catálogo' // documentation
);

/*******************************************************************************
 *                             GET CATALOG VALUES                              *
 *******************************************************************************/

// Parametros de entrada
$server->wsdl->addComplexType(  'requestCatalogValues', 
                                'complexType', 
                                'struct', 
                                'all', 
                                '',
                                array('idSession'       => array('name' => 'idSession','type' => 'xsd:string'),
                                      'userName'        => array('name' => 'userName','type' => 'xsd:string') ,   
                                      'password'        => array('name' => 'password','type' => 'xsd:string') ,   
                                      'instanceName'    => array('name' => 'instanceName','type' => 'xsd:string'),
                                      'repositoryName'  => array('name' => 'repositoryName','type' => 'xsd:string'),
                                      'catalogName'   => array('name' => 'catalogName','type' => 'xsd:string'))
);

// Parametros de salida
$server->wsdl->addComplexType(  'responseCatalogValues', 
                                'complexType', 
                                'struct', 
                                'all', 
                                '',
                                array('valuesRow'   => array('name' => 'valuesRow','type' => 'xsd:string'),
                                      'error'    => array('name' => 'error','type' => 'xsd:string'),
                                      'message'    => array('name' => 'message','type' => 'xsd:string')
                                )
);

// Complex Array ++++++++++++++++++++++++++++++++++++++++++
$server->wsdl->addComplexType('catalorRow',
                              'complexType',
                              'array',
                              '',
                              'SOAP-ENC:Array',
                              array(),
                              array(
                                  array(
                                      'ref' => 'SOAP-ENC:arrayType',
                                      'wsdl:arrayType' => 'tns:responseCatalogValues[]'
                                  )
                              ),
                              "tns:responseCatalogValues"
);

$server->register(  'getCatalogValues', // nombre del metodo o funcion
                    array('requestCatalogValues' => 'tns:requestCatalogValues'), // parametros de entrada
                    array('responseCatalogValues' => 'tns:catalorRow'), // parametros de salida
                    'urn:ecm', // namespace
                    'urn:getCatalogValues', // soapaction debe ir asociado al nombre del metodo
                    'rpc', // style
                    'encoded', // use
                    'Retorna los valores de un catálogo seleccionado, cada campo obtenido de la fila se devuelve separada por ||.' // documentation
);

/*******************************************************************************
 *                             UPLOAD DOCUMENT                                 *
 *******************************************************************************/

// Parametros de entrada
$server->wsdl->addComplexType(  'parametersUploadDocument', 
                                'complexType', 
                                'struct', 
                                'all', 
                                '',
                                array('idSession'       => array('name' => 'idSession','type' => 'xsd:string'),
                                      'userName'        => array('name' => 'userName','type' => 'xsd:string') ,   
                                      'password'        => array('name' => 'password','type' => 'xsd:string') ,   
                                      'instanceName'    => array('name' => 'instanceName','type' => 'xsd:string'),
                                      'repositoryName'  => array('name' => 'repositoryName','type' => 'xsd:string'),
                                      'fieldsChain'   => array('name' => 'fieldsChain','type' => 'xsd:string'),
                                      'valuesChain'   => array('name' => 'valuesChain','type' => 'xsd:string'),
                                      'documentLocation'        =>array('name'=>'documentLocation', 'type'=>'xsd:string'))
);

// Parametros de salida
$server->wsdl->addComplexType(  'outputUploadDocument', 
                                'complexType', 
                                'struct', 
                                'all', 
                                '',
                                array('error'       => array('name' => 'error','type' => 'xsd:string'),
                                      'message'     =>array('name'=>'message', 'type'=>'xsd:string'),
                                    'idDocument'    =>array('name'=>'idDocument', 'type'=>'xsd:integer'))
);

// Register the method to expose
    $server->register('uploadDocument',                                 // method
        array('parametersUploadDocument'=>'tns:parametersUploadDocument'),    // input parameters
        array('outputUploadDocument' => 'tns:outputUploadDocument'),                             // output parameters
        'urn:ecm',                                            // namespace
        'urn:uploadDocument',                                // soapaction
        'rpc',                                                       // style
        'encoded',                                                   // use
        'Carga de un documento a CSDocs'                                // documentation
    );


$HTTP_RAW_POST_DATA = isset($HTTP_RAW_POST_DATA) ? $HTTP_RAW_POST_DATA : '';
$server->service($HTTP_RAW_POST_DATA);