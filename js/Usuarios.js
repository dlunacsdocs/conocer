
/* global Users, UsersGroups, EnvironmentData, Struct, BotonesWindow */

var CAWindowUsers={minHeight:500,minWidth:800,width:800, height:500};
var TableUsersdT = undefined;
var TableUsersDT = undefined;


$(document).ready(function(){
            /********* Efectos sobre tabla dentro de acordeón ***********/
    $('#UserManagementTable').on( 'click', 'tr', function ()
    {
        var active = $('#UserManagementTable tr.TableInsideAccordionFocus');                
        $('#UserManagementTable tr').removeClass('TableInsideAccordionFocus');
        $('#UserManagementTable tr').removeClass('TableInsideAccordionActive');
        $(active).addClass('TableInsideAccordionFocus');
        $(this).removeClass('TableInsideAccordionHoverWithoutClass');
        $(this).addClass('TableInsideAccordionActive');     
    });
    $('#UserManagementTable tr').hover(function()
    {
        if($(this).hasClass('TableInsideAccordionActive') || $(this).hasClass('TableInsideAccordionFocus'))
            $(this).addClass('TableInsideAccordionHoverWithClass');
        else
            $(this).addClass('TableInsideAccordionHoverWithoutClass');
    });
    $('#UserManagementTable tr').mouseout(function()
    {
        if($(this).hasClass('TableInsideAccordionActive') || $(this).hasClass('TableInsideAccordionFocus'))
            $(this).removeClass('TableInsideAccordionHoverWithClass');
        else
            $(this).removeClass('TableInsideAccordionHoverWithoutClass');
    });
    
    $('#tr_NewUser').addClass('TableInsideAccordionActive');
    /* Fin de Efectos  */
    
    
    /************************* Acciones Menu lateral ***************************/
    $('.LinkUsers').click(function()
    {
        $('#div_consola_users').dialog(CAWindowUsers,{ title:"Consola de Usuarios"}).dialogExtend(BotonesWindow);
        Users.CM_AddUserForms();
    });
    $("#accordion_users").accordion({ header: "h3", collapsible: true,heightStyle: "content" });
   $('#tr_NewUser').click(function()       
   {             
       Users.CM_AddUserForms();
   });
   
   $('#tr_UsersList').click(function(){Users.CM_UsersList();});
   
   $('#tr_GroupsUsers').click(function(){UsersGroups.ShowsGroupsUsers();});
   
   $('#LinkCloseSession').click(function(){
       Users.closeUserSession();
   });
   
});

/*******************************************************************************
 *  Comprueba la existencia del usuario Root en la tabla cs-docs
 *  En caso de que no exista se inserta en la BD con la contraseña elegida por el usuario
 * 
 * @returns {undefined}
 *******************************************************************************/
function ExistRoot()
{
       $.ajax({
        async:true, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Usuarios.php",
        data: "opcion=ExistRoot", 
        success:  function(xml)
        {            
    //            if($.parseXML( xml )===null){$('#UsersPlaceWaiting').remove(); Error(xml); return 0;}else xml=$.parseXML( xml );                    
        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){Error(textStatus +"<br>"+ errorThrown);}
        });
}

ClassUsers = function()
{   
    var self = this;
    this.IdUsuario = undefined;
    this.NombreUsuario = undefined;
    this.Password = undefined;
    this.LoginColumn = undefined;
    this.PasswordColumn = undefined;
    
                
    /*--------------------------------------------------------------------------
     *Se agrega una estructura xml con los usuarios a insertar en el sistema
     ---------------------------------------------------------------------------*/
    
     _CM_AddXmlUser = function()
    {
        var self = this;
        Loading();
        var xml_usuario=document.getElementById("NewUser_InputFile");
        var archivo = xml_usuario.files;     
        var data = new FormData();

          for(i=0; i<archivo.length; i++)
          {
                data.append('archivo',archivo[i]);
                data.append('opcion','AddXmlUser');
                data.append('id_usuario',EnvironmentData.IdUsuario);
                data.append('DataBaseName',EnvironmentData.DataBaseName);
                data.append('nombre_usuario',EnvironmentData.NombreUsuario);
          } 
            ajax=objetoAjax();
            ajax.open("POST", 'php/Usuarios.php',true);
            ajax.send(data);    
            ajax.onreadystatechange=function() 
            {            
                if (ajax.readyState===4 && ajax.status===200) 
               { 
                   $('#Loading').dialog('close');
                   $('#NewUser_InputFile').remove();
                   Salida(ajax.responseText);
                   self.CM_AddUserForms();
                }
            };
    };    
   
   /* Tabla que muestra la informacion de los usuarios */
    _BuildtableUsers = function(StructuraUsuarios,XmlUsuarios)
    {               
        $(XmlUsuarios).find("Usuario").each(function()
           {          
                var $Usuario = $(this);
                var Login=$Usuario.find("Login").text(); /* Campo por default */
                var IdUsuario= $Usuario.find("IdUsuario").text(); 
                var PassWord = $Usuario.find("Password").text();
                var Data = [];
                
                $(StructuraUsuarios).find("Campo").each(function()
                {                        
                   var name=$(this).find("name").text();                
                   var valor=$Usuario.find(name).text();
                   Data[Data.length] = valor;
                });           
               
                Data[Data.length] = '<img src="img/user_edit.png" style="cursor:pointer" title="editar usuario" onclick="_GetInfoUser(\''+IdUsuario+'\')"><img src="img/user_remove.png" style="cursor:pointer" title="eliminar usuario" onclick="_CM_ConfirmRemoveUser()">';
               
                var ai = TableUsersDT.row.add(Data).draw();
                var n = TableUsersdT.fnSettings().aoData[ ai[0] ].nTr;
                n.setAttribute('id',IdUsuario);
           });  

           $('#Table_UsersList tbody').on( 'click', 'tr', function () {
                if ( $(this).hasClass('selected') ) {
                        $(this).removeClass('selected');
                }
                else {
                    TableUsersdT.$('tr.selected').removeClass('selected');
                    $(this).addClass('selected');                               
                }
            } );
            
            $('#UsersPlaceWaiting').remove();    
            
            $('#Table_UsersList tbody').on( 'click', 'tr', function ()
            {
                TableUsersDT.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
                var IdRow = $('#Table_UsersList tr.selected').attr('id');
                
                var position = TableUsersdT.fnGetPosition(this); // getting the clicked row position
                IdUsuario = IdRow;
                NombreUsuario = TableUsersdT.fnGetData(position)[self.LoginColumn];
                Password = TableUsersdT.fnGetData(position)[self.PasswordColumn];
            });  
            
//            _ClickOnRowUsersTable();
            
            TableUsersdT.find('tbody tr:eq(0)').click();  /* Activa la primera fila  */

    };
    
    /********************************************************************************
    * 
    * @param {type} IdUser
    * @returns {undefined}
    * Editar la informacion de un usuario
    */

    _GetInfoUser = function(IdUser)
    {

        $('#div_edit_user').remove();
        $('#WS_Users').append('<div id="div_edit_user"><div>');
        $('#div_edit_user').append('<div class="PlaceWaiting" id = "UsersPlaceWaiting"><img src="../img/loadinfologin.gif"></div>');
        $('#div_edit_user').append('<div class="titulo_ventana">Datos de Usuario</div>');
        $('#div_edit_user').append('<table id="table_edit_user"></table>');        
        
        var StructUser = GetAllStructure('Usuarios'); 
        BuildFullStructureTable('Usuarios','table_edit_user',0);
        
        var Forms = $('#table_edit_user :text');
        var FieldsValidator = new ClassFieldsValidator();   
        FieldsValidator.InspectCharacters(Forms);
        
        $('#div_edit_user').dialog({title:"Editar Usuario",width:600, height:500, minWidth:500, minHeight:400, modal:true
        ,buttons:{"Modificar":function(){_ModifyUser(StructUser,IdUser);},"Cerrar":function(){$(this).dialog('close');}}});

        
        $.ajax({
        async:true, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Usuarios.php",
        data: "opcion=GetInfoUser&DataBaseName="+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&NombreUsuario='+EnvironmentData.NombreUsuario+'&IdGrupo='+EnvironmentData.IdGrupo+"&IdUser="+IdUser, 
        success:  function(xml)
        {        
            $('#UsersPlaceWaiting').remove();
            if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );         

            var cont=1;
           $(StructUser).find("Campo").each(function()
            {               
                var $Campo=$(this);
                var name=$Campo.find("name").text();
                var type=$Campo.find("type").text();
                var long=$Campo.find("long").text();
                var required=$Campo.find("required").text();
                var value=$(xml).find(name).text();
                var Class = '';

                $('#table_edit_user_'+name).val(value);
                
                if(name.toLowerCase()=='password')    
                    $('#table_edit_user_'+name).attr('type', 'password'); 
                    
            });
           $(":text").keyup(function(){valid(this);});
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
    
    /*
     * 
     * @param {type} StructUser
     * @param {type} IdModifyUser
     * @returns {undefined}
     */
   var _ModifyUser = function(StructUser,IdModifyUser)
   {       
       
       var Forms = $('#table_edit_user :text');
        var FieldsValidator = new ClassFieldsValidator();   
        var Validation = FieldsValidator.ValidateFields(Forms);        
        if(!Validation)
            return 0;
       
       var Data = [];
       
       var UserNameModiffied = '';
       var xml="<Modify version='1.0' encoding='UTF-8'>";
              
       $(StructUser).find("Campo").each(function()
       {               
           var $Campo=$(this);
           var name=$Campo.find("name").text();
           var type=$Campo.find("type").text();
           var long=$Campo.find("long").text();
           var required=$Campo.find("required").text();
           var value = $('#table_edit_user_'+name).val();                     
           
           if(name.toLowerCase()=="login")
               UserNameModiffied = value;
           
           xml+='<Campo>\n\
               <name>'+name+'</name>\n\
               <value>'+value+'</value>\n\
               <type>'+type+'</type>\n\
               <long>'+long+'</long>\n\
           </Campo>';
           
           Data[Data.length] = value;
           
       });

       xml+='</Modify>';
                   
       $('#div_edit_user').append('<div class="PlaceWaiting" id = "UsersPlaceWaiting"><img src="../img/loadinfologin.gif"></div>');
       
       $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Usuarios.php",
        data: "opcion=ModifyUser&DataBaseName="+EnvironmentData.DataBaseName+'&IdUser='+EnvironmentData.IdUsuario+'&UserName='+EnvironmentData.NombreUsuario+'&IdGrupo='+EnvironmentData.IdGrupo+"&IdModifyUser="+IdModifyUser+'&UserNameModiffied='+UserNameModiffied+'&ModifyFileXml='+xml, 
        success:  function(xml)
        {            
            $('#UsersPlaceWaiting').remove();
            if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );    
           $(xml).find("Modify").each(function()
               {               
                   var mensaje=$(this).find("Mensaje").text();                
                   $('#div_edit_user').remove();
                   Notificacion(mensaje);   
                   
                   $('#Table_UsersList tr.selected').each(function()
                   {
                       var position = TableUsersdT.fnGetPosition(this);                   
                        for(var cont = 0; cont < Data.length; cont++)
                            TableUsersdT.fnUpdate([Data[cont]],position,cont,false);
                   });
                   
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
   
   _CM_ConfirmRemoveUser = function()
    {
        $('#ConfirmRemoveUser').remove();
        $('#div_consola_users').append('<div id="ConfirmRemoveUser"></div>');
        $('#ConfirmRemoveUser').append('<p>Realmente desea elminar al usuario <b>'+ NombreUsuario +'</b></p>');
        $('#ConfirmRemoveUser').dialog({title:"Mensaje de Confirmación", width:300, height:250,resizable:false, draggable:false,modal:true,
        buttons:{"Cancelar":{click:function(){$(this).dialog('close');},text:"Cancelar"},
        "Aceptar":{click:function(){$(this).dialog('close');    _CM_RemoveUser();    },text:"Aceptar"}}});
    };
    
     
    
    _CM_RemoveUser = function()
    {        
        var IdRemoveUser = $('#Table_UsersList tr.selected').attr('id');
                
        $.ajax({
        async:true, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Usuarios.php",
        data: "opcion=CM_RemoveUser&DataBaseName="+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&NombreUsuario='+EnvironmentData.NombreUsuario+'&IdGrupo='+EnvironmentData.IdGrupo+"&IdRemoveUser="+IdRemoveUser+'&NameUserToRemove = '+this.NombreUsuario+'&Password='+this.Password, 
        success:  function(xml)
        {            
            $('#UsersPlaceWaiting').remove();
            if($.parseXML( xml )===null){$('#UsersPlaceWaiting').remove(); Error(xml); return 0;}else xml=$.parseXML( xml );         
           $(xml).find("RemoveUser").each(function()
            {               
               var $Usuario=$(this);
               var Mensaje=$Usuario.find("Mensaje").text();
               Notificacion(Mensaje);
               
               TableUsersDT.row('tr[id='+IdRemoveUser+']').remove().draw( false );
               TableUsersdT.find('tbody tr:eq(0)').click();  /* Activa la primera fila  */
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
    
    
    var _ClickOnRowUsersTable = function()
    {
        var self = this;
        var LogCol = this.LoginColumn;
        var PassCol = this.PasswordColumn;

        $('#Table_UsersList tbody').on( 'click', 'tr', function ()
        {
            TableUsersDT.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            var IdRow = $('#Table_UsersList tr.selected').attr('id');              
            var position = TableUsersdT.fnGetPosition(this); // getting the clicked row position
            IdUsuario = IdRow;
            NombreUsuario = TableUsersdT.fnGetData(position)[LogCol];
            Password = TableUsersdT.fnGetData(position)[PassCol];
        } );  
    };
    
    AddUser = function(XmlStructure)
    {
        var self = this;
        var Forms = $('#AddTableNewUser :text');
        var FieldsValidator = new ClassFieldsValidator();   
        var Validation = FieldsValidator.ValidateFields(Forms);        
        if(!Validation)
            return 0;
                
        var UserXml = "<AddUser version='1.0' encoding='UTF-8'>";
        $(XmlStructure).find('Campo').each(function(){
            var FieldName=$(this).find("name").text();
            var type=$(this).find("type").text();
            var length=$(this).find("long").text();
            var required=$(this).find("required").text();
            var FieldValue = $('#AddTableNewUser_'+FieldName).val();
            UserXml+=
                    '<Field>'+
                        '<FieldName>'+FieldName+ '</FieldName>'+
                        '<FieldType>'+ type +'</FieldType>'+
                        '<FieldValue>'+FieldValue +'</FieldValue>'+
                    '</Field>'
                    ;
        });
        
        UserXml+='</AddUser>';
        
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Usuarios.php",
        data: "opcion=AddUser&DataBaseName="+EnvironmentData.DataBaseName+'&IdUser='+EnvironmentData.IdUsuario+'&UserName='+EnvironmentData.NombreUsuario+'&IdGroup='+EnvironmentData.IdGrupo+'&UserXml='+UserXml, 
        success:  function(xml)
        {            
            $('#UsersPlaceWaiting').remove();
            if($.parseXML( xml )===null){ Error(xml); return 0;}else xml=$.parseXML( xml );         
            
            $(xml).find('AddUser').each(function()
            {
                var Mensaje = $(this).find('Mensaje').text();
                Notificacion(Mensaje);
                CM_AddUserForms();     
            });
            
            $(xml).find("warning").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                Notificacion(mensaje);
            });

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
    
    dan = function(){
        alert("dan");
    };
       
    /************** Popover Usuario (Icono Usuario  Menú superior) *************/
    
    self.addUserLoggedPopover = function(){

        if($('#userLoggedPopupOptions').length > 0)
        return 0;

        $('#page').append('\
            <div id="userLoggedPopupOptions" class="popover">\n\
                <div class="arrow"></div>\n\
                <h3 class="popover-title"><span id = "closeUserLoggedPopupOptions" class="close pull-right" data-dismiss="popover-x">&times;</span><span class = "glyphicon glyphicon-user">  '+EnvironmentData.NombreUsuario+'</span></h3>\n\
                <div class="popover-content">\n\
                    <div class="form-group">\n\
                        <label>Cambiar Password</label>\n\
                        <input type="password" id = "firstUserLoggedPass" class="form-control" placeholder="Cambiar Contraseña">\n\
                    </div>\n\
                    <div class="form-group">\n\
                        <input type="password" id = "secondUserLoggedPass" class="form-control" placeholder="Confirmar Contraseña">\n\
                    </div>\n\
                </div>\n\
                <div class="popover-footer">\n\
                    <input type = "button" id = "btnChangeUserLoggedPassword" value = "Cambiar Contraseña" class="btn btn-sm btn-primary">\n\
                </div>\n\
            </div>');

    
    $('#userLoggedPopupOptions').modalPopover({
        target: '#mainMenuUserIcon',
        placement: 'bottom'
    });
    
        $('#mainMenuUserIcon').click(function(){
            if(!$('#userLoggedPopupOptions').is(':visible')){
                _resetUserLoggedPopover();
                $('#userLoggedPopupOptions').modalPopover('show');
            }
            else
                $('#userLoggedPopupOptions').hide();
        });
        $('#closeUserLoggedPopupOptions').click(function(){
            $('#userLoggedPopupOptions').hide();
        });
//    $('#mainMenuUserIcon').click(function(){
//        $('#userLoggedPopupOptions').popoverX('toggle');
//    });
        
        $('#btnChangeUserLoggedPassword').click(function(){
            self.changeUserLoggedPassword();
        });
//    /* Version del api de bootstrap "popoverX" */ 
//    
//    $('<li><a href="#" id = "mainMenuUserIcon" >' + NombreUsuario + '</a></li>').insertAfter('#barra_sup_username');
//    $('#page').append('\
//            <div id="myPopover1b" class="popover popover-default">\n\
//                <div class="arrow"></div>\n\
//                <h3 class="popover-title"><span class="close pull-right" data-dismiss="popover-x">&times;</span>Enter credentials</h3>\n\
//                <div class="popover-content">\n\
//                    <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.</p>\n\
//                    <form class="form-vertical">\n\
//                        <div class="form-group">\n\
//                            <input class="form-control" placeholder="Username">\n\
//                        </div>\n\
//                        <input type="password" class="form-control" placeholder="Password">\n\
//                    </form>\n\
//                </div>\n\
//                <div class="popover-footer">\n\
//                    <button type="submit" class="btn btn-sm btn-primary">Submit</button><button type="reset" class="btn btn-sm btn-default">Reset</button>\n\
//                </div>\n\
//            </div>');
    
    };
    
    _resetUserLoggedPopover = function(){
        var fieldsValidator = new ClassFieldsValidator();

        $('#firstUserLoggedPass').val("");
        $('#secondUserLoggedPass').val("");
        fieldsValidator.RemoveClassRequiredActive($('#firstUserLoggedPass'));
        fieldsValidator.RemoveClassRequiredActive($('#secondUserLoggedPass'));
        $('#firstUserLoggedPass').attr('title', '');
        $('#secondUserLoggedPass').attr('title', '');
    };
    
    _closeUserSession = function(){
        
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Usuarios.php",
        data: {opcion:"closeUserSession"}, 
        success:  function(xml)
        {            
            if($.parseXML( xml )===null){ Error(xml); return 0;}else xml=$.parseXML( xml );         
            
            $(xml).find('userSessionClosed').each(function()
            {
                location.reload();
            });

            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                Error(mensaje);
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
        });    
    };
    
};   

ClassUsers.prototype.checkNewPasswordPuted = function(){
    if(password1.length < 5){
        fieldsValidator.AddClassRequiredActive($('#firstUserLoggedPass'));
        $('#firstUserLoggedPass').attr('title', 'La contraseña debe ser mayor a 5 caracteres');
        return 0;
    }
    else
        $('#firstUserLoggedPass').attr('title', '');
    
    if(password2.length < 5){
        fieldsValidator.AddClassRequiredActive($('#secondUserLoggedPass'));
        $('#secondUserLoggedPass').attr('title', 'La contraseña debe ser mayor a 5 caracteres');
        return 0;
    }
    else
        $('#secondUserLoggedPass').attr('title', '');
    
    if(password1  === password2){     
        fieldsValidator.RemoveClassRequiredActive($('#firstUserLoggedPass'));
        fieldsValidator.RemoveClassRequiredActive($('#secondUserLoggedPass'));
        $('#firstUserLoggedPass').attr('title', '');
        $('#secondUserLoggedPass').attr('title', '');
        
        /* Cambio de contraseña */
        
    }
    else{
        fieldsValidator.AddClassRequiredActive($('#firstUserLoggedPass'));
        fieldsValidator.AddClassRequiredActive($('#secondUserLoggedPass'));
        $('#firstUserLoggedPass').attr('title', 'Las contraseñas no coinciden');
        $('#secondUserLoggedPass').attr('title', 'Las contraseñas no coinciden');
        
    }
};

ClassUsers.prototype.changeUserLoggedPassword = function(){
    var fieldsValidator = new ClassFieldsValidator();
    var password1 = $('#firstUserLoggedPass').val();
    var password2 = $('#secondUserLoggedPass').val();
    
    $.ajax({
        async:true, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Usuarios.php",
        data: {opcion:"changeUserPassword", newPassword : password1}, 
        success:  function(xml)
        {            
            if($.parseXML( xml )===null){$('#UsersPlaceWaiting').remove(); Error(xml); return 0;}else xml=$.parseXML( xml );         

            $(xml).find("passwordChanged").each(function(){
                var mensaje = $(this).find("Mensaje").text();
                Notificacion(mensaje);
                $('#userLoggedPopupOptions').hide();        /* Se cierra el Popover de Usuario*/
            });

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


    /*******************************************************************************
    *  Obtiene el listado de usuarios y los muestra en una tabla
    * @returns {undefined}
    */
   ClassUsers.prototype.CM_UsersList = function()
   {      
       var self = this;
       var Buttons = {};
       $('#div_consola_users').dialog('option','buttons',Buttons);
       $('#WS_Users').empty();       
       $('#WS_Users').append('<div class="titulo_ventana">Usuarios del Sistema</div>');
       $('#WS_Users').append('<div class="PlaceWaiting" id = "UsersPlaceWaiting"><img src="../img/loadinfologin.gif"></div>');
       var Struct = GetAllStructure('Usuarios');   
       var thead = '';
        $('#WS_Users').append('<table id="Table_UsersList" class="display hover"></table>');
        
        var cont = 0;
        
        $(Struct).find("Campo").each(function()
        {
            var name = $(this).find("name").text();
            thead+='<th>'+name+'</th>';
            
            if(name.toLowerCase()=='login')
            {
                self.LoginColumn = cont;
            }
            
            if(name.toLowerCase()=='password')
            {
                self.PasswordColumn = cont;
            }
            
            cont++;
        });
               
        thead='<thead><tr>'+thead+'<th>Acciones</th></tr></thead><tbody></tbody>';
        $('#Table_UsersList').append(thead);
        
        TableUsersdT = $('#Table_UsersList').dataTable();    
        TableUsersDT = new $.fn.dataTable.Api('#Table_UsersList');
       
       $.ajax({
        async:true, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Usuarios.php",
        data: "opcion=UsersList&DataBaseName="+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&NombreUsuario='+EnvironmentData.NombreUsuario+'&IdGrupo='+EnvironmentData.IdGrupo, 
        success:  function(xml)
        {            
            if($.parseXML( xml )===null){$('#UsersPlaceWaiting').remove(); Error(xml); return 0;}else xml=$.parseXML( xml );         

            if($(xml).find("Usuario").length>0)                            
                _BuildtableUsers(Struct,xml);
            else
                $('#UsersPlaceWaiting').remove();


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
   
    /*******************************************************************************
    * Envia el XML seleccionado por el usuario para realizar el insert de un nuevo repositorio
    * @returns {undefined}
    */   
   
   ClassUsers.prototype.CM_AddUserForms = function()
    {
        var self = this;
        $('#WS_Users').empty();
        $('#WS_Users').append('<div class="titulo_ventana">Agregar un Nuevo(s) Usuario(s)</div>');
//         $('#WS_Users').append('<center><p><h2>CARGA DE USUARIOS REMOTOS</h2></center></p><br><br>');
//        $('#WS_Users').append('<p>Autenticar LDAP: <input type="checkbox" id="UserCheckLdap"></p>');
//        $('#WS_Users').append('<p>Active Directory: <input type="checkbox" id="UserCheckActiveDir"></p>');
//        $('#WS_Users').append('<p>IP: <input type="text" id="UserInputIp"></p>');
//        $('#WS_Users').append('<p>Puerto: <input type="text" id="UserInputPuerto"></p>');
//        $('#WS_Users').append('<p>Dominio: <input type="text" id="UserInputDominio"></p>');
//        $('#WS_Users').append('<p>Usuario: <input type="text" id="UserInputUsuario"></p>');
//        $('#WS_Users').append('<p>CN: <input type="text" id="UserInputCN"></p>');
//        $('#WS_Users').append('<p>Grupo: <input type="text" id="UserInputGrupo"></p>');
//        $('#WS_Users').append('<input type="button" value="Import Idap/directory" id="UserImport">');
//        $('#WS_Users').append('<p><br><br><br><br>');
//        $('#WS_Users').append('<p><center><h2>CARGA DE USUARIOS LOCALES</h2></center></p><br><br>');
//        $('#UserImport').button();

        $('#WS_Users').append('<p>Agregar un nuevo usuario de forma manual</p>');
        $('#WS_Users').append('<table id = "AddTableNewUser"></table><br>');
        $('#WS_Users').append('<p>Seleccione un XML con la estructura de los datos de usuario en base al XSD definido por el sistema.</p>');                
                
        var UserStructure = BuildFullStructureTable('Usuarios','AddTableNewUser',0);
        
        var DialogButtons = {
            "Agregar Usuario":{text:"Agregar Usuario", click:function(){AddUser(UserStructure); }}
        };
        
        var Forms = $('#AddTableNewUser :text');
        var FieldsValidator = new ClassFieldsValidator();   
        FieldsValidator.InspectCharacters(Forms);
        
        /* ----- Input file para cargar usuarios por XML  ----- */
        $('#WS_Users').append('<br><input type ="file" accept="text/xml" id="NewUser_InputFile">');
        $('#NewUser_InputFile').change(function(){_CM_AddXmlUser();});
        
        $('#div_consola_users').dialog('option','buttons',DialogButtons);
    };
    
    ClassUsers.prototype.getIndexLoginColumn = function()
    {
        return ClassUsers.LoginColumn;
    };
    
    ClassUsers.prototype.getIndexPasswordColumn = function()
    {
        return ClassUsers.PasswordColumn;
    };    
    
    ClassUsers.prototype.closeUserSession = function(){
        
        $('#closeSessionConfirm').remove();
        $('body').append('<div id = "closeSessionConfirm"></div>');
        $('#closeSessionConfirm').append("¿Realmente desea salir del sistema?");
        $('#closeSessionConfirm').dialog({title:"Mensaje de confirmación",
        width: 300, heigth:250, modal:true, resizable:false, buttons:{
            "Cancelar": function(){$(this).remove();},
            "Cerrar Sesión": function(){_closeUserSession(); $(this).remove();}
        } });
        
    };
    
    



