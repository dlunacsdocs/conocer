/*
 * ------------------------------------------------------------------------------------------------------
 * @type @call;$@call;dataTable
 * Clase que administra los Grupos de Usuario (Creación, modificación, borrado y  permisos por grupo)
 ---------------------------------------------------------------------------------------------------------*/

/* global EnvironmentData, BotonesWindow, OptionDataTable, Repository, Tree, LanguajeDataTable, BootstrapDialog */

/* Clase invocada desde el script Usuarios.js */
var ClassUsersGroups = function()
{
    var self = this;
    var IdGrupo = undefined;
    var NombreGrupo = undefined;    
    var Descripcion = undefined;  
    var TableUsersWithoutGroupDT;
    var TableUsersWithoutGroupdT;
    var TableGroupsdT;
    var TableGroupsDT;
    var TableGroupMembersdT;
    var TableGroupMembersDT;
    
    this.ShowsGroupsUsers = function()
    {
        var self = this;
       
        var Buttons = {};
        $('#div_consola_users').dialog('option','buttons',Buttons);
       
        $('#WS_Users').empty();       
        $('#WS_Users').append('<div class="titulo_ventana">Grupos de Usuario</div>');
        $('#WS_Users').append('<table id="TableUsersGroups" class="table table-striped table-bordered table-hover table-condensed"><thead><tr><th>Nombre del Grupo</th><th>Descripción</th></tr></thead><tbdoy></tbody></table>');
       
        var permissions = new ClassPermissions();
       
        TableGroupsdT = $('#TableUsersGroups').dataTable({"sDom": 'lfTrtip',
            "bInfo":false, "autoWidth" : false, "oLanguage":LanguajeDataTable,
            "tableTools": {
                "aButtons": [
                    {"sExtends":"text", "sButtonText": "Crear", "fnClick" :function(){_NewGroup();}},
                    {"sExtends":"text", "sButtonText": "Editar", "fnClick" :function(){_ShowGroupData();}},
                    {"sExtends":"text", "sButtonText": "Eliminar", "fnClick" :function(){_ConfirmDelete();}},
                    {"sExtends":"text", "sButtonText": "Miembros", "fnClick" :function(){_Members();}},
                    {"sExtends":"text", "sButtonText": "Permisos", "fnClick" :function(){permissions.showPermissionsPanel(IdGrupo, NombreGrupo);}},
                    {
                        "sExtends":    "collection",
                        "sButtonText": "Exportar...",
                        "aButtons":    [ "csv", "xls", "pdf", "copy" ]
                    }                          
                ]
             }    });    

        TableGroupsDT = new $.fn.dataTable.Api('#TableUsersGroups');
       
        var userGroups = self.getUserGroups();
        _BuildTableGroups(userGroups);
    };

    _BuildTableGroups = function(xml)
    {            
        $(xml).find("Grupo").each(function()
        {               
           var $Grupo=$(this);
           var IdGrupo=$Grupo.find("IdGrupo").text();
           var NombreGrupo=$Grupo.find("Nombre").text();           
           var Descripcion=$Grupo.find("Descripcion").text();

           var data = 
           [
                NombreGrupo,
                Descripcion
           ];   

        var ai = TableGroupsDT.row.add(data).draw();
        var n = TableGroupsdT.fnSettings().aoData[ ai[0] ].nTr;
        n.setAttribute('id',IdGrupo);

        });
        
        $('.LoadingGroups').remove();
                
        _ClickOnRowGroupsTable();
        
        TableGroupsdT.find('tbody tr:eq(0)').click();  /* Activa la primera fila  */
    };
    
    /**
     * @description Obtiene el listado de Grupos de Usuario.
     * @returns {xml Grupos de Usuario.}
     */
    this.getUserGroups = function(){
        var userGroups = null;
        
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/GruposUsuario.php",
        data: "opcion=GetUsersGroups", 
        success:  function(xml)
        {           
            if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );

            if($(xml).find("Grupo").length>0)
                userGroups = xml;

            $(xml).find("Error").each(function()
            {
                var $Error=$(this);
                var estado=$Error.find("Estado").text();
                var mensaje=$Error.find("Mensaje").text();
                Error(mensaje);
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){
                    errorMessage(textStatus +"<br>"+ errorThrown);
                }
        });       
        
        return userGroups;
    };
    
    _NewGroup = function(){     
        
        var content = $('<div>');
        var formGroup = $('<div>',{class:"form-group"});
        var groupNameLabel = $('<label>').append("Nombre");
        var groupNameForm = $('<input>',{type:"text", id:"NewGroup_Nombre", class:"form-control", FieldType: "varchar", FieldLength: "50"});
        formGroup.append(groupNameLabel);
        formGroup.append(groupNameForm);
        content.append(formGroup);
        
        formGroup = $('<div>',{class:"form-group"});
        var groupDescriptionLabel = $('<label>').append("Descripción");
        var groupDescriptionForm = $('<input>',{type:"text", class:"form-control", id:"NewGroup_Descripcion", FieldType: "text"});
        formGroup.append(groupDescriptionLabel);
        formGroup.append(groupDescriptionForm);
        content.append(formGroup);
        
        BootstrapDialog.show({
            title: 'Nuevo Grupo de Usuarios',
            size: BootstrapDialog.SIZE_SMALL,
            message: content,
            closable: true,
            closeByBackdrop: true,
            closeByKeyboard: true,
            buttons: [
                {
                    label: 'Agregar',
                    cssClass:"btn-primary",
                    action: function(dialogRef){     
                        var button = this;
                        button.spin();
                        button.disable();
                        _AddNewGroup(dialogRef);
                        
                    }
                }
            ],
            onshown: function(dialogRef){
                $('#NewGroup_Nombre').focus();
                var modalBody = dialogRef.getModalBody();
                
                var Forms = modalBody.find('input');
                var FieldsValidator = new ClassFieldsValidator();   
                FieldsValidator.InspectCharacters(Forms);
            }
        });

    };
    
    var _AddNewGroup = function(dialogRef){
        var self = this;                               

        var modalBody = dialogRef.getModalBody();
        var Forms = modalBody.find('input');
        var FieldsValidator = new ClassFieldsValidator();   
        var validation = FieldsValidator.ValidateFields(Forms);
        console.log("Validación campos Agregar nuevo Grupo "+ NombreGrupo +" "+validation);
        if(validation===0)
            return 0;
                    
        var name = $('#NewGroup_Nombre').val();
        var description = $('#NewGroup_Descripcion').val();
        
        if(String(name).length === 0)
            return Advertencia("El campo <b>Nombre</b> es obligatorio");
        
        
        $.ajax({
        async:true, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/GruposUsuario.php",
        data: {"opcion":"NewGroup", name:name, description:description}, 
        success:  function(xml)
        {           
            dialogRef.close();
            if($.parseXML( xml )===null){errorMessage(xml); return 0;}else xml=$.parseXML( xml );

            $(xml).find("NewGroup").each(function()
            {
                var IdGrupo = $(this).find("IdGrupo").text();
                var Nombre = $(this).find("Nombre").text();
                var Descripcion = $(this).find("Descripcion").text();
                var data = 
                [
                    Nombre,
                    Descripcion
                ];
                       
                var ai = TableGroupsDT.row.add(data).draw();
                var n = TableGroupsdT.fnSettings().aoData[ ai[0] ].nTr;
                n.setAttribute('id',IdGrupo);
                
                TableGroupsdT.find('tbody tr[id='+IdGrupo+']:eq(0)').click();  /* Activa la nueva fila insertada */
                Notificacion($(this).find("Mensaje").text());
                $('.AddNewGroup').dialog('close');
            });
            
            $(xml).find('SystemAlert').each(function()
            {
                var Mensaje = $(this).find("Mensaje").text();
                $('#NewGroup_Nombre').attr('title',Mensaje);
                if(!$('#NewGroup_Nombre').hasClass('RequiredActivo'))
                        $('#NewGroup_Nombre').addClass('RequiredActivo');
                    
            });
            
            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                Error(mensaje);
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){
            errorMessage(textStatus +"<br>"+ errorThrown);
            dialogRef.close();
        }
        });       
    };
    
    _ShowGroupData = function()
    {
        if(!(_CheckActiveGroup()))
            return 0;      
        
        var content = $('<div>');
        var formGroup = $('<div>',{class:"form-group"});
        var groupNameLabel = $('<label>').append("Nombre");
        var groupNameForm = $('<input>',{type:"text", id:"NewGroup_Nombre", class:"form-control", FieldType: "varchar", FieldLength: "50", value:NombreGrupo});
        formGroup.append(groupNameLabel);
        formGroup.append(groupNameForm);
        content.append(formGroup);
        
        formGroup = $('<div>',{class:"form-group"});
        var groupDescriptionLabel = $('<label>').append("Descripción");
        var groupDescriptionForm = $('<input>',{type:"text",class:"form-control", id:"NewGroup_Descripcion", FieldType: "text", value:Descripcion});
        formGroup.append(groupDescriptionLabel);
        formGroup.append(groupDescriptionForm);
        content.append(formGroup);
        
        BootstrapDialog.show({
            title: 'Información del Grupo '+NombreGrupo,
            size: BootstrapDialog.SIZE_SMALL,
            message: content,
            buttons: [
                {
                    label: 'Cerrar',
                    action: function(dialogRef){
                        dialogRef.close();
                    }
                },
                {
                    label: 'Modificar',
                    cssClass:"btn-warning",
                    action: function(dialogRef){     
                        var button = this;
                        
                        BootstrapDialog.show({
                            title: 'Mensaje de Confirmación',
                            size: BootstrapDialog.SIZE_SMALL,
                            type: BootstrapDialog.TYPE_WARNING,
                            message: "¿Realmente desea Cambiar la información?",
                            buttons: [
                                {
                                    label: 'Cancelar',
                                    action: function(confirmDialog){
                                        confirmDialog.close();
                                    }
                                },
                                {
                                    label: 'Modificar',
                                    cssClass:"btn-warning",
                                    action: function(confirmDialog){   
                                        button.spin();
                                        button.disable();
                                        confirmDialog.close();
                                        _ModifyGroup(dialogRef);
                                        button.disable();
                                        dialogRef.close();
                                    }
                                }
                            ],
                            onshown: function(dialogRef){

                            }
                        });
                        
                    }
                }
            ],
            onshown: function(dialogRef){
                $('#NewGroup_Nombre').focus();
                var modalBody = dialogRef.getModalBody();
                
                var Forms = modalBody.find('input');
                var FieldsValidator = new ClassFieldsValidator();   
                FieldsValidator.InspectCharacters(Forms);
            }
        });
                   
    };
    
  
    var _ModifyGroup = function(dialogRef)
    {
        var modalBody = dialogRef.getModalBody();
        var Forms = modalBody.find('input');
        var FieldsValidator = new ClassFieldsValidator();   
        var validation = FieldsValidator.ValidateFields(Forms);
        
        console.log("Validación campos Modificar Grupo "+NombreGrupo +" "+validation);
        
        if(validation===0)
            return 0;
                    
        var name = $('#NewGroup_Nombre').val();
        var description = $('#NewGroup_Descripcion').val();
        
        if(String(name).length === 0)
            return Advertencia("El campo <b>Nombre</b> es obligatorio");
                        
        $.ajax({
        async:true, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/GruposUsuario.php",
        data: {"opcion":"ModifyGroup", NewGroupName:name, NewGroupDescription:description, NombreGrupo:NombreGrupo, IdGroup:IdGrupo}, 
        success:  function(xml)
        {           
            $('#UsersPlaceWaiting').remove();
            if($.parseXML( xml )===null){errorMessage(xml); return 0;}else xml=$.parseXML( xml );

            $(xml).find("Modify").each(function()
            {
                
                var Nombre = $(this).find('Nombre').text();
                var Descripcion = $(this).find('Descripcion').text();
                
                TableGroupsdT.$('tr.selected').each(function()
                {
                    var position = TableGroupsdT.fnGetPosition(this); // getting the clicked row position
                    TableGroupsdT.fnUpdate([Nombre],position,0,false);
                    TableGroupsdT.fnUpdate([Descripcion],position,1,false);                
                    TableGroupsdT.find('tbody tr[id='+IdGrupo+']:eq(0)').click();  /* Activa la nueva fila insertada */
                });
                                    
                var Mensaje = $(this).find("Mensaje").text();
                Notificacion(Mensaje);
                
                $('.DivEditGroup').dialog('destroy');
                
            });       
            
            $(xml).find('Duplicate').each(function()
            {
                var Mensaje = $(this).find('Mensaje').text();
                Advertencia(Mensaje);
            });
            
            $(xml).find('SystemAlert').each(function()
            {
                var Mensaje = $(this).find("Mensaje").text();
                $('#NewGroup_Nombre').attr('title',Mensaje);
                if(!$('#NewGroup_Nombre').hasClass('RequiredActivo'))
                        $('#NewGroup_Nombre').addClass('RequiredActivo');
            });

            $(xml).find("Error").each(function()
            {
                var $Error=$(this);
                var estado=$Error.find("Estado").text();
                var mensaje=$Error.find("Mensaje").text();
                errorMessage(mensaje);
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){$('#UsersPlaceWaiting').remove(); errorMessage(textStatus +"<br>"+ errorThrown);}
        });          
    };
    
    _ConfirmDelete = function()
    {        
        var self = this;
        
        if(!(_CheckActiveGroup()))
            return 0;
        
        BootstrapDialog.show({
            title: 'Mensaje de Confirmación',
            size: BootstrapDialog.SIZE_SMALL,
            type: BootstrapDialog.TYPE_DANGER,
            message: '<p>Realmente desea eliminar el Grupo <b>'+NombreGrupo+'</b></p>',
            buttons: [
                {
                    label: 'Cerrar',
                    action: function(dialogRef){
                        dialogRef.close();
                    }
                },
                {
                    label: 'Eliminar',
                    cssClass:"btn-danger",
                    action: function(dialogRef){     
                        var button = this;
                        button.spin();
                        button.disable();
                         _DeleteGroup();
                         dialogRef.close();
                    }
                }
            ],
            onshown: function(dialogRef){
               
            }
        });
                          
    };
    
    var _DeleteGroup = function()
    {        
        $('#WS_Users').append('<div class="PlaceWaiting" id = "UsersPlaceWaiting"><img src="../img/loadinfologin.gif"></div>');
        
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/GruposUsuario.php",
        data: 'opcion=DeleteGroup&idGroup='+IdGrupo+'&groupName='+NombreGrupo, 
        success:  function(xml)
        {           
            $('#UsersPlaceWaiting').remove();
            if($.parseXML( xml )===null){errorMessage(xml); return 0;}else xml=$.parseXML( xml );

            $(xml).find("Deleted").each(function()
            {
                var Mensaje = $(this).find("Mensaje").text();
                TableGroupsDT.row('tr[id='+IdGrupo+']').remove().draw( false );
                Notificacion(Mensaje);
                TableGroupsdT.find('tbody tr:eq(0)').click();  /* Activa la primera fila  */
            });                             

            $(xml).find("Error").each(function()
            {
                var $Error=$(this);
                var estado=$Error.find("Estado").text();
                var mensaje=$Error.find("Mensaje").text();
                errorMessage(mensaje);
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){$('#UsersPlaceWaiting').remove(); errorMessage(textStatus +"<br>"+ errorThrown);}
        });          
    };
        
   
    _Members = function()
    {
        if(!(_CheckActiveGroup()))
            return 0;
        
        var table = $('<table>',{id:"GroupMembers",class:"table table-striped table-bordered table-hover table-condensed"});
        var thead = $('<thead>').append("<tr><th>Usuario</th><th>Descripción</th></tr>");
        table.append(thead);
        
        BootstrapDialog.show({
            title: 'Integrantes del grupo '+NombreGrupo,
            size: BootstrapDialog.SIZE_NORMAL,
            message: table,
            buttons: [

            ],
            onshown: function(dialogRef){
                TableGroupMembersdT = $('#GroupMembers').dataTable({
                    "sDom": 'lfTrtip',
                    "bInfo":false, "autoWidth" : false, "oLanguage":LanguajeDataTable,
                    "tableTools": {
                        "aButtons": [
                            {"sExtends":"text", "sButtonText": "Agregar", "fnClick" :function(){_ShowUsersWithoutGroup();}},
                            {"sExtends":"text", "sButtonText": "Quitar", "fnClick" :function(){_ConfirmDeleteGroupMembers();}},
                            {
                                "sExtends":    "collection",
                                "sButtonText": "Exportar...",
                                "aButtons":    [ "csv", "xls", "pdf", "copy" ]
                            }                          
                        ]
                    }    });  
                
                TableGroupMembersDT = new $.fn.dataTable.Api('#GroupMembers');

                var XmlGruposUsuario = _GetGroupMemebers();

                $(XmlGruposUsuario).find("Member").each(function()
                {
                    var IdUsuario = $(this).find('IdUsuario').text();
                    var NombreUsuario = $(this).find('Login').text();
                    var Descripcion = $(this).find('Descripcion').text();

                    var Data = [NombreUsuario, Descripcion];

                    var ai = TableGroupMembersDT.row.add(Data).draw();
                    var n = TableGroupMembersdT.fnSettings().aoData[ ai[0] ].nTr;
                    n.setAttribute('id',IdUsuario);
                });   
                
                $('#GroupMembers tbody').on( 'click', 'tr', function () {
                    $(this).toggleClass('selected');
                });  
                
            }
               
        });
        
    };
    
    var _GetGroupMemebers = function()
    {
        var Integrantes = 0;
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/GruposUsuario.php",
        data: "opcion=GetGroupMemebers&DataBaseName="+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&NombreUsuario='+EnvironmentData.NombreUsuario+'&IdGrupo='+EnvironmentData.IdGrupo+ "&NombreGrupo = "+ EnvironmentData.NombreGrupo+"&IdGrupoUsuario="+IdGrupo+"&NombreGrupoUsuario="+NombreGrupo, 
        success:  function(xml)
        {            
            if($.parseXML( xml )===null){$('#UsersPlaceWaiting').remove(); errorMessage(xml); return 0;}else xml=$.parseXML( xml );         
            
            if($(xml).find("Member").length>0)
                Integrantes = xml;

            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                errorMessage(mensaje);
                $('#UsersPlaceWaiting').remove();
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){$('#UsersPlaceWaiting').remove(); errorMessage(textStatus +"<br>"+ errorThrown);}
        });   
        
        return Integrantes;
    };
    
    var _ShowUsersWithoutGroup = function()
    {
        if(!(_CheckActiveGroup()))
            return 0;
        
        var table = $('<table>',{id:"UsersWithoutGroup", class:"table table-striped table-bordered table-hover table-condensed"});
        var thead = $('<thead>').append('<tr><th>Usuario</th><th>Descripción</th></tr>');
        table.append(thead);
        
        BootstrapDialog.show({
            title: 'Usuarios sin grupo',
            size: BootstrapDialog.SIZE_NORMAL,
            type: BootstrapDialog.TYPE_INFO,
            message: table,
            buttons: [
                {
                    label: 'Cerrar',
                    action: function(dialogRef){
                        dialogRef.close();
                    }
                },
                {
                    label: 'Agregar',
                    cssClass:"btn-primary",
                    action: function(dialogRef){     
                        var button = this;
                        button.spin();
                        button.disable();
                        _AddUsersToGroup();
                        dialogRef.close();
                    }
                }
            ],
            onshown: function(dialogRef){
                TableUsersWithoutGroupdT = $('#UsersWithoutGroup').dataTable({
                    "sDom": 'lfTrtip',
                    "bInfo":false, "autoWidth" : false, "oLanguage":LanguajeDataTable,
                    "tableTools": {
                        "aButtons": [
                            {
                                "sExtends":    "collection",
                                "sButtonText": "Exportar...",
                                "aButtons":    [ "csv", "xls", "pdf", "copy" ]
                            }                          
                        ]
                    } });  
                TableUsersWithoutGroupDT = new $.fn.dataTable.Api('#UsersWithoutGroup');

                var XmlUsers = _GetUsersWithoutGroup();

                $(XmlUsers).find("Member").each(function()
                {
                    var IdUsuario = $(this).find('IdUsuario').text();
                    var NombreUsuario = $(this).find('Login').text();
                    var Descripcion = $(this).find('Descripcion').text();

                    var Data = [NombreUsuario, Descripcion];

                    var ai = TableUsersWithoutGroupDT.row.add(Data).draw();
                    var n = TableUsersWithoutGroupdT.fnSettings().aoData[ ai[0] ].nTr;
                    n.setAttribute('id',IdUsuario);
                });
                
                $('#UsersWithoutGroup tbody').on( 'click', 'tr', function () {
                    $(this).toggleClass('selected');
                });  
            }
        });

    };
    
    var _GetUsersWithoutGroup = function()
    {
        var Users = 0;
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/GruposUsuario.php",
        data: "opcion=GetUsersWithoutGroup&DataBaseName="+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&NombreUsuario='+EnvironmentData.NombreUsuario+'&IdGrupo='+EnvironmentData.IdGrupo, 
        success:  function(xml)
        {            
            if($.parseXML( xml )===null){$('#UsersPlaceWaiting').remove(); errorMessage(xml); return 0;}else xml=$.parseXML( xml );         
            
            if($(xml).find("Member").length>0)
                Users = xml;

            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                errorMessage(mensaje);
                $('#UsersPlaceWaiting').remove();
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){$('#UsersPlaceWaiting').remove(); errorMessage(textStatus +"<br>"+ errorThrown);}
        });   
        
        return Users;
    };
    
    var _AddUsersToGroup = function()
    {
        $('.PanelUsersWithoutGroup').append('<div class="PlaceWaiting" id = "UsersPlaceWaiting"><img src="../img/loadinfologin.gif"></div>');

        var UsersXml = "<Users version='1.0' encoding='UTF-8'>";
        $('#UsersWithoutGroup tr.selected').each(function ()
        {
            var position = TableUsersWithoutGroupdT.fnGetPosition(this); 
            var Login = TableUsersWithoutGroupdT.fnGetData(position)[0];
            var Descripcion = TableUsersWithoutGroupdT.fnGetData(position)[1];
            var IdUsuario = $(this).attr('id');    
            UsersXml+= "<User>\n\
                            <IdUsuario>"+IdUsuario+"</IdUsuario>\n\
                            <Login>"+Login+"</Login>\n\
                            <Descripcion>"+Descripcion+"</Descripcion>\n\
                        </User>";            
        } );  
        
        UsersXml+="</Users>";
                     
        if(!($('#UsersWithoutGroup tr.selected').length>0))
        {
            $('.PanelUsersWithoutGroup').dialog('destroy');
            $('#UsersPlaceWaiting').remove();
            return 0;
        }
                    
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/GruposUsuario.php",
        data: "opcion=AddUsersToGroup&DataBaseName="+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&NombreUsuario='+EnvironmentData.NombreUsuario+'&IdGrupo='+IdGrupo+'&NombreGrupo='+NombreGrupo+'&UsersXml='+UsersXml, 
        success:  function(xml)
        {           
            $('#UsersPlaceWaiting').remove();
            $('.PanelUsersWithoutGroup').dialog('destroy');
            if($.parseXML( xml )===null){errorMessage(xml); return 0;}else xml=$.parseXML( xml );

            $(xml).find("Added").each(function()
            {
                var IdUsuario = $(this).find("IdUsuario").text();
                var Login = $(this).find("Login").text();
                var Descripcion = $(this).find("Descripcion").text();
                var data = 
                [
                    Login,
                    Descripcion
                ];
                       
                var ai = TableGroupMembersDT.row.add(data).draw();
                var n = TableGroupMembersdT.fnSettings().aoData[ ai[0] ].nTr;
                n.setAttribute('id',IdUsuario);
            });
            
            var Mensaje = $(xml).find("Mensaje").text();
            if(Mensaje.length>0)
                Notificacion(Mensaje);

            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                errorMessage(mensaje);
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){$('#UsersPlaceWaiting').remove(); errorMessage(textStatus +"<br>"+ errorThrown);}
        });          
        
    };
    
    var _ConfirmDeleteGroupMembers = function()
    {
        BootstrapDialog.show({
            title: 'Quitar integrantes de '+NombreGrupo,
            size: BootstrapDialog.SIZE_SMALL,
            type: BootstrapDialog.TYPE_DANGER,
            message: "<p>Se eliminararán los usuarios seleccionados del grupo <b>"+NombreGrupo+"</b>. ¿Desea continuar?</p>",
            buttons: [
                {
                    label:"Eliminar",
                    action:function(dialogRef){
                        var button = this;
                        button.spin();
                        button.disable();
                        _DeleteGroupMembers();
                        dialogRef.close();
                    }
                }
            ],
            onshown: function(dialogRef){
     
            }
        });
        
    };
    
    var _DeleteGroupMembers = function()
    {                
        var UsersXml = "<Users version='1.0' encoding='UTF-8'>";
        $('#GroupMembers tr.selected').each(function ()
        {
            var position = TableGroupMembersdT.fnGetPosition(this); 
            var Login = TableGroupMembersdT.fnGetData(position)[0];
            var IdUsuario = $(this).attr('id');    
            UsersXml+= "<User>\n\
                            <IdUsuario>"+IdUsuario+"</IdUsuario>\n\
                            <Login>"+Login+"</Login>\n\
                        </User>";               
        } );  
        
        UsersXml+="</Users>";
                     
        if(!($('#GroupMembers tr.selected').length>0))
        {
            $('#UsersPlaceWaiting').remove();
            return 0;
        }
                    
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/GruposUsuario.php",
        data: "opcion=DeleteGroupMembers&DataBaseName="+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&NombreUsuario='+EnvironmentData.NombreUsuario+'&IdGrupo='+IdGrupo+'&NombreGrupo='+NombreGrupo+'&UsersXml='+UsersXml, 
        success:  function(xml)
        {           
            if($.parseXML( xml )===null){errorMessage(xml); return 0;}else xml=$.parseXML( xml );

            $(xml).find("Deleted").each(function()
            {
                var IdUsuario = $(this).find('IdUsuario').text();
                TableGroupMembersDT.row('tr[id='+IdUsuario+']').remove().draw( false );                
            });     
                       
            var Mensaje = $(xml).find("Mensaje").text();
            if(Mensaje.length>0)
                Notificacion(Mensaje);

            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                errorMessage(mensaje);
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){ errorMessage(textStatus +"<br>"+ errorThrown);}
        });          
    };
    
    var _CheckActiveGroup = function()
    {        
        if(!IdGrupo>0)
        {
            Advertencia("<p>Debe seleccionar un grupo de usuarios</p>");
            return 0;
        }
        else
            return 1;                
    };
    
    var _ClickOnRowGroupsTable = function()
    {
        $('#TableUsersGroups tbody').on( 'click', 'tr', function ()
        {
            TableGroupsDT.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            var IdRow = $('#TableUsersGroups tr.selected').attr('id');              
            var position = TableGroupsdT.fnGetPosition(this); // getting the clicked row position
            IdGrupo = IdRow;
            NombreGrupo = TableGroupsdT.fnGetData(position)[0];
            Descripcion = TableGroupsdT.fnGetData(position)[1];
        } );  
    };
};  /* Fin de clase */ 
