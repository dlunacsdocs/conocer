/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global EnvironmentData, BotonesWindow, LanguajeDataTable */
var FormsNewRepositorydT,FormsNewRepositoryDT, RepositoryDetaildT, RepositoryDetailDT;
$(document).ready(function(){
    $('.LinkRepositories').click(function()
    {
        if ($('#DivRepositoriesManager').is(':visible'))
            return 0;
        
        var classRepository = new ClassRepository();
        classRepository.BuildRepositoriesManager();
                               
    });   
    
});

var ClassRepository = function()
{
    var self = this;
    self.IdRepositorio = undefined;
    self.NombreRepositorio = undefined;
    self.AutoincrementId = 0;
    
    _FormsNewField = function()
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
                            <option value = "varchar">Texto limitado</option>\n\
                            <option value = "int">Numérico</option>\n\
                            <option value = "float">Entero con decimales</option>\n\\n\
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
    
    /* Agrega campos en forma de lista para luego ser insertados */
    _AddNewRepositoryField = function()
    {       
        var RegularExpresion = /^([a-zA-Z0-9\_])+$/g;
        var Forms = $('#DivFormsNewRepository input.FormStandart');
        var FieldsValidator = new ClassFieldsValidator();   
        var validation = FieldsValidator.ValidateFields(Forms);
        
        $('#FieldNameRM').tooltip();
        
        console.log("_AddNewRepositoryField::"+validation);
        
        if(validation===0)
            return;             
                        
        
        
        var FieldName = $('#FieldNameRM').val();
        var FieldLength = $('#FieldLengthRM').val();
        var FieldType = $('#FieldTypeRM').val();  
        var RequiredChecValue = $('#CheckRequiredRM').is(':checked');    
        
        if(!RegularExpresion.test(FieldName) && FieldName.length<=20)
        {
            FieldsValidator.AddClassRequiredActive($('#FieldNameRM'));
            $('#FieldNameRM').attr('title','Nombre de campo inválido, debe ser una cadena alfanumérica (A-A, a-z, _, -) menor a 20 caracteres');
            return 0;
        }                          
        
        self.AutoincrementId++;
        
        /* Se comprueba si no se repitan los campos */
        var RepeatedField = 0;
        FormsNewRepositoryDT.column(0).data().each(function(value, index)
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
                    return;
                }            
            }
            else
            {
                FieldsValidator.AddClassRequiredActive($('#FieldLengthRM'));
                    return;
            }
        }
                        
        if(RequiredChecValue)
            RequiredChecValue = 'Si';
        else
            RequiredChecValue = 'No';                
                
        var data = [FieldName, FieldType, FieldLength, RequiredChecValue];

        var ai = FormsNewRepositoryDT.row.add(data).draw();
        var n = FormsNewRepositorydT.fnSettings().aoData[ ai[0] ].nTr;
        n.setAttribute('id',self.AutoincrementId);
        
        Notificacion('Campo '+FieldName+' preparado');
        
        $('#FieldNameRM').val('');
        $('#FieldNameRM').focus();
        $('#FieldTypeRM option[value="text"]').attr("selected", "selected");
        $('#CheckRequiredRM').prop('checked', false);
        
        FormsNewRepositorydT.find('tbody tr[id='+self.AutoincrementId+']:eq(0)').click();
    };
    
    /* Genera el nuevo Repositorio (BotÃ³n 'Generar Repositorio' del dialog)*/
    _BuildNewRepository = function()
    {                
        var FieldsValidator = new ClassFieldsValidator();   
        var RegularExpression = /^([a-zA-Z0-9\_])+$/g;
        var EnterpriseKey = $('#RMSelectEnterprises').val();
        var RepositoryName = $('#RepositoryNameRM').val();               
        var Forms = $('#WS_Repository input.FormStandart');
        
        $('#RMSelectEnterprises').tooltip();
        $('#RepositoryNameRM').tooltip();
        
        if(EnterpriseKey ===0 || EnterpriseKey==='0')
        {
            FieldsValidator.AddClassRequiredActive($('#RMSelectEnterprises'));
            return 0;
        }
        else
            FieldsValidator.RemoveClassRequiredActive($('#RMSelectEnterprises'));
        
        var validation = FieldsValidator.ValidateFields(Forms);
        if(validation===0)
            return;
        
        if(!RegularExpression.test(RepositoryName))
        {
            FieldsValidator.AddClassRequiredActive($('#RepositoryNameRM'));
            $('#RepositoryNameRM').attr('title','Nombre invÃ¡lido');
            return 0;
        }
        else
            $('#RepositoryNameRM').attr('title','');
        
        var ExistedRepository = 0;
        var Repositories = self.GetRepositories(EnterpriseKey);
        console.log(Repositories);
        $(Repositories).find('Repository').each(function()
        {
            if(RepositoryName===$(this).find('NombreRepositorio').text())
                ExistedRepository = 1;
        });
        
        if(ExistedRepository)
        {
            FieldsValidator.AddClassRequiredActive($('#RepositoryNameRM'));
            $('#RepositoryNameRM').attr('title','El repositorio ya existe');
            return 0;
        }
        else
        {
            $('#RepositoryNameRM').attr('title','');
            FieldsValidator.RemoveClassRequiredActive($('#RepositoryNameRM'));                
        }
        
        /* Se genera la misma estructura de xml de carga de repositorio a travÃ©s del attachment 'Nueva Instancia' */
        var Xml = "<NewRepository version='1.0' encoding='UTF-8'>\n\
                        <CrearEstructuraRepositorio DataBaseName = \""+EnvironmentData.DataBaseName+"\" ClaveEmpresa = \""+EnterpriseKey+"\">";
                    Xml+="<NombreRepositorio>"+RepositoryName+"</NombreRepositorio>\n\
                            <DefinitionUsersProperties>";
        var Rows = FormsNewRepositoryDT.rows().data().each(function(value, index)
        {
            var FieldName = value[0];
            var FieldType = value[1];
            var FieldLength = value[2];
            var RequiredField = value[3];
            
            if(RequiredField==='Si')
                RequiredField = true;
            else if(RequiredField==='No')
                RequiredField = false;
            
            Xml+=               '<Properties name = "'+FieldName+'" long = "'+FieldLength+'" type = "'+FieldType+'" required = "'+RequiredField+'" />';            
        });
        
        if(Rows.length===0)
        {
            Advertencia('Debe agregar por lo menos un campo en el nuevo repositorio');
            return;
        }
                
        Xml+=               '</DefinitionUsersProperties>\n\
                        </CrearEstructuraRepositorio>\n\
                    </NewRepository>';
        
        $('#WS_Repository').append('<div class="Loading" id = "IconWaitingNewRepository"><img src="../img/loadinfologin.gif"></div>');
        
        var data = {opcion:'NewRepository', DataBaseName:EnvironmentData.DataBaseName, IdUser:EnvironmentData.IdUsuario, UserName:EnvironmentData.NombreUsuario, Xml:Xml};
                
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Repository.php",
        data: data, 
        success:  function(xml)
        {           
            Salida(xml);
            
        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown) {Error(textStatus +"<br>"+ errorThrown);}
        });             
        
        
        $('#IconWaitingNewRepository').remove();
        
    };
    
    _ConfirmDeleteNewRepositoryField = function()
    {
        var IdField = $('#TableFieldsNewRepository tr.selected').attr('id');
        var FieldName = undefined;
        if(!(IdField>0))
        {
            Advertencia('Debe seleccionar al menos un campo');
            return 0;
        }
        
        $('#TableFieldsNewRepository tr.selected').each(function()
        {
            var position = FormsNewRepositorydT.fnGetPosition(this); // getting the clicked row position
            FieldName = FormsNewRepositorydT.fnGetData(position)[0];
        });
        
        $('#DivConfirmDeleteNewRepositoryField').remove();   
        $('body').append('<div id = "DivConfirmDeleteNewRepositoryField"></div>');
        $('#DivConfirmDeleteNewRepositoryField').append('<p>Sera removido el campo <b>'+FieldName+'</b>. <p>Â¿Desea continuar?</p>');
        $('#DivConfirmDeleteNewRepositoryField').dialog({title:"Mensaje de confirmacion", width:250, minWidth:250, heigth:250, minHeigth:250, modal:true, buttons:{
                "Aceptar":{text:"Aceptar", click:function(){$(this).remove(); _DeleteNewRepositoryField(IdField);}},
                "Cancelar":function(){$(this).remove();}
        }});
    };
    
    _DeleteNewRepositoryField = function(IdField)
    {
        console.log("Elimando a "+IdField);
        FormsNewRepositoryDT.row('tr[id='+IdField+']').remove().draw( false );                
        
    };
    
    _EditNewRepositoryField = function()
    {
        console.log('_EditNewRepositoryField');
              
        var IdField = $('#TableFieldsNewRepository tr.selected').attr('id');
        var FieldName, FieldType, FieldLength, RequiredField;
        if(!(IdField>0))
        {
            Advertencia('Debe seleccionar al menos un campo');
            return 0;
        }
        
        $('#TableFieldsNewRepository tr.selected').each(function()
        {
            var position = FormsNewRepositorydT.fnGetPosition(this); // getting the clicked row position
            FieldName = FormsNewRepositorydT.fnGetData(position)[0];
            FieldType = FormsNewRepositorydT.fnGetData(position)[1];
            FieldLength = FormsNewRepositorydT.fnGetData(position)[2];
            RequiredField = FormsNewRepositorydT.fnGetData(position)[3];
        });
        
        _FormsNewField();
        
        $('#FieldNameRM').val(FieldName);
        $('#FieldTypeRM option[value='+FieldType+']').prop('selected',true);
        if(FieldType==='varchar')
            $('#FieldLengthRM').prop('disabled',false);
        $('#FieldLengthRM').val(FieldLength);
        if(RequiredField==='Si')
            $('#CheckRequiredRM').prop('checked',true);
        else if (RequiredField === 'No')
            $('#CheckRequiredRM').prop('checked',false);
           
        
        var buttons = {"Cancelar":{text:"Cancelar", click:function(){$(this).remove();}},
        "Modificar":{text:"Modificar", click:function(){_ModifyNewRepositoryField(IdField, FieldName);}}};
    
        $('#DivFormsNewField').dialog('option','buttons', buttons);
        
        $('#DivFormsNewField').dialog('option','title','Modificar Campo');
        
    };
    
    _ModifyNewRepositoryField = function(IdField, OldFieldName)
    {
        console.log('_ModifyNewRepositoryField::'+IdField);
        
        var RegularExpresion = /^([a-zA-Z0-9\_])+$/g;
        var Forms = $('#DivFormsNewRepository input.FormStandart');
        var FieldsValidator = new ClassFieldsValidator();   
        var validation = FieldsValidator.ValidateFields(Forms);
        
        $('#FieldNameRM').tooltip();
        
        console.log("_ModifyNewRepositoryField::"+validation);
        
        if(validation===0)
            return;             
                        
        if(!RegularExpresion.test(FieldName))
        {
            FieldsValidator.AddClassRequiredActive($('#FieldNameRM'));
            $('#FieldNameRM').attr('title','Nombre de campo invÃ¡lido');
            return 0;
        }                          
               
        var FieldName = $('#FieldNameRM').val();
        var FieldLength = $('#FieldLengthRM').val();
        var FieldType = $('#FieldTypeRM').val();  
        var RequiredChecValue = $('#CheckRequiredRM').is(':checked');    
        
        /* Se comprueba si no se repitan los campos */
        var RepeatedField = 0;
        FormsNewRepositoryDT.column(0).data().each(function(value, index)
        {
            if(value===FieldName && OldFieldName!==FieldName)
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
                    return;
                }            
            }
            else
            {
                FieldsValidator.AddClassRequiredActive($('#FieldLengthRM'));
                    return;
            }
        }
                        
        if(RequiredChecValue)
            RequiredChecValue = 'Si';
        else
            RequiredChecValue = 'No';                
                
        
        FormsNewRepositorydT.$('tr[id='+IdField+']').each(function()
        {
            var position = FormsNewRepositorydT.fnGetPosition(this); // getting the clicked row position
            FormsNewRepositorydT.fnUpdate([FieldName],position,0,false);
            FormsNewRepositorydT.fnUpdate([FieldType],position,1,false);
            FormsNewRepositorydT.fnUpdate([FieldLength],position,2,false);
            FormsNewRepositorydT.fnUpdate([RequiredChecValue],position,3,false);
        });
        
        $('#DivFormsNewField').remove();
        Notificacion('Campo Modificado');
    };
    
    /* Tabla que muestra los campos y su detalle de los mismos pertenecientes a un repositorio */
    _BuildTableRepositoryDetail = function(RepositoryDetail)
    {
        self.AutoincrementId = 0;
        $('#DivRepositoryDetail').remove();
        $('#WS_Repository').append('<div id = "DivRepositoryDetail"><table id = "TableRepositoryDetail" class = "display hover"></table></div>');
        $('#DivRepositoryDetail').append('<div class="Loading" id = "IconWaitingNewRepository"><img src="../img/loadinfologin.gif"></div>');
        $('#TableRepositoryDetail').append('<thead><tr><th>Campo</th><th>Tipo</th><th>Longitud</th><th>Requerido</th></tr></thead>');
        
        RepositoryDetaildT = $('#TableRepositoryDetail').dataTable(
        {
           'bPaginate':false, 'bInfo':false, bFilter: false, "bSort": false, "autoWidth" : false, "oLanguage":LanguajeDataTable,"dom": 'lfTrtip',
            "tableTools": {
                "aButtons": [
                    {"sExtends":"text", "sButtonText": "Agregar Campo", "fnClick" :function(){_FormsAddNewField();}},
                    {"sExtends":"text", "sButtonText": "Eliminar Campo", "fnClick" :function(){_ConfirmDeleteRepositoryField();}},
                    {"sExtends":"text", "sButtonText": "Eliminar Repositorio", "fnClick" :function(){_ConfirmDeleteRepository();}},
                    {"sExtends": "copy","sButtonText": "Copiar al portapapeles"},
                    {
                        "sExtends":    "collection",
                        "sButtonText": "Guardar como...",
                        "aButtons":    [ "csv", "xls", "pdf" ]
                    }                          
                ]
            }                              
        });  

        $('div.DTTT_container').css({"margin-top":"1em"});
        $('div.DTTT_container').css({"float":"left"});

        RepositoryDetailDT = new $.fn.dataTable.Api('#TableRepositoryDetail');
        
        $('#TableRepositoryDetail tbody').on( 'click', 'tr', function ()
            {
                RepositoryDetailDT.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
            } );  
        
        /* Llenado de la tabla con los campos del repositorio */
        $(RepositoryDetail).find('Campo').each(function()
        {
            var FieldName = $(this).find('name').text();
            var FieldType = $(this).find('type').text();
            var FieldLength = $(this).find('long').text();
            var RequiredField = $(this).find('required').text();
            
            if(RequiredField==='' || RequiredField==='false')
                RequiredField = "No";
            else
                if(RequiredField==='true')
                    RequiredField = "Si";
            
            var data = [FieldName, FieldType, FieldLength, RequiredField];

            var ai = RepositoryDetailDT.row.add(data).draw();
            var n = RepositoryDetaildT.fnSettings().aoData[ ai[0] ].nTr;
            n.setAttribute('id',self.AutoincrementId);
            
        });
        
        
        $('#IconWaitingNewRepository').remove();    
    };
    _ConfirmDeleteRepository = function()
    {
        var RepositoryName = $('#RMSelectRepositories option:selected').html();
        
        $('#DivConfirmDeleteRepository').remove();
        $('body').append('<div id = "DivConfirmDeleteRepository"></div>');
        $('#DivConfirmDeleteRepository').append('<p>Realmente desea eliminar el repositorio <b>'+RepositoryName+'</b></p>');
        $('#DivConfirmDeleteRepository').dialog({title:"Mensaje de confirmación", width:250, minWidth:150, height:250, minHeight:150, modal:true, buttons:{
                Cancelar:function(){$(this).remove();},
                Continuar: function(){_DeleteRepository();}
        }});
    };
    
    _DeleteRepository = function()
    {
        $('#WS_Repository').append('<div class="Loading" id = "IconWaitingRepository"><img src="../img/loadinfologin.gif"></div>');

        var IdRepository = $('#RMSelectRepositories option:selected').val();
        var RepositoryName = $('#RMSelectRepositories option:selected').html();
        var IdEnterprise = $('#RMSelectEnterprises option:selected').attr('id');
        
        var data = {opcion:'DeleteRepository', DataBaseName:EnvironmentData.DataBaseName, IdUser:EnvironmentData.IdUsuario, UserName:EnvironmentData.NombreUsuario, IdRepository:IdRepository, RepositoryName:RepositoryName, IdEnterprise:IdEnterprise};
        
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Repository.php",
        data: data, 
        success:  function(xml)
        {            
            if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );

            if($(xml).find('DeletedRepository').length>0)
            {
                $('#DivConfirmDeleteRepository').remove();
                var Mensaje = $(xml).find('Mensaje').text();
                Notificacion(Mensaje);
                
                $("#RMSelectRepositories option:first").click();
                $('#RMSelectRepositories option[value='+IdRepository+']').remove(); 
                $('#DivRepositoryDetail').remove();
                
            }
            
            $(xml).find("Error").each(function()
            {
                var $Error=$(this);
                var mensaje=$Error.find("Mensaje").text();
                Error(mensaje);
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown) {Error(textStatus +"<br>"+ errorThrown);}
        });         
        
        $('#IconWaitingRepository').remove();
    }
    
    _ConfirmDeleteRepositoryField = function()
    {
        var IdField = $('#TableRepositoryDetail').find('tr.selected').length;
        var RepositoryName = $('#RMSelectRepositories option:selected').text();
        var FieldName = undefined;
        if(!(IdField>0))
            return Advertencia('Debe seleccionar al menos un campo');
        
        $('#TableRepositoryDetail').find('tr.selected').each(function()
        {
            var position = RepositoryDetaildT.fnGetPosition(this); // getting the clicked row position
            FieldName = RepositoryDetaildT.fnGetData(position)[0];
        });
        
        $('body').append('<div id = "DivConfirmDeleteRepositoryField"></div>');
        $('#DivConfirmDeleteRepositoryField').append('<p>¿Realmente desea eliminar el campo <b>'+FieldName+'</b> del repositorio  <b>'+RepositoryName+'</b>?. Este proceso no puede revertirse.</p>');
        $('#DivConfirmDeleteRepositoryField').dialog({title:"Mensaje de confirmación", width:250, minWidth:200, heigth:250, minHeigth:200, modal:true, buttons:{
            "Cancelar":function(){$(this).remove();},
            "Aceptar": function(){$(this).remove(); _DeleteRepositoryField();}
            }
        });
    };
    
    _DeleteRepositoryField = function()
    {
        var IdField = $('#TableRepositoryDetail').find('tr.selected').length;
        var FieldName = undefined;
        if(!(IdField>0))
            return Advertencia('Debe seleccionar al menos un campo');
        
        var IdRepository = $('#RMSelectRepositories').val();  
        var RepositoryName = $('#RMSelectRepositories option:selected').text();
        
        $('#TableRepositoryDetail').find('tr.selected').each(function()
        {
            var position = RepositoryDetaildT.fnGetPosition(this); // getting the clicked row position
            FieldName = RepositoryDetaildT.fnGetData(position)[0];
        });
        
        var data = {opcion:"DeleteRepositoryField", DataBaseName: EnvironmentData.DataBaseName, IdRepository:IdRepository, RepositoryName:RepositoryName, IdUser:EnvironmentData.IdUsuario, UserName: EnvironmentData.NombreUsuario, FieldName:FieldName};
        
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Repository.php",
        data: data, 
        success:  function(xml)
        {            
            if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );

            if($(xml).find('DeletedField').length>0)
            {
                var Mensaje = $(xml).find('Mensaje').text();
                Notificacion(Mensaje);
                RepositoryDetailDT.row('tr.selected').remove().draw( false );
            }
            
            $(xml).find("Error").each(function()
            {
                var $Error=$(this);
                var mensaje=$Error.find("Mensaje").text();
                Error(mensaje);
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown) {Error(textStatus +"<br>"+ errorThrown);}
        }); 
        
    };
    
    _FormsAddNewField = function()
    {
        console.log('_AddFieldToRepository');
        
        _FormsNewField();   /* Mismos formularios utilizados en esta funcion */
        
        var buttons = {"Cancelar":function(){$(this).remove();},
        "Agregar":{text:"Agregar", click:function(){_AddNewFieldToRepository();}}};
        
        $('#DivFormsNewField').dialog('option','buttons',buttons);
    };
    
    /* Agrega un nuevo campo a un repositorio existente  */
    _AddNewFieldToRepository = function()
    {
        console.log('DivFormsNewField');
        
        var RegularExpresion = /^([a-zA-Z0-9\_])+$/g;
        var Forms = $('#DivFormsNewRepository input.FormStandart');
        var FieldsValidator = new ClassFieldsValidator();   
        var validation = FieldsValidator.ValidateFields(Forms);
        
        $('#FieldNameRM').tooltip();
        
        console.log("_AddNewFieldToRepository::"+validation);
        
        if(validation===0)
            return;             
                        
        if(!RegularExpresion.test(FieldName))
        {
            FieldsValidator.AddClassRequiredActive($('#FieldNameRM'));
            $('#FieldNameRM').attr('title','Nombre de campo invÃ¡lido');
            return 0;
        }                          
            
        var IdRepository = $('#RMSelectRepositories').val();  
        var RepositoryName = $('#RMSelectRepositories option:selected').text();
        var FieldName = $('#FieldNameRM').val();
        var FieldLength = $('#FieldLengthRM').val();
        var FieldType = $('#FieldTypeRM').val();  
        var RequiredChecValue = $('#CheckRequiredRM').is(':checked');    
        
        /* Se comprueba si no se repitan los campos */
        var RepeatedField = 0;
        RepositoryDetailDT.column(0).data().each(function(value, index)
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
                    return;
                }            
            }
            else
            {
                FieldsValidator.AddClassRequiredActive($('#FieldLengthRM'));
                    return;
            }
        }  
        
        var Xml = "<NewRepositoryField version='1.0' encoding='UTF-8'>\n\
                        <Field>\n\
                            <Name>"+FieldName+"</Name>\n\
                            <Type>"+FieldType+"</Type>\n\
                            <Length>"+FieldLength+"</Length>\n\
                            <Required>"+RequiredChecValue+"</Required>\n\
                        </Field>\n\
                   </NewRepositoryField>";
        
        var data = {opcion:"AddNewFieldToRepository", DataBaseName: EnvironmentData.DataBaseName, IdRepository:IdRepository, RepositoryName:RepositoryName, IdUser:EnvironmentData.IdUsuario, UserName: EnvironmentData.NombreUsuario, Xml:Xml};
        
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Repository.php",
        data: data, 
        success:  function(xml)
        {            
            if($.parseXML( xml )===null){Salida(xml); return 0;}else xml=$.parseXML( xml );

            if($(xml).find('AddedField').length>0)
            {
                var Mensaje = $(xml).find('Mensaje').text();
                Notificacion(Mensaje);
                
                var data = [FieldName, FieldType, FieldLength, RequiredChecValue];

                var ai = RepositoryDetailDT.row.add(data).draw();
                var n = RepositoryDetaildT.fnSettings().aoData[ ai[0] ].nTr;

            }
            
            $(xml).find("Error").each(function()
            {
                var $Error=$(this);
                var mensaje=$Error.find("Mensaje").text();
                Error(mensaje);
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown) {Error(textStatus +"<br>"+ errorThrown);}
        });       
        
    };
    
    /* Dialog que pide el xml para insertar el nuevo repositorio */
    _FormAddNewRepositoryXml = function()
    {
        $('#DivFormAddNewRepository').remove();
        $('body').append('<div id = "DivFormAddNewRepository"></div>');
        $('#DivFormAddNewRepository').append('<p>Seleccione el xml con la estructura del repositorio a insertar</p>');
        $('#DivFormAddNewRepository').append('<input type ="file" accept="text/xml" id="AddRepository_SelectFile">');
        $('#DivFormAddNewRepository').dialog({title:"Agregar Nuevo Repositorio", width:350, minWidth:150, heigth:300, minHeigth:150, modal:true, buttons:{
            "Cancelar":function(){},
            "Construir":function(){_AddNewRepositoryXml();}}
        });
    };
    
    /* Toma un xml a través de un XML */
    _AddNewRepositoryXml = function()
    {
        var xml_usuario = document.getElementById("AddRepository_SelectFile");
        var archivo = xml_usuario.files;     
        var data = new FormData();

        for(i=0; i<archivo.length; i++)
        {
            data.append('archivo',archivo[i]);
            data.append('opcion','XMLInsertRepositorio');
            data.append('IdUser',EnvironmentData.IdUsuario);
            data.append('DataBaseName',EnvironmentData.DataBaseName);
            data.append('UserName',EnvironmentData.NombreUsuario);
        } 
        
        $('#DivFormAddNewRepository').append('<div class="Loading" id = "IconWaitingNewRepository"><img src="../img/loadinfologin.gif"></div>');
        
        $.ajax({
        async:false, 
        cache:false,
        processData: false,
        contentType: false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Repository.php",
        data: data, 
        success:  function(xml){
            
            $('#DivFormAddNewRepository').remove();
            Salida(xml);
        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){Error(textStatus +"<br>"+ errorThrown);}
      });
        
    };    
};
/* Interfaz dedicada a agregar un nuevo repositorio  
 * RM = RepositoriesManager*/
ClassRepository.prototype.NewRepository = function()
{
    var self = this;
    self.AutoincrementId = 0;
    var buttons = {"Generar Repositorio":{text:"Generar Repositorio", click:function(){_BuildNewRepository();}}, "Limpiar":{text:"Limpiar", click:function(){self.NewRepository();}}};
    $('#DivRepositoriesManager').dialog("option","buttons",buttons);
    
    
    $('#WS_Repository').empty();
    $('#WS_Repository').append('<div class="titulo_ventana">Agregar un Nuevo Repositorio</div>');
    $('#WS_Repository').append('<div class="Loading" id = "IconWaitingNewRepository"><img src="../img/loadinfologin.gif"></div>');
    var Enterprise = new ClassEnterprise();
    var Enterprises = Enterprise.GetEnterprises();
    
    /* Select Empresas */
    $('#WS_Repository').append('<p>Empresa: <select id = "RMSelectEnterprises" class = "FormStandart required" FieldType = "varchar" FieldLength = "100"></select></p>');    
    $("#WS_Repository").append('<p>Nombre del Repositorio: <input type = "text" id = "RepositoryNameRM" class = "FormStandart required" FieldType = "varchar" FieldLength = "50"></p>');
    $("#RMSelectEnterprises").append("<option value='0'>Seleccione una Empresa</option>");    
    $(Enterprises).find("Enterprise").each(function()
    {
       var $Empresa=$(this);
       var id = $Empresa.find("IdEmpresa").text();
       var nombre = $Empresa.find("NombreEmpresa").text();  
       var ClaveEmpresa = $Empresa.find('ClaveEmpresa').text();
       $("#RMSelectEnterprises").append("<option value=\""+ClaveEmpresa+"\">"+ClaveEmpresa+" ("+ nombre.slice(0,60) +")</option>");                                   
    });        
    /* Fin Select */
            
    $('#WS_Repository').append('<table id = "TableFieldsNewRepository" class = "display hover"><thead><tr><th>Campo</th><th>Tipo</th><th>Longitud</th><th>Requerido</th></tr></thead></table>');  
    
    FormsNewRepositorydT = $('#TableFieldsNewRepository').dataTable(
    {
       'bPaginate':false, 'bInfo':false, bFilter: false, "bSort": false,
       "dom": 'lfTrtip',
        "tableTools": {
            "aButtons": [
                {"sExtends":"text", "sButtonText": "Agregar Campo", "fnClick" :function(){_FormsNewField();}},
                {"sExtends":"text", "sButtonText": "Editar Campo", "fnClick" :function(){_EditNewRepositoryField();}},
                {"sExtends":"text", "sButtonText": "Eliminar Campo", "fnClick" :function(){_ConfirmDeleteNewRepositoryField();}},                    
                {"sExtends":"text", "sButtonText": "Agregar Repositorio desde un XML", "fnClick" :function(){_FormAddNewRepositoryXml();}},
                {"sExtends": "copy","sButtonText": "Copiar al portapapeles"}                  
            ]
        },
        "autoWidth" : false,
        "oLanguage":LanguajeDataTable                   
    });  
        
    $('div.DTTT_container').css({"margin-top":"1em"});
    $('div.DTTT_container').css({"float":"left"});
            
    FormsNewRepositoryDT = new $.fn.dataTable.Api('#TableFieldsNewRepository');
    $('#TableFieldsNewRepository tbody').on( 'click', 'tr', function ()
        {
            FormsNewRepositoryDT.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        } );  
    $('#IconWaitingNewRepository').remove();    
};

/* Funcion invocada desde la opcion de Administrar (Consola de Repositorios) */
ClassRepository.prototype.OptionAdministrator = function()
{
    var self = this;
    
    var buttons = {};
    $('#DivRepositoriesManager').dialog('option', 'buttons', buttons);
    
    $('#WS_Repository').empty();
    $('#WS_Repository').append('<div class="titulo_ventana">Administracion de Repositorios</div>');
    $('#WS_Repository').append('<div class="Loading" id = "IconWaitingNewRepository"><img src="../img/loadinfologin.gif"></div>');
    var Enterprise = new ClassEnterprise();
    var Enterprises = Enterprise.GetEnterprises();
    
    /* Select Empresas */
    $('#WS_Repository').append('<p>Empresa: <select id = "RMSelectEnterprises" class = "FormStandart required" FieldType = "varchar" FieldLength = "100"></select></p>');    
    $("#RMSelectEnterprises").append("<option value='0'>Seleccione una Empresa</option>");  
    $('#WS_Repository').append('<p>Repositorio: <select id = "RMSelectRepositories" class = "FormStandart required" FieldType = "varchar" FieldLength = "50"></select></p>');
    $('#RMSelectRepositories').append('<option value = "0">Seleccione un repositorio</option>');
    
    $(Enterprises).find("Enterprise").each(function()
    {
       var $Empresa=$(this);
       var id = $Empresa.find("IdEmpresa").text();
       var nombre = $Empresa.find("NombreEmpresa").text();  
       var ClaveEmpresa = $Empresa.find('ClaveEmpresa').text();
       $("#RMSelectEnterprises").append("<option value=\""+ClaveEmpresa+"\" id = \""+id+"\">"+ClaveEmpresa+" ("+ nombre.slice(0,60) +")</option>");                                   
    });        
    /* Fin Select */
    
    $('#IconWaitingNewRepository').remove();
        
    $('#RMSelectEnterprises').change(function()
    {
        var EnterpriseKey = $(this).val();
        if(EnterpriseKey!=='0')
        {
            Repositories = self.GetRepositories(EnterpriseKey);
 
            /* Select con lista de repositorios de la empresa seleccionada */
            $('#RMSelectRepositories').empty().append('<option value = "0">Seleccione un repositorio...</option>');
            $('#DivRepositoryDetail').remove();
            
            if($(Repositories).find('Repository').length===0)
                $('#RMSelectRepositories').empty().append('<option value = "0">No existen repositorios...</option>');
            
            $(Repositories).find('Repository').each(function()
            {
                var IdRepository = $(this).find('IdRepositorio').text();
                var RepositoryName = $(this).find('NombreRepositorio').text();
                $('#RMSelectRepositories').append('<option value = "'+IdRepository+'">'+RepositoryName+'</option>');
            });
            
            /* Cuando el usuario seleccione un repositorio, se muestra su detalle del mismo */
            $('#RMSelectRepositories').change(function()
            {
                var IdRepository = $(this).val();
                if(IdRepository>0)
                {
                    var RepositoryName = $('#RMSelectRepositories option:selected').text();
                    var RepositoryStructure = GeStructure(RepositoryName);
                    _BuildTableRepositoryDetail(RepositoryStructure);
                }
                else    /* Elimina la tabla con el detalle del repositorio previamente seleccionado */
                    $('#DivRepositoryDetail').remove(); 
                    
            }); 
        }
        else
        {
            $('#RMSelectRepositories').empty().append('<option value = "0">Seleccione una empresa</option>');
            $('#DivRepositoryDetail').remove();
        }
    });
};

ClassRepository.prototype.BuildRepositoriesManager = function()
{
    $('#DivRepositoriesManager').remove();
    $('body').append('\n\
        <div id="DivRepositoriesManager">\n\
        <div class="menu_lateral">\n\
                <div id="accordion_repository">\n\
                    <div>\n\
                      <h3><a href="#">Repositorios</a></h3>\n\
                      <div id="consola_repository_tree">\n\
                          <table class="TableInsideAccordion">\n\
                          <tr class = "tr_RepositoryAdmin" title="Administracion">\n\
                                  <td><img src="img/RepositorioAgregar.png" ></td>\n\
                                  <td>Administrar</td>\n\
                              </tr>\n\
                              <tr class = "tr_NewRepository" title="Nuevo Repositorio">\n\
                                  <td><img src="img/RepositorioAgregar.png" ></td>\n\
                                  <td>Nuevo</td>\n\
                              </tr>\n\
                              <tr class = "tr_RepositoryDetail" title="Nuevo Repositorio">\n\
                                  <td><img src="img/RepositorioAgregar.png" ></td>\n\
                                  <td>Detalle</td>\n\
                              </tr>\n\
                          </table>\n\
                      </div>\n\
                    </div>\n\
                </div>\n\
        </div>\n\
        <div class="work_space" id="WS_Repository"></div>\n\
    </div>');
    
    $('.tr_NewRepository').click(function()
    {
        var Repositories = new ClassRepository();
        Repositories.NewRepository();
    });   
    
    $('.tr_RepositoryAdmin').click(function()
    {
        var classRepository = new ClassRepository();
        classRepository.OptionAdministrator();
    });
    
    $('.tr_RepositoryDetail').click(function()
    {
        CM_Repository();
    });
    
     $("#accordion_repository").accordion({ header: "h3", collapsible: true,heightStyle: "content" });
     $('#DivRepositoriesManager').dialog(ConsoleSettings,{ title:"Consola de Repositorios",close:function(){$(this).remove();}}).dialogExtend(BotonesWindow);
    
       /********* Efectos sobre tabla dentro de acordeÃ³n ***********/
    $('#DivRepositoriesManager table').on( 'click', 'tr', function ()
    {
        var active = $('#DivRepositoriesManager table tr.TableInsideAccordionFocus');                
        $('#DivRepositoriesManager table tr').removeClass('TableInsideAccordionFocus');
        $('#DivRepositoriesManager table tr').removeClass('TableInsideAccordionActive');
        $(active).addClass('TableInsideAccordionFocus');
        $(this).removeClass('TableInsideAccordionHoverWithoutClass');
        $(this).addClass('TableInsideAccordionActive');     
    });
    $('#DivRepositoriesManager table tr').hover(function()
    {
        if($(this).hasClass('TableInsideAccordionActive') || $(this).hasClass('TableInsideAccordionFocus'))
            $(this).addClass('TableInsideAccordionHoverWithClass');
        else
            $(this).addClass('TableInsideAccordionHoverWithoutClass');
    });
    $('#DivRepositoriesManager table tr').mouseout(function()
    {
        if($(this).hasClass('TableInsideAccordionActive') || $(this).hasClass('TableInsideAccordionFocus'))
            $(this).removeClass('TableInsideAccordionHoverWithClass');
        else
            $(this).removeClass('TableInsideAccordionHoverWithoutClass');
    });
    
    $('#tr_NewUser').addClass('TableInsideAccordionActive');
    /* Fin de Efectos  */
    
    
    CM_Repository();
    
    $('.tr_RepositoryAdmin').click();
    
};

ClassRepository.prototype.GetRepositories = function(EnterpriseKey)
{
    var RepositoriesXml = 0;
    var data = {opcion:"GetListRepositories", EnterpriseKey:EnterpriseKey};
    $.ajax({
    async:false, 
    cache:false,
    dataType:"html", 
    type: 'POST',   
    url: "php/Repository.php",
    data: data, 
    success:  function(xml)
    {            
        if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );

        RepositoriesXml = xml;

        $(xml).find("Error").each(function()
        {
            var $Error=$(this);
            var mensaje=$Error.find("Mensaje").text();
            Error(mensaje);
        });                 

    },
    beforeSend:function(){},
    error: function(jqXHR, textStatus, errorThrown) {Error(textStatus +"<br>"+ errorThrown);}
    });             

    return RepositoriesXml;
};        

/*******************************************************************************
 * Muestra el Arbol de Empresas y Repositorios
 * @returns {undefined}
 */
function CM_Repository()
{
    var buttons = {};
    $('#DivRepositoriesManager').dialog("option","buttons",buttons); /* Se eliminan los botones de la ventana de dialogo */
    
    $('#WS_Repository').empty();
    $('#WS_Repository').append('<div class="titulo_ventana">Estructura de Repositorio</div>');    
    $('#tree_repository').remove();
    $('#consola_repository_tree').append('<div id="tree_repository"></div>');
    $('#tree_repository').append('<ul><li id="Tree_Repository" class="folder expanded " data="icon: \'database.png\'">'+EnvironmentData.DataBaseName+'<ul id="Tree_Repository_"></ul></ul>');
    
    ajax=objetoAjax();
    ajax.open("POST", 'php/Tree.php',true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8;");
    ajax.send("opcion=GetListReposity&DataBaseName="+EnvironmentData.DataBaseName);    
    ajax.onreadystatechange=function() 
    {
        if (ajax.readyState===4 && ajax.status===200) 
       { 
           if(ajax.responseXML===null){Error(ajax.responseText);return;}                  
            var xml=ajax.responseXML;           
            /* Div que contiene el ÃƒÂ¡rbol de repositorios */
            
            var ArrayDirectories=new Array();
             var cont=0;
           $(xml).find("Empresas").each(function()
            {                
               var $Empresas=$(this);
                var ClaveEmpresa=$Empresas.find("ClaveEmpresa").text();
                var NombreEmpresa = $Empresas.find("NombreEmpresa").text();
                var IdEmpresa = $Empresas.find("IdEmpresa").text();
                var Index=ArrayDirectories.indexOf(IdEmpresa);
                /* Comprobaciónn para no repetir empresas */
               if(Index == (-1)) 
               {
                   ArrayDirectories[IdEmpresa]=IdEmpresa;
                   $('#Tree_Repository_').append('<li id="'+ClaveEmpresa+'" class="unselectable expanded folder" data="icon: \'enterprise.png\'">'+NombreEmpresa+'<ul id="'+ClaveEmpresa+'_"></ul>');
               }               
            });            
                                    
            $(xml).find("Repositorios").each(function()
            {                           
               var $Repositorios=$(this);
                var ClaveEmpresa=$Repositorios.find("EmpresaClaveEmpresa").text();
                var NombreRepositorio = $Repositorios.find("NombreRepositorio").text();
                var IdRepositorio = $Repositorios.find("IdRepositorio").text();
//                $('#'+ClaveEmpresa+'_').append('<li id="'+IdRepositorio+'" class="folder">'+NombreRepositorio+'<ul id="'+IdRepositorio+'_"></ul>');
                $('#'+ClaveEmpresa+'_').append('<li id="'+IdRepositorio+'" data="icon: \'Repositorio.png\'">'+NombreRepositorio+'<ul id="'+IdRepositorio+'_"></ul>');
            });
            /*************** Al Activar un Nodo del Arbol ************
             * ****** Se muestra la tabla con los campos de la estructura******/
            
            $("#tree_repository").dynatree({onActivate: function(node) {                    
                if(node.data.key>0) /* CondiciÃƒÂ³n que solo cumplen los repositorios en este ÃƒÂ¡rbol */
                {
                    var buttons = {};
                    $('#DivRepositoriesManager').dialog("option","buttons",buttons); /* Se eliminan los botones de la ventana de dialogo */
                    $('#TableStructureRepositorios').remove();
                    $('#WS_Repository').empty();
                    $('#WS_Repository').append('<div class="titulo_ventana">Estructura de Repositorio</div>'); 
                    $('#WS_Repository').append('<table id="TableStructureRepositorios" class="TablaPresentacion"><thead><tr><th>Nonbre del Campo</th><th>Tipo de Campo</th><th>Longitud</th><th>Requerido</th></tr></thead></table>');
                    /* SetTableStructura es una funciÃƒÂ³n localizada en Designer.js */
                    SetTableStructura(node.data.title,'TableStructureRepositorios',1);
                }
                    
            }});
                                    
            $(xml).find("Error").each(function()
            {
                var $Instancias=$(this);
                var estado=$Instancias.find("Estado").text();
                var mensaje=$Instancias.find("Mensaje").text();
                Error(mensaje);
            });
        }
    };        
}
