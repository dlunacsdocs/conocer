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

require_once 'Log.php';

$Log = new Log();

echo $Log->Write("1", "root", "root");