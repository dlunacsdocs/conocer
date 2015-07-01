<?php
$RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */

$RutaXml = "$RoutFile/20051.xml";
$XsdPath = "$RoutFile/Configuracion/OtherSources/capture_5.0.4.xsd";
if(!file_exists($XsdPath))
    return;
else
    echo "<p>XSD existente</p>";
if(!file_exists($RutaXml))
{
    echo "<p>No existe el xml</p>";
    return;
}
else
    echo "<p>Xml existente</p>";

$xml = new DOMDocument(); 
libxml_use_internal_errors(true);
if(!($xml->load($RutaXml)))
{
    $Error='';
    $errors=libxml_get_errors();
    for ($aux=0;$aux<count($errors); $aux++) {
        // Aquí se manejan los errores} 

        $Error.=display_xml_error($errors[$aux]);
    }
}
if ($xml->schemaValidate($XsdPath))
{           
   $estado=1;
   echo "<p>XSD Válido</p>";
} 
else
{
/*********** Errores ocurridos al válidar el archivo se registran en el log **********/
    $Error='';
    $errors=libxml_get_errors();
    for ($aux=0;$aux<count($errors); $aux++) {
        // Aquí se manejan los errores} 

        $Error.= display_xml_error($errors[$aux]);
    }
    echo "<p>El archivo ".basename($RutaXml)." es inválido</p><p> $Error</p>";
}
libxml_clear_errors();   /* Se limpia buffer de errores */


$xml = simplexml_load_file($RutaXml);

$Children = ReadXml($xml);

for($cont = 0; $cont < count($Children); $cont++)
{
    echo "<p>".$Children[$cont]['level']." ".$Children[$cont]['name']." ".$Children[$cont]['value'] ."</p>";
}

function ReadXml(SimpleXMLElement  $xml)
{
    $node = array();
    if(count($xml->children())>0)
        $node = ReadXml($xml->children());

    foreach ($xml->children() as $tag => $value)
    {
        $node[] = $value->attributes();           
    }
    
    return $node;
}






/* Retorna los errores que ocurren durante la validación de un XML */
function display_xml_error($error)
{
    $return  = $error->line . "\n";
    $return .= str_repeat('-', $error->column) . "^\n";

    switch ($error->level) {
        case LIBXML_ERR_WARNING:
            $return .= "Warning $error->code: ";
            break;
         case LIBXML_ERR_ERROR:
            $return .= "Error $error->code: ";
            break;
        case LIBXML_ERR_FATAL:
            $return .= "Fatal Error $error->code: ";
            break;
    }

    $return .= trim($error->message) .
               "\n  Line: $error->line" .
               "\n  Column: $error->column";

    if ($error->file) {
        $return .= "\n  File: $error->file";
    }

    return "$return\n\n--------------------------------------------\n\n";
}