<?php
/*
 *  Script que da de alta los web services para la interpolación de información
 *  con el sistema CSDocs.
 */



$RoutFile = dirname(getcwd());        

require_once("$RoutFile/apis/soap/lib/nusoap.php");

$server = new nusoap_server();

$server->configureWSDL('Servicios Web de CSDocs', 'urn:ecm');

/*******************************************************************************
 *                              INSTANCIAS                                     *
 *******************************************************************************/

// Parametros de Salida
$server->wsdl->addComplexType(  'instance', 
                                'complexType', 
                                'struct', 
                                'all', 
                                '',
                                array('idInstance'   => array('idSession' => 'mensaje','type' => 'xsd:integer'),
                                      'instanceName'   => array('idUser' => 'mensaje','type' => 'xsd:string')
                                )
);

$server->register(  'getInstances', // nombre del metodo o funcion
                    array('' => ''), // parametros de entrada
                    array('instance' => 'tns:instance'), // parametros de salida
                    'urn:ecm', // namespace
                    'urn:getInstances', // soapaction debe ir asociado al nombre del metodo
                    'rpc', // style
                    'encoded', // use
                    'Retorna el registro de instancias dadas de alta en el sistema' // documentation
);

/*******************************************************************************
 *                                  LOGIN                                      *
 *******************************************************************************/


// Parametros de entrada
$server->wsdl->addComplexType(  'loginRequest', 
                                'complexType', 
                                'struct', 
                                'all', 
                                '',
                                array('userName'   => array('name' => 'userName','type' => 'xsd:string'),
                                      'password'    => array('name' => 'password','type' => 'xsd:string')
                                )
);

// Parametros de Salida
$server->wsdl->addComplexType(  'loginReponse', 
                                'complexType', 
                                'struct', 
                                'all', 
                                '',
                                array('idSession'   => array('idSession' => 'mensaje','type' => 'xsd:string'),
                                      'idUser'   => array('idUser' => 'mensaje','type' => 'xsd:string'),
                                      'userName'   => array('userName' => 'mensaje','type' => 'xsd:string'),
                                      'message'   => array('userName' => 'mensaje','type' => 'xsd:string'),
                                )
);

$server->register(  'login', // nombre del metodo o funcion
                    array('loginRequest' => 'tns:loginRequest'), // parametros de entrada
                    array('return' => 'tns:loginReponse'), // parametros de salida
                    'urn:ecm', // namespace
                    'urn:login', // soapaction debe ir asociado al nombre del metodo
                    'rpc', // style
                    'encoded', // use
                    'Inicio de sesión dentro del sistema CSDocs' // documentation
);

function login($data)
{
    $userName = $data['userName'];
    $password = $data['password'];
    $msg = "Intento de inicio de sesión con el usuario $userName y el password $password";
    
    return array("message"=>$msg);
}

function getInstances()
{
    
    return array("instanceName"=>"Petición de instancias realizada");
}

$HTTP_RAW_POST_DATA = isset($HTTP_RAW_POST_DATA) ? $HTTP_RAW_POST_DATA : '';
$server->service($HTTP_RAW_POST_DATA);