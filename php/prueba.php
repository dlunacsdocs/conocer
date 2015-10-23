<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
//
//$gestor = fopen("/volume1/public/prueba.ini", "w+");
//        fwrite($gestor,"[Conexion]");
//        fwrite($gestor,"Usuario[] = ││ Daniel ││ Luna ││ González".PHP_EOL);
//        fwrite($gestor,"PAssword[] = ││ Daniel ││ Luna ││ González".PHP_EOL);
//        fclose($gestor);
//        
//        
//        var_dump( parse_ini_file ("/volume1/public/prueba.ini",true));

//include "../apis/PdfToText/pdf_readstream.php";
//
//$path = '../Estructuras/SICEIN/Creditos/1/161/163/4-Contrato-Credito-contructora-0002.pdf';
//
//$pdf = new pdf( $path );
//
//$pages = $pdf->get_pages();
//
//while( list($nr,$page) = each($pages) )
//{
//    list($width,$height) = $page->get_dimensions();
//    $text = $page->get_text();
//
//    echo "Page $nr is $width x $height and the text is:\n$text\n\n";
//}

//include('../apis/PdfToText/class.pdf2text.php');
//$a = new PDF2Text();
//$a->setFilename('../Estructuras/SICEIN/Creditos/1/161/163/4-Contrato-Credito-contructora-0002.pdf');
//$a->decodePDF();
//echo $a->output();

//echo date('d-m-Y h:i:s' );


//$formato = 'Y-m-d';
//$fecha = DateTime::createFromFormat($formato, '2009/07/21');
//echo "Formato: $formato; " . $fecha->format('Y-m-d H:i:s') . "\n";


$date = "2013/10/05";
$your_date = date("Y-m-d", strtotime($date));

echo $your_date."<br>";

$date = "01/30/2013";
$your_date = date("Y-m-d", strtotime($date));

echo $your_date."<br>";

$date = "2013-09-01";
$your_date = date("Y-m-d", strtotime($date));

echo $your_date."<br>";

$date = "09-07-2015";
$your_date = date("Y-m-d", strtotime($date));

echo $your_date."<br>";