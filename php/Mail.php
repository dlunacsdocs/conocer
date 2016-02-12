<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Mail
 *
 * @author daniel
 */

require_once 'DataBase.php';
require_once 'XML.php';
require_once 'DesignerForms.php';
require_once  '../apis/PHPMailer/class.phpmailer.php';
class Mail {
    
    function Ajax()
    {
        switch (filter_input(INPUT_POST, "opcion"))
        {
            case 'CheckMail': $this->CheckMail(); break;
            case 'AddNewAccount': $this->AddNewAccount(); break;
            case 'ListAccounts': $this->ListAccounts(); break;
            case 'DownloadFromAccount':$this->DownloadFromAccount(); break;
        }
    }
    
    private function AddNewAccount()
    {
        $XML=new XML();
        $BD= new DataBase();
        $designer=new DesignerForms();
        $DataBaseName=  filter_input(INPUT_POST, "DataBaseName");
        $IdUsuario=filter_input(INPUT_POST, "IdUsuario");
        $nombre_usuario=  filter_input(INPUT_POST, "nombre_usuario");    
        $Password=  filter_input(INPUT_POST, "Password");
        $NombreMostrar=  filter_input(INPUT_POST, "NombreMostrar");                
        $NombreCuenta=filter_input(INPUT_POST, "NombreCuenta");
        
        
        $Servidor="gmail";
        $Auth=1;
        /* Solo gmail */
        $puerto=993;
        $host='imap.gmail.com';    
        $Seguridad="ssl";
        $ruta_imap="{".$host.":".$puerto."/imap/ssl/novalidate-cert}INBOX";  
        $imap=  $this->conexion_imap($ruta_imap, $NombreCuenta, $Password);
        if(!$imap){$XML->ResponseXML("Error", 0, $imap); return;}
                     
        $q="INSERT INTO Correos (NombreCuenta, Password, Servidor, Smtp, Seguridad, Auth, TituloMostrar, Puerto, HostImap)
            VALUES ('$NombreCuenta','$Password', '$Servidor', 'smtp.gmail.com', '$Seguridad',$Auth,'$NombreMostrar',$puerto,'$ruta_imap')";
        
        $ResultadoInsert=$BD->ConsultaInsertReturnId($DataBaseName, $q);
        if($ResultadoInsert>0)
        {
            /*  Devolución de repuesta en XML */
                $doc  = new DOMDocument('1.0','utf-8');
                $doc->formatOutput = true;
                $root = $doc->createElement("AddNewAccount");
                $doc->appendChild($root); 
                $IdCuenta=$doc->createElement("IdCuenta",$ResultadoInsert);
                $root->appendChild($IdCuenta);
                $XmlNombreCuenta=$doc->createElement("NombreCuenta",$NombreCuenta);
                $root->appendChild($XmlNombreCuenta);                
                $XmlEstado=$doc->createElement("Estado",1);
                $root->appendChild($XmlEstado);
                $XmlMensaje=$doc->createElement("Mensaje","Cuenta <b>$NombreCuenta</b> agregada con éxito  ");
                $root->appendChild($XmlMensaje);
                header ("Content-Type:text/xml");
                echo $doc->saveXML();
        }
        else
        {
            $XML->ResponseXML("Error", 0, $ResultadoInsert);
        }
        
//        $resultado = mysql_query($q);
//        return $ultimo_id;
    }
    /* Obtiene el listado de cuentas de correo disponibles para el usuario */
    
    private function ListAccounts()
    {
        $XML=new XML();
        $BD= new DataBase();
        $designer=new DesignerForms();
        $DataBaseName=  filter_input(INPUT_POST, "DataBaseName");
        $IdUsuario=filter_input(INPUT_POST, "IdUsuario");
        $nombre_usuario=  filter_input(INPUT_POST, "nombre_usuario");  
        
        $ListAccounts="SELECT * FROM Correos WHERE IdUsuario = $IdUsuario";
        $ResultadoConsulta=$BD->ConsultaSelect($DataBaseName, $ListAccounts);
        
        if($ResultadoConsulta['Estado'])
        {
            $XML->ResponseXmlFromArray("ListMails", "Mail", $ResultadoConsulta['ArrayDatos']);
        }
        else
        {
            $XML->ResponseXML("Error", 0, $ResultadoConsulta['Estado']);
        }
    }
    
    /* Comprueba si los datos para IMAP son correctos */
    private function conexion_imap($ruta_imap,  $usuario, $password)
    {
        /* Datos devueltos por default */
        $estado=1;
        if(($mbox = imap_open ($ruta_imap,  $usuario, $password)))
        {
             imap_close($mbox);             
        }
        else
        {
            $estado="Ocurrió el siguiente error. ".imap_last_error().". <p>Revise que sus datos sean correctos</p>";  
        }
                
        return $estado;
    }
    
    
    /*
     * Parametros: Array con datos para conexión IMAP de una cuenta de correo
     * Return: 1 = Éxito
     *         0 = Error
     */
    
    private function CheckMail(array $mail)
    {
        $estado=1;
        
        var_dump($_POST);
        
        return $estado;
    }
    
    private function DownloadFromAccount()
    {
        $XML=new XML();
        $BD= new DataBase();
        $designer=new DesignerForms();
        $DataBaseName=  filter_input(INPUT_POST, "DataBaseName");
        $IdUsuario=filter_input(INPUT_POST, "IdUsuario");
        $nombre_usuario=  filter_input(INPUT_POST, "nombre_usuario");    
        $Password=  filter_input(INPUT_POST, "Password");
        $NombreMostrar=  filter_input(INPUT_POST, "NombreMostrar");                
        $NombreCuenta=filter_input(INPUT_POST, "NombreCuenta");
        
        $ArrayMail=array();
        
        $ListAccounts="SELECT * FROM Correos WHERE IdUsuario = $IdUsuario";
        $ResultadoConsulta=$BD->ConsultaSelect($DataBaseName, $ListAccounts);

        if($ResultadoConsulta['Estado'])
        {
            for($cont=0; $cont < count($ResultadoConsulta['ArrayDatos']); $cont++)
            {
//                $Datos=array($ResultadoConsulta['ArrayDatos'][$cont]=>$valor);
                foreach ($ResultadoConsulta['ArrayDatos'][$cont] as $Campo => $value)
                {
                    echo "<p>$Campo=$value</p>";
                }
            }            
            
            return;
            $this->obtener_adjuntos($host,$puerto,$correo,$password,$savedirpath);
        }
        else
        {
            $XML->ResponseXML("Error", 0, $ResultadoConsulta['Estado']);
        }
        
    }
    
    
    function obtener_adjuntos($host,$puerto,$login,$password,$savedirpath)
    {
        $ruta_imap="{".$host.":".$puerto."/imap/ssl/novalidate-cert}";
    
        if(!($mbox = imap_open ($ruta_imap,  $login, $password)))
        {
            echo"Ocurrió el siguiente error. ".imap_last_error(); 
            return;
        }
    
    for ($jk = 1; $jk <= imap_num_msg($mbox); $jk++)
        {
            /* get information specific to this email */
            $overview = imap_fetch_overview($mbox,$jk,0);
            $message = imap_fetchbody($mbox,$jk,2);
            $structure = imap_fetchstructure($mbox,$jk);

            $attachments = array();
            if(isset($structure->parts) && count($structure->parts))
            {
                for($i = 1; $i < count($structure->parts); $i++) 
            {
            $structure = imap_fetchstructure($mbox, $jk );    
            $parts = $structure->parts;
            $fpos=2;
            for($i = 1; $i < count($parts); $i++)
            {
                /* Se ignoran otros formatos que no sean XML y PDF */
                if(!($structure->parts[$i]->subtype=="xml" or $structure->parts[$i]->subtype=="pdf" or $structure->parts[$i]->subtype=="XML" or $structure->parts[$i]->subtype=="PDF"))
                continue;


                $attachments[$i] = array(
                'is_attachment' => false,
                'filename' => '',
                'name' => '',
                'attachment' => '');

                if($structure->parts[$i]->ifdparameters)
                {
                    foreach($structure->parts[$i]->dparameters as $object) {
                        if(strtolower($object->attribute) == 'filename') {
                            $attachments[$i]['is_attachment'] = true;
                            $attachments[$i]['filename'] = $object->value;
                    }
                    }
                }
               
                if($structure->parts[$i]->ifparameters) {
                    foreach($structure->parts[$i]->parameters as $object) {
                        if(strtolower($object->attribute) == 'name') {
                            $attachments[$i]['is_attachment'] = true;
                            $attachments[$i]['name'] = $object->value;
                        }
                    }
                }

                if($attachments[$i]['is_attachment']) {
                    $attachments[$i]['attachment'] = imap_fetchbody($mbox, $jk, $i+1);
                    if($structure->parts[$i]->encoding == 3) { // 3 = BASE64
                        $attachments[$i]['attachment'] = base64_decode($attachments[$i]['attachment']);
                    }
                    else if($structure->parts[$i]->encoding == 4) { // 4 = QUOTED-PRINTABLE
                    $attachments[$i]['attachment'] = quoted_printable_decode($attachments[$i]['attachment']);
                    }
                }      
                $filename=$structure->parts[$i]->dparameters[0]->value;
//                printf("\n nombre= $filename extension =". $structure->parts[$i]->subtype);

                /* Se obtiene el emisor */
                $result = imap_fetch_overview($mbox,$jk);          
                $regexp = '/([a-z0-9_\.\-])+\@(([a-z0-9\-])+\.)+([a-z0-9]{2,4})+/i';
                preg_match_all($regexp, $result[0]->from, $m,PREG_PATTERN_ORDER);/* Se busca la estructura de correo */
                $correo_emisor=$m[0][0];
//                printf ("\n ".$correo_emisor);
                

                /* Se mueve el archiv descargado al directorio de recibidos */
                if(!file_exists($savedirpath.$correo_emisor."/"))
                {
                    mkdir( $savedirpath.$correo_emisor."/",0777, true);
                    chmod( $savedirpath.$correo_emisor."/",  0777); 
                }

                /* Se almacena el adjunto */
                foreach($attachments as $at)
                {
                    if($at['is_attachment']==1)
                    {
                        file_put_contents($savedirpath.$at['filename'],$at['attachment']);
                    }
                }
                /* Se mueve al directorio destino */
                
                if(rename($savedirpath.$filename, $savedirpath.$correo_emisor."/".$filename))
                {
//                    echo "<p>Se movio $filename</p>";
                }
                if(file_exists($savedirpath.$filename))
                {
                    unlink($savedirpath.$filename);
                }
            }
            
         }
       }
//            imap_mail_move($mbox, $jk, $buzon_destino);
//imap_delete tags a message for deletion
//    imap_delete($mbox,$jk);


        }
// imap_expunge deletes all tagged messages
//                    imap_expunge($mbox);
        imap_close($mbox,CL_EXPUNGE);   
        
        
        
        
    }
}



$mail = new Mail();
$mail->Ajax();