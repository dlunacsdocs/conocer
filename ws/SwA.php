<?php 
ini_set('memory_limit', '-1');

$RoutFile = dirname(getcwd());	

require_once $RoutFile.'/apis/soap/lib/nusoap.php';
require_once $RoutFile.'/apis/soap/lib/nusoapmime.php';

$server = new nusoapservermime();
$server->configureWSDL('Servicios Web de CSDocs', 'urn:ecm');
$server->soap_defencoding = 'UTF-8';
$server->decode_utf8 = false;

$server->wsdl->addComplexType('requestMime', 'complexType', 'struct', 'all', '', array('greeting' => array('name' => 'greeting', 'type' => 'xsd:string'),
    'mimeText' => array('name' => 'mimeText', 'type' => 'xsd:string')
        )
);

$server->register('mime', // method
        array('requestMime' => 'tns:requestMime'), // input parameters              
        array('response' => 'xsd:string'), // output parameters
        'urn:ecm', // namespace
        'urn:mime', // soapaction
        'rpc', // style
        'encoded', // use
        'Carga de un documento a CSDocs'                                // documentation
);


$HTTP_RAW_POST_DATA =  isset($HTTP_RAW_POST_DATA) ? $HTTP_RAW_POST_DATA : '';
$server->service($HTTP_RAW_POST_DATA);

function mime($data) {
    global $server;
    $RoutFile = dirname(getcwd());       

    $attachments = $server->getAttachments();
    $outPut = "Me enviaste  ".  count($attachments)." attachments ";
    
    foreach ($attachments as $attach){
        $outPut.=$attach['filename']." ".$attach['contenttype']." encode: ".mb_detect_encoding($attach['data'])." ";
        
        
        file_put_contents("$RoutFile/Estructuras/MIME.pdf", $attach['data']);
        
        if($attach['data']->encoding == 3) { // 3 = BASE64
            $outPut.=" encoding 3";
//            $attachments[$i]['attachment'] = base64_decode($attachments[$i]['attachment']);
        }
        else if($attach['data']->encoding == 4) { // 4 = QUOTED-PRINTABLE
            $outPut.=" encoding 4";
//            $attachments[$i]['attachment'] = quoted_printable_decode($attachments[$i]['attachment']);
        }
        else
        {
            $outPut.=" No se reconocé el encoding";
        }
         
    }
    
    return $outPut;
}