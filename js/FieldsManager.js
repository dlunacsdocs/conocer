/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global BootstrapDialog */

var FieldsManager = function ()
{

};
/* Ventana que muestra las opciones de agregar un nuevo campo (Metadato) 
 * 
 * @funct: función que pertenece a la clase desde donde es invocada para ejecutar al dar click en el botón aceptar del modal
 * */
/**
 * @description Abre una interfaz con los campos de texto necesarios para agregar un nuevo campo.
 * @param {type} actionButton     
 * @param {type} onshow    callback
 * @param {type} onshown   callback 
 * @returns {unresolved}
 */
FieldsManager.prototype.windowNewField = function (actionButton, onshow, onshown)
{

    var FieldName = $('<input>', {type: "text", id: "FieldNameRM", class: "form-control required", FieldType: "varchar", FieldLength: "50"});
    var FieldType = $('<select>', {class: "form-control", id: "FieldTypeRM"})
            .append($('<option>', {value: "text"}).append('Texto'))
            .append($('<option>', {value: "varchar"}).append('Texto Limitado'))
            .append($('<option>', {value: "int"}).append('Entero'))
            .append($('<option>', {value: "float"}).append('Número Decimal'))
            .append($('<option>', {value: "date"}).append('Fecha (Y-m-d)'))
            .append($('<option>', {value: "date"}).append('Fecha y Hora (Y-m-d H:s:i)'));

    var RequiredCheck = $('<input>', {type: "checkbox", id: "CheckRequiredRM"});
    var FieldLength = $('<input>', {type: "text", id: "FieldLengthRM", class: "form-control", FieldType: "int", FieldLength: ""}).prop('disabled', true);

    var $content = $('<div>', {id: "DivFormsNewField"});
    var label = '<label>Nombre<label>';
    var $formGroup = $('<div>', {class: "form-group"});

    $formGroup.append(label);
    $formGroup.append(FieldName);
    $content.append($formGroup);

    $formGroup = $('<div>', {class: "form-group"});
    label = '<label>Tipo<label>';
    $formGroup.append(label);
    $formGroup.append(FieldType);
    $content.append($formGroup);

    $formGroup = $('<div>', {class: "form-group"});
    label = '<label>Longitud<label>';
    $formGroup.append(label);
    $formGroup.append(FieldLength);
    $content.append($formGroup);

    $formGroup = $('<div>');
    label = $('<label>', {class: "checkbox-inline"}).append(RequiredCheck).append('Requerido');
    $formGroup.append(label);
    $content.append($formGroup);

    var data = {fieldName: FieldName, fieldType: FieldType, fieldLength: FieldLength, requiredCheck: RequiredCheck};

    var dialogRef = BootstrapDialog.show({
        title: 'Nuevo Campo',
        message: $content,
        type: BootstrapDialog.TYPE_PRIMARY,
        size: BootstrapDialog.SIZE_SMALL,
        data: data,
        buttons: [{
                id: 'accept',
                label: "Agregar",
                cssClass: 'btn-primary',
                action: function (dialog) {
                    if (typeof actionButton === 'function')
                        actionButton(dialog);
                }
            }, {
                label: 'Cerrar',
                action: function (dialog) {
                    dialog.close();
                }
            }],
        onshow: function (dialogRef) {
            if (typeof onshow === 'function')
                onshow(dialogRef);
        },
        onshown: function (dialogRef) {
            FieldType.change(function ()
            {
                var fieldTypeValue = $(this).val();
                FieldLength.val('');
                if (String(fieldTypeValue) === 'varchar') {
                    FieldLength.prop("disabled", false);
                    if (!FieldLength.hasClass('required'))
                        FieldLength.addClass('required');

                    FieldLength.val('40');
                } else {
                    FieldLength.prop("disabled", true);
                    FieldLength.removeClass('required');
                }
            });

            FieldName.focus();

            var Forms = $content.find('.form-control');
            var FieldsValidator = new ClassFieldsValidator();
            FieldsValidator.InspectCharacters(Forms);

            if (typeof onshown === 'function')
                onshown(dialogRef);
        }
    });

    return dialogRef;
};

/**
 * @description Regresa los valores de cada campo introducido por el usuario, si existe algun error devuelve 0.
 * @param {type} TabledT Parametro que representa la tabla donde se agregara el nuevo campo
 * @param {type} TableDT Objeto devuelto por el api DataTable
 * @param {type} modifyingIndex índice de la fila que se esta editando. 
 * @returns {Number|FieldsManager.prototype.GetFieldsValues.FieldsArray|undefined}
 */
FieldsManager.prototype.GetFieldsValues = function (TabledT, TableDT, modifyingIndex)
{
    /* Agrega campos en forma de lista para luego ser insertados */
    var RegularExpresion = /^([a-zA-Z0-9\_])+$/g;
    var Forms = $('#DivFormsNewRepository input.FormStandart');
    var FieldsValidator = new ClassFieldsValidator();
    var validation = FieldsValidator.ValidateFields(Forms);

    $('#FieldNameRM').tooltip();

    console.log("FieldsManager::AddNewField->" + validation);

    if (validation === 0)
        return;

//        self.AutoincrementId++;

    var FieldName = $('#FieldNameRM').val();
    var FieldLength = $('#FieldLengthRM').val();
    var FieldType = $('#FieldTypeRM').val();
    var RequiredChecValue = $('#CheckRequiredRM').is(':checked');

    FieldName = $.trim(FieldName);

    if (FieldName.length === 0) {
        FieldsValidator.AddClassRequiredActive($('#FieldNameRM'));
        $('#FieldNameRM').attr('title', 'El campo es obligatorio');
        return 0;
    }

    if (!RegularExpresion.test(FieldName))
    {
        FieldsValidator.AddClassRequiredActive($('#FieldNameRM'));
        $('#FieldNameRM').attr('title', 'Nombre de campo inválido');
        return 0;
    }

    /* Se comprueba si no se repitan los campos */
    var RepeatedField = 0;
    TableDT.column(0).data().each(function (value, index)
    {
        if (index !== modifyingIndex)
            if (value === FieldName)
                RepeatedField = 1;
    });

    if (RepeatedField)
    {
        FieldsValidator.AddClassRequiredActive($('#FieldNameRM'));
        $('#FieldNameRM').attr('title', 'El nombre de este campo ya existe');
        return;
    } else
        $('#FieldNameRM').attr('title', '');

    /* Validaciones en el campo de longitud */
    if (FieldType === 'varchar')
    {
        FieldLength = parseInt(FieldLength);

        if ($.isNumeric(FieldLength))
        {
            if (FieldLength >= 256 || FieldLength <= 0)
            {
                FieldsValidator.AddClassRequiredActive($('#FieldLengthRM'));
                return 0;
            }
        } else
        {
            FieldsValidator.AddClassRequiredActive($('#FieldLengthRM'));
            return 0;
        }
    }

    var FieldsArray = {FieldName: FieldName, FieldType: FieldType, FieldLength: FieldLength, RequiredField: RequiredChecValue};

    return FieldsArray;
};