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
            case 'DeleteField':$this->DeleteField();
                break;
            case 'AddNewRegister': $this->AddNewRegister();
                break;
            case 'DeleteEnterprise':$this->DeleteEnterprise();
                break;
            default : break;
        }
    }
    
    private function AddNewRegister()
    {        
        $DB = new DataBase();
        
        $DataBaseName = filter_input(INPUT_POST, "DataBaseName");
        $IdGroup = filter_input(INPUT_POST, "IdFroup");
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $UserName = filter_input(INPUT_POST, "UserName");
        $EnterpriseKey = '';
        $ValuesChain = '';
        $FieldsChain = '';
        
        $xml = filter_input(INPUT_POST, "xml");
        
        libxml_use_internal_errors(true);

        if(!($RegisterXml =  simplexml_load_string($xml)))
        {
            $Error='';
          
            $errors=libxml_get_errors();
            
            for ($aux=0;$aux<count($errors); $aux++) {
                $Error.= $this->display_xml_error($errors[$aux]);
            }
            
            libxml_clear_errors();   /* Se limpia buffer de errores */          
            
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al cargar el xml generado con los datos de la nueva empresa, es posible que no se haya formado correctamente $Error</p>");
        }
        
        /* Se generá dinámicamente la consulta para insertar la nueva empresa*/
        foreach ($RegisterXml->Campo as $field)
        {       
            $FieldValue = $field->value;
            $FiledType = $field->type;
            $FieldName = $field->name;
            
            if(strcasecmp("ClaveEmpresa", $FieldName)==0)
                    $EnterpriseKey = $FieldValue;
            
            $FormattedField = DataBase::FieldFormat($FieldValue, $FiledType);
            
            if(strcasecmp($FormattedField, 0)!=0)
            {
                $ValuesChain.= $FormattedField.", ";
                $FieldsChain.=$FieldName.", ";
            }                
        }
        
        $ValuesChain_ = trim($ValuesChain, ", ");
        $FieldsChain_ = trim($FieldsChain, ", ");
        
        /* Se comprueba que no exista la empresa */
        $CheckIfExist = "SELECT *FROM Empresas WHERE ClaveEmpresa COLLATE utf8_bin = '$EnterpriseKey' ";
        $CheckResult = $DB->ConsultaSelect($DataBaseName, $CheckIfExist);
        if($CheckResult['Estado']!=1)
            return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al intentar comprobar disponibilidad de la nueva clave de empresa <b>$EnterpriseKey</b></p><br>Detalles:<br><br>".$CheckResult['Estado']);
        
        if(count($CheckResult['ArrayDatos'])>0)
            return XML::XMLReponse ("Error", 0, "<p><b>Notificación.</b> La clave de empresa seleccionada ya existe. Por favor seleccione una nueva</p>");
        
        $InsertEnterprise = "Insert Into Empresas ($FieldsChain_) VALUES ($ValuesChain_)";
        
        $NewIdEnterprise = $DB->ConsultaInsertReturnId($DataBaseName, $InsertEnterprise);
        
        if(!($NewIdEnterprise>0))
            return XML::XMLReponse("Error", 0, "<p><b>Error</b> al insertar la nueva empresa.</p><br>Detalles:<br><br>$NewIdEnterprise");
        
        $doc  = new DOMDocument('1.0','utf-8');
        $doc->formatOutput = true;
        $root = $doc->createElement("AddedNewRecord");
        $doc->appendChild($root);   
        
        $Message = $doc->createElement("Mensaje", "Empresa insertada con éxito");
        $root->appendChild($Message);
        $XmlNewIdEnterprise = $doc->createElement("NewIdEnterprise", $NewIdEnterprise);
        $root->appendChild($XmlNewIdEnterprise);
        
        
        header ("Content-Type:text/xml");
        echo $doc->saveXML();           
    }
    
    private function DeleteField()
    {
        $DB = new DataBase();
        
        $DataBaseName = filter_input(INPUT_POST, "DataBaseName");
        $IdGroup = filter_input(INPUT_POST, "IdFroup");
        $IdUser = filter_input(INPUT_POST, "IdUser");
        $UserName = filter_input(INPUT_POST, "UserName");
        $FieldName = filter_input(INPUT_POST, "FieldName");
        
        $DeletedResult = DesignerForms::DeleteField($DataBaseName , "Empresa", $FieldName);
        
        if($DeletedResult!=1)
            return;
        
        $AlterTable = "ALTER TABLE Empresas DROP COLUMN $FieldName";
        if(($AlterTableResult = $DB->ConsultaQuery($DataBaseName, $AlterTable))!=1)
                return XML::XMLReponse ("Error", 0, "<p><b>Error</b> al eliminar la columna <b>$FieldName</b></p><br>Detalles:<br><br>$AlterTableResult");
        
        XML::XMLReponse("DeletedField", 0, "Campo \"$FieldName\" eliminado");
        
    }
    
    private function DeleteEnterprise()
    {
        var_dump($_POST);
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
    
    private function display_xml_error($error)
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

}

$Enterprise = new Enterprise();
