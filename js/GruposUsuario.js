/*
 * ------------------------------------------------------------------------------------------------------
 * @type @call;$@call;dataTable
 * Clase que administra los Grupos de Usuario (Creación, modificación, borrado y  permisos por grupo)
 ---------------------------------------------------------------------------------------------------------*/

/* global EnvironmentData, BotonesWindow, OptionDataTable, Repository, Tree */

var TableGroupsdT;
var TableGroupsDT;
var TableGroupMembersdT;
var TableGroupMembersDT;
var TableAddUsersToGroupdT;
var TableAddUsersToGroupTD;
var TableUsersWithoutGroupdT;
var TableUsersWithoutGroupDT;

var ChangesPermissionsFlag = 0;
var ChangesRepositoryAccess = 0;
/* Clase invocada desde el script Usuarios.js */
var ClassUsersGroups = function()
{
    var self = this;
    this.IdGrupo = undefined;
    this.NombreGrupo = undefined;    
    this.Descripcion = undefined;       
   
    _ShowsGroupsHierarchy = function()
    {
        $('.DivHierarchy').remove();
        $('body').append('<div class = "DivHierarchy" style = "display:none"><div class = "titulo_ventana">Jerarquía</div></div>');               
        $('.DivHierarchy').append('<div class = "TreeSpace"><div id = "HierarchyTree"></div></div> <div id = "WSHierarchyTree" class = "WorkSpaceWithTree"></div>');
        
        $('#HierarchyTree').append('<ul><li id = "TH_00" data = "icon: \'user.png\'" class = "folder"> Marco <ul id = "TH_0"></ul></ul>');        
        $('#TH_0').append('<li id="MSR_1" class="folder" data="icon: \'user.png\'">Eduardo<ul id="1_MSR"></ul>');             
        $('#TH_0').append('<li id="MSR_2" class="folder" data="icon: \'user.png\'">Fernanda<ul id="2_MSR"></ul>');
        $('#TH_0').append('<li id="MSR_3" class="folder" data="icon: \'user.png\'">Rocio<ul id="3_MSR"></ul>');
                 
        $('#HierarchyTree').dynatree({generateIds: false, expand: true, minExpandLevel: 3,
            onFocus: function(node, event)
            {
                
            }
        });                
        $('.DivHierarchy').dialog({title:"Jerarquía del Grupo "+this.NombreGrupo, width:(($(window).width())-100), height:500, minWidth:500, minHeight:400}).dialogExtend(BotonesWindow);
        
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
    
    _NewGroup = function()
    {        
        $('.AddNewGroup').remove();
        $('body').append('<div class = "AddNewGroup"></div>');        
        $('.AddNewGroup').append('<div class = "titulo_ventana">Información del Nuevo Grupo</div><table id = "TableNewGroup"></table>');
        $('#TableNewGroup').append('<tr><td>Nombre</td><td><input type = "text" name = "Nombre" id = "NewGroup_Nombre" class = "required FormStandart" FieldType = "varchar" FieldLength = "50"></td></tr>');
        $('#TableNewGroup').append('<tr><td>Descripción</td><td><input type = "text" name = "Descripcion" id = "NewGroup_Descripcion" class = "FormStandart" FieldType = "text"></td></tr>');
        
        var Forms = $('.AddNewGroup input.FormStandart');
        var FieldsValidator = new ClassFieldsValidator();   
        FieldsValidator.InspectCharacters(Forms);
        
        $('.AddNewGroup').dialog({title:"Nuevo Grupo de Usuarios", width:500, height:400, minWidth:400, minHeight:300, modal:true,
            buttons:
            {
                "Agregar":{text:"Aceptar", "click":function(){ _AddNewGroup();}},
                "Cancelar":{text:"Cancelar", "click":function(){$(this).dialog('close');}}
            }
        });        
        
        $(":text").keyup(function(){valid(this);});
    };
    
    var _AddNewGroup = function()
    {
        var self = this;
        var StringNewGroup = '';
                        
        $('.AddNewGroup :text').each(function()
        {            
            $(this).tooltip();
            $('#NewGroup_Nombre').attr('title',"");                                            
            StringNewGroup+= "&"+$(this).attr("name")+"="+$(this).val();                    
        });        

        var Forms = $('.AddNewGroup input');
        var FieldsValidator = new ClassFieldsValidator();   
        var validation = FieldsValidator.ValidateFields(Forms);
        console.log("Validación campos Agregar nuevo Grupo "+ self.NombreGrupo +" "+validation);
        if(validation===0)
            return 0;
                        
        $.ajax({
        async:true, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/GruposUsuario.php",
        data: "opcion=NewGroup&DataBaseName="+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&NombreUsuario='+EnvironmentData.NombreUsuario+StringNewGroup, 
        success:  function(xml)
        {           
            if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );

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
        error: function(jqXHR, textStatus, errorThrown){Error(textStatus +"<br>"+ errorThrown);}
        });       
    };
    
    _ShowGroupData = function()
    {
        if(!(_CheckActiveGroup()))
            return 0;          
        
        $('.DivEditGroup').remove();
        $('body').append('<div class = "DivEditGroup"></div>');
        $('.DivEditGroup').append('<div class = "titulo_ventana">Información del Grupo <b>'+ NombreGrupo +'</b></div><table class = "TableEditGroup"></table>');
        $('.TableEditGroup').append('<tr><td>Nombre</td><td><input type = "text" name = "NewGroupName" id = "NewGroup_Nombre" value = "'+ NombreGrupo +'" class = "required FormStandart" FieldType = "varchar" FieldLength = "50"></td></tr>');
        $('.TableEditGroup').append('<tr><td>Descripción</td><td><input type = "text" name = "NewGroupDescription" id = "NewGroup_Descripcion" value = "'+Descripcion+'" class = "FormStandart" FieldType = "text"></td></tr>');
        
        var Forms = $('.DivEditGroup input.FormStandart');
        var FieldsValidator = new ClassFieldsValidator();   
        FieldsValidator.InspectCharacters(Forms);
        
        $('.DivEditGroup').dialog({title:"Editar Grupo de Usuarios", width:500, height:400, minWidth:400, minHeight:300, modal:true,
            buttons:
            {
                "Agregar":{text:"Modificar Datos", "click":function(){ _ConfirmModifyGroup();}},
                "Cerrar":{text:"Cerrar", "click":function(){$(this).dialog('close');}}
            }
        });                
    };
    
    var _ConfirmModifyGroup = function()
    {
        var self = this;
        var Forms = $('.DivEditGroup input.FormStandart');
        var FieldsValidator = new ClassFieldsValidator();   
        var validation = FieldsValidator.ValidateFields(Forms);
        console.log("Validación campos Editar Grupo "+ self.NombreGrupo +" "+validation);
        if(validation===0)
            return 0;
        
        
        $('.ConfirmModifyGroup').remove();
        $('body').append('<div class = "ConfirmModifyGroup"></div>');
        $('.ConfirmModifyGroup').append('<center><img src="img/caution.png"></center>');
        $('.ConfirmModifyGroup').append('<p>Realmente desea modificar el Grupo <b>'+self.NombreGrupo+'</b></p>');
        $('.ConfirmModifyGroup').dialog({width:300, height:300, minWidth:300, minHeight:250,draggable:false, modal:true, title:"Mensaje de Confirmación",
            buttons:{
                "Modificar":{text:"Modificar", click:function(){$(this).dialog('destroy'); _ModifyGroup();}},
                "Cancelar":{text:"Cancelar", click:function(){$(this).dialog('destroy');}}
            }
        });
    };
    
    var _ModifyGroup = function()
    {
        var FlagMistake = 0;
        var StringModifyGroup = '';
        
        $('.DivEditGroup :text').each(function()
        {            
            $(this).tooltip();
            $(this).attr('title','');
            if($(this).hasClass('required'))
                if($(this).val().length===0)
                {
                    FlagMistake = 1;
                    if(!$(this).hasClass('RequiredActivo'))
                        $(this).addClass('RequiredActivo');
                }
                                
            StringModifyGroup+= "&"+$(this).attr("name")+"="+$(this).val();        
            
        });        

        if(FlagMistake===1)
            return 0;
        
        $('#WS_Users').append('<div class="PlaceWaiting" id = "UsersPlaceWaiting"><img src="../img/loadinfologin.gif"></div>');
                        
        $.ajax({
        async:true, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/GruposUsuario.php",
        data: "opcion=ModifyGroup&DataBaseName="+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&NombreUsuario='+EnvironmentData.NombreUsuario+'&IdGroup='+IdGrupo+StringModifyGroup+"&NombreGrupo="+NombreGrupo, 
        success:  function(xml)
        {           
            $('#UsersPlaceWaiting').remove();
            if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );

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
                var Mensaje = $(this).find('Mensaje').tetx();
                Notificacion(Mensaje);
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
                Error(mensaje);
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){$('#UsersPlaceWaiting').remove(); Error(textStatus +"<br>"+ errorThrown);}
        });          
    };
    
    _ConfirmDelete = function()
    {        
        if(!(_CheckActiveGroup()))
            return 0;

        $('#ConfirmDeleteGroup').remove();
        $('body').append('<div id = "ConfirmDeleteGroup"></div>');
        $('#ConfirmDeleteGroup').append('<center><img src="img/caution.png"></center>');
        $('#ConfirmDeleteGroup').append('<p>Realmente desea eliminar el Grupo <b>'+this.NombreGrupo+'</b></p>');
        $('#ConfirmDeleteGroup').dialog({width:300, height:300, minWidth:300, minHeight:250,draggable:false, modal:true, title:"Mensaje de Confirmación",
            buttons:{
                "Eliminar":{text:"Eliminar", click:function(){$(this).dialog('close'); _DeleteGroup();}},
                "Cancelar":{text:"Cancelar", click:function(){$(this).dialog('close');}}
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
        data: "opcion=DeleteGroup&DataBaseName="+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&NombreUsuario='+EnvironmentData.NombreUsuario+'&IdGroup='+this.IdGrupo+'&NombreGrupo='+this.NombreGrupo, 
        success:  function(xml)
        {           
            $('#UsersPlaceWaiting').remove();
            if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );

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
                Error(mensaje);
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){$('#UsersPlaceWaiting').remove(); Error(textStatus +"<br>"+ errorThrown);}
        });          
    };
        
   
    _Members = function()
    {
        if(!(_CheckActiveGroup()))
            return 0;
        
        $('#WS_Users').append('<div class="PlaceWaiting" id = "UsersPlaceWaiting"><img src="../img/loadinfologin.gif"></div>');
        
        $('.PanelGroupsMembers').remove();
        $('body').append('<div class = "PanelGroupsMembers" style = "display:none"></div>');
        $('.PanelGroupsMembers').append('<div class="titulo_ventana">Integrantes de grupo</div>');       
        $('.PanelGroupsMembers').append('<table id = "GroupMembers" class = "display hover"><thead><tr><th>Usuario</th><th>Descripción</th></tr></thead><tbody></tbody></table>');
        
        TableGroupMembersdT = $('#GroupMembers').dataTable({"sDom": '<"ButtonsTableGroupMembers">frtip'},OptionDataTable);  
        TableGroupMembersDT = new $.fn.dataTable.Api('#GroupMembers');
        
        $('div.ButtonsTableGroupMembers').append('<input type = "button" value = "Agregar" id = "BTGM_Agregar">');
        $('div.ButtonsTableGroupMembers').append('<input type = "button" value = "Quitar" id = "BTGM_Quitar">');
        
        $('#BTGM_Agregar').button();
        $('#BTGM_Quitar').button();
        
        $('#BTGM_Agregar').click(function(){_ShowUsersWithoutGroup();});
        $('#BTGM_Quitar').click(function(){_ConfirmDeleteGroupMembers();});
        
        
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
        } );  

        $('.PanelGroupsMembers').dialog({title:"Integrantes del grupo \""+ this.NombreGrupo +"\"", width: 450, height:450, minWidth:450, minHeight:400, modal:true, buttons:{
                "Cerrar":{text:"Cerrar", click:function(){$(this).dialog('close');}}
        }});
    
        $('#UsersPlaceWaiting').remove();
        
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
        data: "opcion=GetGroupMemebers&DataBaseName="+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&NombreUsuario='+EnvironmentData.NombreUsuario+'&IdGrupo='+EnvironmentData.IdGrupo+ "&NombreGrupo = "+ EnvironmentData.NombreGrupo+"&IdGrupoUsuario="+this.IdGrupo+"&NombreGrupoUsuario="+this.NombreGrupo, 
        success:  function(xml)
        {            
            if($.parseXML( xml )===null){$('#UsersPlaceWaiting').remove(); Error(xml); return 0;}else xml=$.parseXML( xml );         
            
            if($(xml).find("Member").length>0)
                Integrantes = xml;

            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                Error(mensaje);
                $('#UsersPlaceWaiting').remove();
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){$('#UsersPlaceWaiting').remove(); Error(textStatus +"<br>"+ errorThrown);}
        });   
        
        return Integrantes;
    };
    
    var _ShowUsersWithoutGroup = function()
    {
        if(!(_CheckActiveGroup()))
            return 0;
        
        $('.PanelGroupsMembers').append('<div class="PlaceWaiting" id = "UsersPlaceWaiting"><img src="../img/loadinfologin.gif"></div>');
        
        $('.PanelUsersWithoutGroup').remove();
        $('body').append('<div class = "PanelUsersWithoutGroup" style = "display:none"></div>');
        $('.PanelUsersWithoutGroup').append('<div class="titulo_ventana">Integrantes de grupo</div>');       
        $('.PanelUsersWithoutGroup').append('<table id = "UsersWithoutGroup" class = "display hover"><thead><tr><th>Usuario</th><th>Descripción</th></tr></thead><tbody></tbody></table>');
        
        TableUsersWithoutGroupdT = $('#UsersWithoutGroup').dataTable(OptionDataTable);  
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
        
        
        $('.PanelUsersWithoutGroup').dialog({title:"Seleccione usuarios", width: 550, height:350, minWidth:550, minHeight:350, modal:true, buttons:{
                "Ok":{text:"Ok", click:function(){_AddUsersToGroup();}}
        }});
            
        $('#UsersWithoutGroup tbody').on( 'click', 'tr', function () {
            $(this).toggleClass('selected');
        });  
    
        $('#UsersPlaceWaiting').remove();
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
            if($.parseXML( xml )===null){$('#UsersPlaceWaiting').remove(); Error(xml); return 0;}else xml=$.parseXML( xml );         
            
            if($(xml).find("Member").length>0)
                Users = xml;

            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                Error(mensaje);
                $('#UsersPlaceWaiting').remove();
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){$('#UsersPlaceWaiting').remove(); Error(textStatus +"<br>"+ errorThrown);}
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
        data: "opcion=AddUsersToGroup&DataBaseName="+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&NombreUsuario='+EnvironmentData.NombreUsuario+'&IdGrupo='+this.IdGrupo+'&NombreGrupo='+this.NombreGrupo+'&UsersXml='+UsersXml, 
        success:  function(xml)
        {           
            $('#UsersPlaceWaiting').remove();
            $('.PanelUsersWithoutGroup').dialog('destroy');
            if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );

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
                Error(mensaje);
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){$('#UsersPlaceWaiting').remove(); Error(textStatus +"<br>"+ errorThrown);}
        });          
        
    };
    
    var _ConfirmDeleteGroupMembers = function()
    {
        $('.ConfirmDeleteGroupMembers').remove();
        $('body').append('<div class = "ConfirmDeleteGroupMembers"></div>');        
        $('.ConfirmDeleteGroupMembers').append('<p>Se eliminararán los usuarios seleccionados del grupo <b>'+NombreGrupo+'</b>. ¿Desea continuar?</p>');        
        $('.ConfirmDeleteGroupMembers').dialog({title:"Mensaje de confirmación", width:300, height:200, minWidth:300, minHeight:200, modal:true, buttons:{
                "Cancelar":{text:"Cancelar", click:function(){  $(this).dialog('destroy');  }},
                "Aceptar":{text:"Aceptar", click:function(){$(this).dialog('destroy'); _DeleteGroupMembers();   }}
        }});
        
    };
    
    var _DeleteGroupMembers = function()
    {        
        $('.PanelGroupsMembers').append('<div class="PlaceWaiting" id = "UsersPlaceWaiting"><img src="../img/loadinfologin.gif"></div>');
        
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
        data: "opcion=DeleteGroupMembers&DataBaseName="+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&NombreUsuario='+EnvironmentData.NombreUsuario+'&IdGrupo='+this.IdGrupo+'&NombreGrupo='+this.NombreGrupo+'&UsersXml='+UsersXml, 
        success:  function(xml)
        {           
            $('#UsersPlaceWaiting').remove();
            if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );

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
                Error(mensaje);
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){$('#UsersPlaceWaiting').remove(); Error(textStatus +"<br>"+ errorThrown);}
        });          
    };
    
    /*--------------------------------------------------------------------------
     *                  Permisos del Sistema Por Grupos 
     ---------------------------------------------------------------------------*/
    _CreatePermissionsPanel = function()
    {
        var self = this;
        $('#PanelPermissionsUserGroups').remove();
        $('body').append('\
            <div id = "PanelPermissionsUserGroups" style = "display:none">\n\
                <div id = "GroupPermissionsPanel" class = "UserGroupContentTab">\n\
                    <ul>\n\
                        <li id = "li_UserGroupPermissionsRepositories"><a href = "#UserGroupsPermissionsRepositories">Repositorios</a></li>\n\
                        <li id = "li_UserGroupPermissionsAdministration"><a href = "#UserGroupsPermissionsAdministration">Administración</a></li>\n\
                    </ul>\n\
                    <div id = "UserGroupsPermissionsRepositories" class = "UserGroupContent">\n\
                        <div id = "SM_Permissions" class = "TreeRepositoriesUserGroups"></div>\n\
                        <div id = "TreeToolsOptions" class = "TreeMenusUserGroups"></div>\n\
                    </div>\n\
                    <div id = "UserGroupsPermissionsAdministration" class = "UserGroupContent">\n\
                        <div class = "TreeRepositoriesUserGroups"></div>\n\
                        <div class = "TreeMenusUserGroups"></div>\n\
                    </div>\n\
                </div>\n\
            </div>');
        
        $('#WS_Users').append('<div class="PlaceWaiting" id = "UsersPlaceWaiting"><img src="../img/loadinfologin.gif"></div>');
        
        $( "#GroupPermissionsPanel").tabs();
       $( "#GroupPermissionsPanel li" ).removeClass( "ui-corner-top" );
       _PermissionsRepositoriesUserGroups();
    };
    
    var _PermissionsRepositoriesUserGroups = function()
    {
        var XmlRepositories = Repository.GetRepositories(0);
     
        if(!$.isXMLDoc(XmlRepositories))
        {
            $('#UsersPlaceWaiting').remove();
            return 0;   
        }
                         
        $('#SM_Permissions').append('<div id = "TreeRepositoriesUserGroups"><ul><li id = "0_MSR" data = "icon: \'Catalogo.png\'" class = "folder"> Repositorios <ul id = "MSR_0"></ul></ul></div>');
                
        $(XmlRepositories).find("Repository").each(function()
        {
            var IdRepositorio = $(this).find('IdRepositorio').text();
            var Nombre = $(this).find('NombreRepositorio').text();
            var ClaveEmpresa = $(this).find('ClaveEmpresa').text();
            console.log("Ingresando al menú el repositorio "+Nombre);
            $('#MSR_0').append('<li id="MSR_'+IdRepositorio+'" class="folder" data="icon: \'Repositorio.png\'">'+Nombre+'<ul id="'+IdRepositorio+'_MSR"></ul>');             
        });    
        
        $('#TreeRepositoriesUserGroups').dynatree({generateIds: false, expand: true, selectMode: 3, checkbox: true, minExpandLevel: 3,
            onClick: function(node, event){
                if( node.getEventTargetType(event) === "checkbox" )
                    node.activate();
                if( node.getEventTargetType(event) === "title" )
                    if(!node.bSelected)
                        node.toggleSelect();
                node.sortChildren(cmp, false);  
//                console.log('OnClick en '+node.data.title);
            },
            onActivate: function(node, event)
            {                             
                node.sortChildren(cmp, false); 
                _GetAccessPermissionsListOfRepository(node);   /* Obtiene los permisos sobre el repositorio */
            },
            onCreate: function(node, event)
            {
                node.sortChildren(cmp, false);
            }
        });    
        
        var RepositoriesTree = $('#TreeRepositoriesUserGroups').dynatree("getTree");  /* crea el árbol izquierdo (repositorios)*/
        var ShowToolsOptions = _ShowToolsOptions();   /* Muestra la lista de menús del sistema */
        _GetRepositoryAccessList(RepositoriesTree);    /* Permisos de acceso (check) árbol izquierdo (repositorios)*/            
////        
        var rootNode = RepositoriesTree.getNodeByKey("0_MSR");  
      
        var RepositoryChildren = rootNode.getChildren();
        
        
        $('#PanelPermissionsUserGroups').dialog({title:"Control de Permisos para el grupo \""+ this.NombreGrupo +"\"", width: 650, height:600, minWidth:650, minHeight:400, buttons:{
                "Aplicar":{text:"Aplicar", click:function(){_ApplyPermissionsSettings();}},
                "Cerrar":function(){$(this).dialog('close');}
        }});
    
    $('#UsersPlaceWaiting').remove();    
    
    RepositoryChildren[0].activate();               /* Se activa el primer repositorio */
        
        
    };
    
    /* Operaciones que el usuario puede realizar */
    var _ShowToolsOptions = function()
    {
        if(!(_CheckActiveGroup()))
            return 0;
                              
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Permissions.php",
        data: "opcion=GetToolsOptions&DataBaseName="+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&NombreUsuario='+EnvironmentData.NombreUsuario+'&IdGroup='+IdGrupo+'&NombreGrupo='+NombreGrupo+'&MenuType', 
        success:  function(xml)
        {            
            if($.parseXML( xml )===null){$('#UsersPlaceWaiting').remove(); Error(xml); return 0;}else xml=$.parseXML( xml );

            if($(xml).find("Menu").length>0)
            {
                _BuildTreeOfToolsOptions(xml);
                return 1;
            }         

            $(xml).find("Error").each(function()
            {
                var $Error=$(this);
                var estado=$Error.find("Estado").text();
                var mensaje=$Error.find("Mensaje").text();
                Error(mensaje);
                $('#UsersPlaceWaiting').remove();
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){$('#UsersPlaceWaiting').remove(); Error(textStatus +"<br>"+ errorThrown);}
        });    
    };
    
    var _BuildTreeOfToolsOptions = function(xml)
    {
        $('.PermissionsToolsOptions').remove();
        $('#TreeToolsOptions').append('<div class = "PermissionsToolsOptions"><ul><li id="SM_0" class="folder" data="icon: \'Repositorio.png\'">Permisos<ul id = "SM_0_"></ul></ul></div>');
        
        $(xml).find("Menu").each(function()
        {
            var IdMenu = $(this).find("IdMenu").text();
            var IdParent = $(this).find("IdParent").text();
            var Nombre = $(this).find("Nombre").text();
//            console.log('IdMenu = '+IdMenu+' IdParent = '+IdParent+' Nombre = '+Nombre);
            if($('#SM_'+IdParent+'_').length>0)
                $('#SM_'+IdParent+'_').append('<li id = "SM_'+IdMenu+'" class="folder" data="icon: \'Catalogo.png\'">'+Nombre+'<ul id="SM_'+IdMenu+'_"></ul>');
        });
                                
        var Menus = $('.PermissionsToolsOptions').dynatree({
            generateIds: false, selectMode: 3, checkbox: true, expand: true, minExpandLevel: 3,
            onClick: function(node, event) {
                node.sortChildren(cmp, false);
                if( node.getEventTargetType(event) === "title" )
                    node.toggleSelect();
            },
            onKeydown: function(node, event) {
                if( event.which === 32 ) {
                  node.toggleSelect();
                  return false;
                }
              }
        });    
        
//        var Menus = $(".PermissionsToolsOptions").dynatree("getTree");
        var node =  $(".PermissionsToolsOptions").dynatree("getActiveNode");
        if(node)
            node.sortChildren(cmp, false);      
                        
        return 1;
    };
    
    var _BuildTheSystemMenuTree = function(xml)
    {
        $('.DivMenuTree').remove();
        $('.PermissionsPanel').append('<div class = "DivMenuTree ConsolaUsuarios_MenusTree"><div class = "GroupsMenuTree"></div></div>');                
        $('.DivMenuTree').append('<div class = "PermissionsPanelMenus"><ul><li id="SM_0" class="folder" data="icon: \'Repositorio.png\'">Sistema<ul id = "SM_0_"></ul></ul></div>');
        
        $(xml).find("Menu").each(function()
        {
            var IdMenu = $(this).find("IdMenu").text();
            var IdParent = $(this).find("IdParent").text();
            var Nombre = $(this).find("Nombre").text();
             
            if($('#SM_'+IdParent+'_').length>0)
                $('#SM_'+IdParent+'_').append('<li id = "SM_'+IdMenu+'" class="folder" data="icon: \'Catalogo.png\'">'+Nombre+'<ul id="SM_'+IdMenu+'_"></ul>');
        });
                                
        var Menus = $('.PermissionsPanelMenus').dynatree({
            generateIds: false, selectMode: 3, checkbox: true, expand: true, minExpandLevel: 3,
            onClick: function(node, event) {
                node.sortChildren(cmp, false);
                if( node.getEventTargetType(event) === "title" )
                    node.toggleSelect();
            },
            onKeydown: function(node, event) {
                if( event.which === 32 ) {
                  node.toggleSelect();
                  return false;
                }
              }
        });    
        
        var Menus = $(".PermissionsPanelMenus").dynatree("getTree");
        var node =  $(".PermissionsPanelMenus").dynatree("getActiveNode");
        if(node)
            node.sortChildren(cmp, false);      
                        
        return 1;
   };
   
   /*---------------------------------------------------------------------------
    * Regresa los accesos a los repositorios a los cuales el grupo seleccionado
    * tiene permiso de acceso
    * 
    * @param {type} RepositoriesTree
    * @returns {undefined}
    ---------------------------------------------------------------------------*/
   var _GetRepositoryAccessList = function(RepositoriesTree)  
   {
       $('.PermissionsPanel').append('<div class="PlaceWaiting" id = "UsersPlaceWaiting"><img src="../img/loadinfologin.gif"></div>');
       
       $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Permissions.php",
        data: "opcion=GetRepositoryAccessList&DataBaseName="+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&NombreUsuario='+EnvironmentData.NombreUsuario+'&EnvironIdGrupo='+EnvironmentData.IdGrupo+'&EnvironNombreGrupo='+EnvironmentData.NombreGrupo+'&IdGrupo='+IdGrupo+'&NombreGrupo='+NombreGrupo, 
        success:  function(xml)
        {            
            $('#UsersPlaceWaiting').remove();
            if($.parseXML( xml )===null){ Error(xml); return 0;}else xml=$.parseXML( xml );
            
            $(xml).find("Repository").each(function()
            {
                var IdRepository = $(this).find('IdRepositorio').text(); 
                var node = RepositoriesTree.getNodeByKey("MSR_"+IdRepository);
                if(!node.bSelected)
                    node.toggleSelect();
//                console.log(node);

            });

            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                Error(mensaje);
                $('#UsersPlaceWaiting').remove();
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){$('#UsersPlaceWaiting').remove(); Error(textStatus +"<br>"+ errorThrown);}
        });       
   };
   
    var _GetAccessPermissionsListOfRepository = function(node)
    {
        $('#GroupPermissionsPanel').append('<div class="Loading" id = "UsersPlaceWaiting"><img src="../img/loadinfologin.gif"></div>');
        
        var SplitId = node.data.key;
        SplitId = String(SplitId.split("MSR_"));
        var IdRepositorio = SplitId.replace(",","");
        if(!(IdRepositorio>0))
           return;
       
        var PermissionsTree = $(".PermissionsToolsOptions").dynatree("getTree");
        var root = PermissionsTree.getNodeByKey('SM_0');

        if($.type(root)==='object')
            if(!root.bSelected)
            {
                root.toggleSelect();
                root.toggleSelect();
            }
            else
                root.toggleSelect();
                                         
        $.ajax({
        async:true, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Permissions.php",
        data: "opcion=GetAccessPermissionsList&DataBaseName="+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&NombreUsuario='+EnvironmentData.NombreUsuario+'&EnvironIdGrupo='+EnvironmentData.IdGrupo+'&EnvironNombreGrupo='+EnvironmentData.NombreGrupo+'&IdRepositorio='+IdRepositorio+'&NombreRepositorio='+node.data.title+'&IdGrupo='+IdGrupo+'&NombreGrupo='+NombreGrupo, 
        success:  function(xml)
        {            
            $('#UsersPlaceWaiting').remove();
            if($.parseXML( xml )===null){ Error(xml); return 0;}else xml=$.parseXML( xml );

            $(xml).find("Menu").each(function()
            {
                var IdMenu = $(this).find('IdMenu').text(); 
                var node = PermissionsTree.getNodeByKey("SM_"+IdMenu);
                if($.type(node)==='object')
                    if(!node.bSelected)
                        node.toggleSelect();
        //                console.log(node);

            });            

            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                Error(mensaje);
                $('#UsersPlaceWaiting').remove();
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){$('#UsersPlaceWaiting').remove(); Error(textStatus +"<br>"+ errorThrown);}
        });       
    };
      
  var _ApplyPermissionsSettings = function()
   {              
       var node =  $("#TreeRepositoriesUserGroups").dynatree("getActiveNode");
       var SplitId = node.data.key;
       SplitId = String(SplitId.split("MSR_"));
       var IdRepositorio = SplitId.replace(",","");
       var NombreRepositorio = node.data.title;
       if(!(IdRepositorio>0))
        return; 
       
       var SelectedRepositoriesTree  = Tree.GetSelectedNodes('#TreeRepositoriesUserGroups');
       var UnselectedRepositories = Tree.GetUncheckNodes('#TreeRepositoriesUserGroups');
       var SelectedMenus = Tree.GetSelectedNodes('.PermissionsToolsOptions');
       var UnselectedMenus = Tree.GetUncheckNodes('.PermissionsToolsOptions');
       var SettingsXml = undefined;
       
       if(SelectedMenus === 0 || SelectedRepositoriesTree ===0)
           return 0;
       
       SettingsXml="<Settings version='1.0' encoding='UTF-8'>";
       
       $.each(SelectedRepositoriesTree, function()
       {        
           var SplitId = this.data.key;
           SplitId = String(SplitId.split("MSR_"));
           var Id = SplitId.replace(",","");
           if(!(Id>0))
            return;
           SettingsXml+="<AccessToTheRepository>";
           SettingsXml+= "<IdRepository>"+Id+'</IdRepository>';
           SettingsXml+= "<RepositoryTitle>"+this.data.title+'</RepositoryTitle>';
           SettingsXml+= "</AccessToTheRepository>";
       });
       
       $.each(UnselectedRepositories, function()
       {        
           var SplitId = this.data.key;
           SplitId = String(SplitId.split("MSR_"));
           var Id = SplitId.replace(",","");
           if(!(Id>0))
            return;
           SettingsXml+="<WithoutAccessToTheRepository>";
           SettingsXml+= "<IdRepository>"+Id+'</IdRepository>';
           SettingsXml+= "<RepositoryTitle>"+this.data.title+'</RepositoryTitle>';
           SettingsXml+= "</WithoutAccessToTheRepository>";
       });
       
       $.each(SelectedMenus, function()
       {
           var SplitId = this.data.key;
           SplitId = String(SplitId.split("SM_"));
           var Id = SplitId.replace(",","");
           if(!(Id>0))
            return;
           SettingsXml+= "<AccessMenu>";
           SettingsXml+= "<IdMenu>"+Id+'</IdMenu>';
           SettingsXml+= "<MenuTitle>"+this.data.title+'</MenuTitle>';
           SettingsXml+= '</AccessMenu>';
       });
       
       $.each(UnselectedMenus, function()
       {
           var SplitId = this.data.key;
           SplitId = String(SplitId.split("SM_"));
           var Id = SplitId.replace(",","");
           if(!(Id>0))
            return;
           SettingsXml+= "<WithoutAccessMenu>";
           SettingsXml+= "<IdMenu>"+Id+'</IdMenu>';
           SettingsXml+= "<MenuTitle>"+this.data.title+'</MenuTitle>';
           SettingsXml+= '</WithoutAccessMenu>';
       });
       
       SettingsXml+="</Settings>";
              
       $.ajax({
        async:true, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Permissions.php",
        data: "opcion=ApplyPermissionsSettingsOfGroup&DataBaseName="+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&NombreUsuario='+EnvironmentData.NombreUsuario+'&EnvironIdGrupo='+EnvironmentData.IdGrupo+'&EnvironNombreGrupo='+EnvironmentData.NombreGrupo+'&IdRepositorio='+IdRepositorio+'&NombreRepositorio='+NombreRepositorio+'&IdGrupo='+this.IdGrupo+'&NombreGrupo='+this.NombreGrupo+'&SettingsXml='+SettingsXml, 
        success:  function(xml)
        {            
            if($.parseXML( xml )===null){$('#UsersPlaceWaiting').remove(); Error(xml); return 0;}else xml=$.parseXML( xml );         
            
            $(xml).find("ApplySettings").each(function()
            {
                var Mensaje = $(this).find("Mensaje").text();
                Notificacion(Mensaje);              
            });
            
            $(xml).find("SystemError").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                Notificacion(mensaje);
                $('#UsersPlaceWaiting').remove();
            });  
            
            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                Error(mensaje);
                $('#UsersPlaceWaiting').remove();
            });                 
        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){$('#UsersPlaceWaiting').remove(); Error(textStatus +"<br>"+ errorThrown);}
        });    
       
   };
   
    var cmp = function(a, b) {
        a = a.data.title.toLowerCase();
        b = b.data.title.toLowerCase();
        return a > b ? 1 : a < b ? -1 : 0;
     };
    
    var _CheckActiveGroup = function()
    {        
        if(!this.IdGrupo>0)
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

    /*--------------------------------------------------------------------------
     *                  Prototipos de la clase GruposUsuario                    
     *--------------------------------------------------------------------------*/
    

ClassUsersGroups.prototype.ShowsGroupsUsers = function()
   {
       var self = this;
       
       var Buttons = {};
       $('#div_consola_users').dialog('option','buttons',Buttons);
       
       $('#WS_Users').empty();       
       $('#WS_Users').append('<div class="titulo_ventana">Grupos de Usuario</div>');
       $('#WS_Users').append('<div class="LoadingGroups loading"><img src="../img/loadinfologin.gif"></div>');
       $('#WS_Users').append('<table id="TableUsersGroups" class="display hover"><thead><tr><th>Nombre del Grupo</th><th>Descripción</th></tr></thead><tbdoy></tbody></table>');

       TableGroupsdT = $('#TableUsersGroups').dataTable({"sDom": '<"ButtonsTableGroups">frtip'},OptionDataTable);    
       TableGroupsDT = new $.fn.dataTable.Api('#TableUsersGroups');
       
       $( "div.ButtonsTableGroups" ).append('<input type  = "button" value = "Crear" id = "GroupButtonCrear">');
       $( "div.ButtonsTableGroups" ).append('<input type  = "button" value = "Editar" id ="GroupButtonEditar">');
       $( "div.ButtonsTableGroups" ).append('<input type  = "button" value = "Eliminar" id = "GroupButtonEliminar">');
       $( "div.ButtonsTableGroups" ).append('<input type  = "button" value = "Miembros" id = "GroupButtonEditarMiembros">');
       $( "div.ButtonsTableGroups" ).append('<input type  = "button" value = "Permisos" id = "GroupButtonEditarPermisos">');
       $( "div.ButtonsTableGroups" ).append('<input type  = "button" value = "Jerarquía" id = "GroupButtonJerarquia">');
       
       $('#GroupButtonCrear').button();
       $('#GroupButtonEditar').button();
       $('#GroupButtonEliminar').button();
       $('#GroupButtonEditarMiembros').button();
       $('#GroupButtonEditarPermisos').button();
       $('#GroupButtonJerarquia').button();
              
       $('#GroupButtonCrear').click(function(){_NewGroup();});
       $('#GroupButtonEditar').click(function(){_ShowGroupData();});
       $('#GroupButtonEliminar').click(function(){_ConfirmDelete();});
       $('#GroupButtonEditarMiembros').click(function(){_Members();});
       $('#GroupButtonEditarPermisos').click(function(){_CreatePermissionsPanel();});
       $('#GroupButtonJerarquia').click(function(){_ShowsGroupsHierarchy();});
       
       
       $.ajax({
       async:true, 
       cache:false,
       dataType:"html", 
       type: 'POST',   
       url: "php/GruposUsuario.php",
       data: "opcion=GetUsersGroups&DataBaseName="+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&NombreUsuario='+EnvironmentData.NombreUsuario, 
       success:  function(xml)
       {           
           if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );

           if($(xml).find("Grupo").length>0)
               _BuildTableGroups(xml);          
           else
               $('.LoadingGroups').remove();
                

           $(xml).find("Error").each(function()
           {
               var $Error=$(this);
               var estado=$Error.find("Estado").text();
               var mensaje=$Error.find("Mensaje").text();
               Error(mensaje);
           });                 

       },
       beforeSend:function(){},
       error:function(objXMLHttpRequest){$('.LoadingGroups').remove();}
       });       
   };