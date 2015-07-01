/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var FieldsManager = function()
{
    
};
 /* Ventana que muestra las opciones de agregar un nuevo campo  */
FieldsManager.prototype.BuildWindow = function()
{
    $('#DivFormsNewField').remove();
        $('body').append('<div id = "DivFormsNewField"></div>');
        $('#DivFormsNewField').dialog({title:"Nuevo Campo", width:400, minWidth:200, Height:400, minHeight:200, modal:true, buttons:{
                Agregar:{text:"Agregar", click:function(){_AddNewRepositoryField();}},
                Cerrar:{text:"Cerrar", click:function(){$(this).remove();}}
            }});
        var FieldName = '<input type = "text" id = "FieldNameRM" class = "FormStandart required" FieldType = "varchar" FieldLength = "50">';
        var FieldType = '<select id = "FieldTypeRM" class = "FormStandart" FieldType = "varchar" FieldLenght = "50">\n\
                            <option value = "text">Texto</option>\n\
                            <option value = "varchar">Varchar</option>\n\
                            <option value = "int">Entero</option>\n\
                            <option value = "float">Flotante</option>\n\\n\
                            <option value = "date">Fecha</option>\n\
                        </select>';
        var RequiredCheck = '<input type = "checkbox" id = "CheckRequiredRM"></p>';
        var FieldLength = '<p><input type = "text" id = "FieldLengthRM" class = "FormStandart" FieldType = "int" FieldLength = "" disabled></p>';
        
        $('#DivFormsNewField').append('<div id = "DivFormsNewRepository">\n\
            <table>\n\
                    <tr><td>Nombre del Campo: </td><td>'+FieldName+'</td></tr>\n\
                    <tr><td>Tipo: </td><td>'+FieldType+'</td></tr>\n\
                    <tr><td>Longitud:</td><td>'+FieldLength+'</td></tr>\n\
                    <tr><td>Requerido: </td><td>'+RequiredCheck+'</td></tr>\n\
            </table>\n\
        </div>');
        
        $('#FieldNameRM').focus();
        
        var Forms = $('#DivFormsNewField .FormStandart');

        var FieldsValidator = new ClassFieldsValidator();   
        FieldsValidator.InspectCharacters(Forms);
    
        $('#FieldTypeRM').change(function()
        {
            console.log('change select');
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
        
        $('#IconWaitingNewRepository').remove();
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