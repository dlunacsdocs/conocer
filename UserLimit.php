<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */

require_once "$RoutFile/php/Encrypter.php";


$EncryptedSetting = parse_ini_file("$RoutFile/version/config.ini", true);
if($EncryptedSetting === FALSE)
{
    XML::XMLReponse("Error", 0, "<p><b>Error</b> en el registro de configuración de CSDocs $EncryptedSetting</p>");
    return 0;
}

$UsersNumberEncrypted = $EncryptedSetting['UsersNumber'];
$UserNumberDecrypted = Encrypter::decrypt($UsersNumberEncrypted);
$repositoriesEncrypted = $EncryptedSetting['RepositoriesNumber'];
$repositoriesNumber = Encrypter::decrypt($repositoriesEncrypted);
$instancesNumberEncrypted = $EncryptedSetting['InstancesNumber'];
$instancesNumber = Encrypter::decrypt($instancesNumberEncrypted);

echo "Instances: $instancesNumber Usuarios: ".$UserNumberDecrypted." repos:$repositoriesNumber" ;
