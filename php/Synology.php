<?php
/**
 * Description of Synology
 *
 * @author daniel
 */
class Synology {
    function CreateShareFolder()
    {
        $ch = curl_init(); 
        // definimos la URL a la que hacemos la petición
        curl_setopt($ch, CURLOPT_URL,"http://www.example.com/test.php");
        // definimos el número de campos o parámetros que enviamos mediante POST
        curl_setopt($ch, CURLOPT_POST, 1);
        // definimos cada uno de los parámetros
        curl_setopt($ch, CURLOPT_POSTFIELDS, "postvar1=value1&postvar2=value2&postvar3=value3");

        // recibimos la respuesta y la guardamos en una variable
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $remote_server_output = curl_exec ($ch);

        // cerramos la sesión cURL
        curl_close ($ch);

        // hacemos lo que queramos con los datos recibidos
        // por ejemplo, los mostramos
        print_r($remote_server_output);
    }
}
