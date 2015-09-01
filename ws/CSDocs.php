<?php
/*
 *  Script que da de alta los web services para la interpolación de información
 *  con el sistema CSDocs.
 */



$RoutFile = dirname(getcwd());        

require_once("$RoutFile/apis/soap/lib/nusoap.php");
require_once("FunctionsWS.php");

session_start(); 
  
$server = new nusoap_server();

$server->configureWSDL('Servicios Web de CSDocs', 'urn:ecm');


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

$HTTP_RAW_POST_DATA = isset($HTTP_RAW_POST_DATA) ? $HTTP_RAW_POST_DATA : '';
$server->service($HTTP_RAW_POST_DATA);