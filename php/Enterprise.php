<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Enterprise
 *
 * @author Daniel
 */
$RoutFile = filter_input(INPUT_SERVER, "DOCUMENT_ROOT"); /* /var/services/web */
require_once 'XML.php';
require_once 'DataBase.php';

class Enterprise {

    public function __construct() {
        $this->Ajax();
    }

    private function Ajax() {
        $option = filter_input(INPUT_POST, "option");
        switch ($option) {
            case 'GetEnterprises': $this->GetEnterprises();
                break;
            case 'NewField': $this->NewField();
                break;
            default : break;
        }
    }

    private function NewField() {
        $DB = new DataBase();

        $DataBaseName = filter_input(INPUT_POST, "DataBaseName");
//        $IdUser = filter_input(INPUT_POST, "IdUser");
//        $UserName = filter_input(INPUT_POST, "UserName");
//        $IdRepository = filter_input(INPUT_POST, "IdRepository");

        $FieldName = filter_input(INPUT_POST, "FieldName");
        $FieldLength = filter_input(INPUT_POST, "FieldLength");
        $FieldType = filter_input(INPUT_POST, "FieldType");
        $RequiredField = filter_input(INPUT_POST, "RequiredField");

        $FieldDetail = DesignerForms::CreateProperty($FieldName, $FieldType, $FieldLength, $RequiredField);

        $AlterTable = "ALTER TABLE Empresas ADD COLUMN $FieldName ".$FieldDetail['FieldMySql'];

        if (($AlterRes = $DB->ConsultaQuery($DataBaseName, $AlterTable)) != 1)
            return XML::XMLReponse("Error", 0, "<p><b>Error</b> al agregar el nuevo campo <b>$FieldName</b></p><br>Detalles:<br><br>$AlterRes");


        if (($AddField = DesignerForms::AddPropertyIntoStructureConfig($DataBaseName, "Empresa", $FieldDetail['FieldDetail'])) != 1) {
            $DropColumn = "ALTER TABLE Empresas DROP COLUMN $FieldName";
            if (($DropResult = $DB->ConsultaQuery($DataBaseName, $DropColumn)) != 1)
                return XML::XMLReponse("Error", 0, "<p><b>Error</b> al agregar al registro de estructura el nuevo campo '$FieldName'. No fué posible eliminar la columna posteriormente, debe reportarlo a CSDocs</p><br>Detalles:<br><br>$DropResult");
            else
                return XML::XMLReponse("Error", 0, "<p><b>Error</b> al agregar al registro de estructura el nuevo campo '$FieldName'</p><br>Detalles:<br><br>$AddField");
        }

        XML::XMLReponse("AddedField", 1, "Campo $FieldName agregado correctamente");
    }

    private function GetEnterprises() {
        $BD = new DataBase();

        $IdUser = filter_input(INPUT_POST, "IdUser");
        $UserName = filter_input(INPUT_POST, "UserName");
        $DataBaseName = filter_input(INPUT_POST, "DataBaseName");

        $query = "SELECT *FROM Empresas";

        $ListEmpresas = $BD->ConsultaSelect($DataBaseName, $query);

        if ($ListEmpresas['Estado'] != 1)
            return XML::XMLReponse("Error", 0, "<b>Error</b> al obtener el listado de empresas.</p><br>Detalles:<br><br>" . $ListEmpresas['Estado']);

        $EnterpriseList = $ListEmpresas['ArrayDatos'];

        XML::XmlArrayResponse("Enterprises", "Enterprise", $EnterpriseList);
    }

}

$Enterprise = new Enterprise();
