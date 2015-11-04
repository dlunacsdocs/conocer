/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global BootstrapDialog */

var FieldsManager = function()
{
    
};
 /* Ventana que muestra las opciones de agregar un nuevo campo (Metadato) 
  * 
  * @funct: función que pertenece a la clase desde donde es invocada para ejecutar al dar click en el botón aceptar del modal
  * */
FieldsManager.prototype.windowNewField = function(funct)
{

    var FieldName = '<input type = "text" id = "FieldNameRM" class = "form-control required" FieldType = "varchar" FieldLength = "50">';
    var FieldType = '<select id = "FieldTypeRM" class = "form-control" FieldType = "varchar" FieldLenght = "50">\n\
                        <option value = "text">Texto</option>\n\
                        <option value = "varchar">Texto Limitado</option>\n\
                        <option value = "int">Entero</option>\n\
                        <option value = "float">Decimal</option>\n\\n\
                        <option value = "date">Fecha (Y-m-d)</option>\n\
                        <option value = "datetime">Fecha y Hora (Y-m-d H:s:i)</option>\n\
                    </select>';
    var RequiredCheck = '<input type = "checkbox" id = "CheckRequiredRM" class = "">';
    var FieldLength = '<input type = "text" id = "FieldLengthRM" class = "form-control" FieldType = "int" FieldLength = "" disabled>';


   var $content = $('<div>',{id:"DivFormsNewField"});
   var label = '<label>Nombre<label>';
   var $formGroup = $('<div>', {class:"form-group"});

   $formGroup.append(label);
   $formGroup.append(FieldName);
   $content.append($formGroup);

   $formGroup = $('<div>', {class:"form-group"});
   label = '<label>Tipo<label>';
   $formGroup.append(label);
   $formGroup.append(FieldType);
   $content.append($formGroup);

   $formGroup = $('<div>', {class:"form-group"});
   label = '<label>Longitud<label>';
   $formGroup.append(label);
   $formGroup.append(FieldLength);
   $content.append($formGroup);

   $formGroup = $('<div>');
   label = '<label class = "checkbox-inline">'+RequiredCheck+' Requerido<label>';
   $formGroup.append(label);
//   $formGroup.append(RequiredCheck);
   $content.append($formGroup);
    
    var dialogRef = BootstrapDialog.show({
        title: 'Nuevo Campo',
        message: $content,
        type: BootstrapDialog.TYPE_PRIMARY,
        size: BootstrapDialog.SIZE_SMALL,
        buttons: [{
                label: "Agregar",
                cssClass: 'btn-primary',
                action: function(dialog){
                    funct();
                }
        },{
            label: 'Cancelar',
//                cssClass: 'btn-primary',
            action: function(dialog){
                dialog.close();
            }
        }],
        onshown: function(dialogRef){
            $('#FieldTypeRM').change(function()
            {
                var FieldType = $(this).val();
                $('#FieldLengthRM').val('');
                if(FieldType==='varchar')
                {
                    $('#FieldLengthRM').prop( "disabled", false );
                    if(!$('#FieldLengthRM').hasClass('required'))
                        $('#FieldLengthRM').addClass('required');

                    $('#FieldLengthRM').val('40');                
                }
                else
                {
                    $('#FieldLengthRM').prop( "disabled", true );
                    $('#FieldLengthRM').removeClass('required');
                }
            });

            $('#FieldNameRM').focus();

            var Forms = $('#DivFormsNewField .form-control');
            console.log(Forms);
            var FieldsValidator = new ClassFieldsValidator();   
            FieldsValidator.InspectCharacters(Forms);
        }
    });

    return dialogRef;
};

/* Regresa los valores de cada campo introducido por el usuario, si existe algun error devuelve 0  
 * 
 * TabledT: Parametro que representa la tabla donde se agregara el nuevo campo
 * TableDT: Objeto devuelto por el api DataTable
 * return Object*/
FieldsManager.prototype.GetFieldsValues = function(TabledT, TableDT)
{
    /* Agrega campos en forma de lista para luego ser insertados */    
    var RegularExpresion = /^([a-zA-Z0-9\_])+$/g;
    var Forms = $('#DivFormsNewRepository input.FormStandart');
    var FieldsValidator = new ClassFieldsValidator();   
    var validation = FieldsValidator.ValidateFields(Forms);

    $('#FieldNameRM').tooltip();

    console.log("FieldsManager::AddNewField->"+validation);
                                                       
    if(validation===0)
        return;                                 
        
//        self.AutoincrementId++;

    var FieldName = $('#FieldNameRM').val();
    var FieldLength = $('#FieldLengthRM').val();
    var FieldType = $('#FieldTypeRM').val();  
    var RequiredChecValue = $('#CheckRequiredRM').is(':checked');  
    
    FieldName = $.trim(FieldName);
    
    if(FieldName.length === 0){
        FieldsValidator.AddClassRequiredActive($('#FieldNameRM'));
        $('#FieldNameRM').attr('title','El campo es obligatorio');
        return 0;
    }
    
    if(!RegularExpresion.test(FieldName))
    {
        FieldsValidator.AddClassRequiredActive($('#FieldNameRM'));
        $('#FieldNameRM').attr('title','Nombre de campo inválido');
        return 0;
    }      

    /* Se comprueba si no se repitan los campos */
    var RepeatedField = 0;
    TableDT.column(0).data().each(function(value, index)
    {
        if(value===FieldName)
            RepeatedField = 1;
    });     

    if(RepeatedField)
    {
        FieldsValidator.AddClassRequiredActive($('#FieldNameRM'));
        $('#FieldNameRM').attr('title','El nombre de este campo ya existe');            
        return;
    }
    else
        $('#FieldNameRM').attr('title','');

    /* Validaciones en el campo de longitud */
    if(FieldType==='varchar')
    {
        FieldLength = parseInt(FieldLength);

        if($.isNumeric(FieldLength))
        {
            if(FieldLength>=256 || FieldLength<=0)
            {
                FieldsValidator.AddClassRequiredActive($('#FieldLengthRM'));
                return 0;
            }            
        }
        else
        {
            FieldsValidator.AddClassRequiredActive($('#FieldLengthRM'));
                return 0;
        }
    }
                 
    var FieldsArray = {FieldName:FieldName, FieldType:FieldType, FieldLength:FieldLength, RequiredField:RequiredChecValue};
    
    return FieldsArray;    
};