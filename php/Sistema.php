<?php

/*
 * Clase para administrar datos de configuración del sistema
 */

/**
 * Description of System
 *
 * @author daniel
 */
class Sistema {
    public function __construct() {
        $this->ajax();
    }
    /************************************************************************
     *                                                                      *
     *  Descripción:  Recibe todas la peticiones AJAX                       *
     *                                                                      *
     ***********************************************************************/
    private function ajax()
    {
        switch (filter_input(INPUT_POST, "opcion"))
        {
            case "CreateInstancia":
                $this->CreateInstancia();
                break;
        }
    }
    private function CreateInstancia()
    {
        $NombreInstancia=filter_input(INPUT_POST, "NombreInstancia");
        echo "PHP Crear Instancia $NombreInstancia";
    }       
}
 $system=new Sistema();
