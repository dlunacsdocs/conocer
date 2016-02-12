
/* global EnvironmentData, Struct, BotonesWindow, BootstrapDialog, LanguajeDataTable */

$(document).ready(function () {
        var users = new ClassUsers();

    $('.LinkUsers').click(function () {
        var users = new ClassUsers();
        users.buildConsole();
        $('#tr_NewUser').click();
    });
    
    $('#LinkCloseSession').click(function () {
            users.closeUserSession();
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
        async: true,
        cache: false,
        dataType: "html",
        type: 'POST',
        url: "php/Usuarios.php",
        data: "opcion=ExistRoot",
        success: function (xml)
        {
            //            if($.parseXML( xml )===null){$('#UsersPlaceWaiting').remove(); errorMessage(xml); return 0;}else xml=$.parseXML( xml );                    
        },
        beforeSend: function () {},
        error: function (jqXHR, textStatus, errorThrown) {
            errorMessage(textStatus + "<br>" + errorThrown);
        }
    });
}

var ClassUsers = function ()
{
    var self = this;
    this.IdUsuario = undefined;
    this.NombreUsuario = undefined;
    this.Password = undefined;
    this.LoginColumn = undefined;
    this.PasswordColumn = undefined;
    var TableUsersdT = undefined;
    var TableUsersDT = undefined;
    var CAWindowUsers = {minHeight: 500, minWidth: 800, width: 800, height: 500};


    this.buildConsole = function () {
        $('#div_consola_users').remove();
        $('body').append('<div id="div_consola_users" style="display: none">\n\
                <div class="menu_lateral">\n\
                    <div id="accordion_users">\n\
                        <div>\n\
                            <h3><a href="#">Usuarios</a></h3>\n\
                            <div>\n\
                                <table id = "UserManagementTable" class="TableInsideAccordion">\n\
                                    <tr id="tr_UsersList">\n\
                                        <td><img src="img/users.png"></td>\n\
                                        <td>Usuarios</td>\n\
                                    </tr>\n\
                                    <tr id="tr_GroupsUsers">\n\
                                        <td><img src="img/users.png"></td>\n\
                                        <td>Grupos</td>\n\
                                    </tr>\n\
                                </table>\n\
                            </div>\n\
                        </div>\n\
                    </div>\n\
                </div>\n\
                <div class="work_space" id="WS_Users"></div>\n\
            </div>');

        $('#div_consola_users').dialog(CAWindowUsers, {title: "Consola de Usuarios", close: $(this).remove()}).dialogExtend(BotonesWindow);

        /********* Efectos sobre tabla dentro de acordeón ***********/
        $('#UserManagementTable').on('click', 'tr', function ()
        {
            var active = $('#UserManagementTable tr.TableInsideAccordionFocus');
            $('#UserManagementTable tr').removeClass('TableInsideAccordionFocus');
            $('#UserManagementTable tr').removeClass('TableInsideAccordionActive');
            $(active).addClass('TableInsideAccordionFocus');
            $(this).removeClass('TableInsideAccordionHoverWithoutClass');
            $(this).addClass('TableInsideAccordionActive');
        });
        $('#UserManagementTable tr').hover(function ()
        {
            if ($(this).hasClass('TableInsideAccordionActive') || $(this).hasClass('TableInsideAccordionFocus'))
                $(this).addClass('TableInsideAccordionHoverWithClass');
            else
                $(this).addClass('TableInsideAccordionHoverWithoutClass');
        });
        $('#UserManagementTable tr').mouseout(function ()
        {
            if ($(this).hasClass('TableInsideAccordionActive') || $(this).hasClass('TableInsideAccordionFocus'))
                $(this).removeClass('TableInsideAccordionHoverWithClass');
            else
                $(this).removeClass('TableInsideAccordionHoverWithoutClass');
        });

        $('#tr_NewUser').addClass('TableInsideAccordionActive');
        /* Fin de Efectos  */

        /************************* Acciones Menu lateral ***************************/

        $("#accordion_users").accordion({header: "h3", collapsible: true, heightStyle: "content"});

        var users = new ClassUsers();

        $('#tr_UsersList').click(function () {
            users.showUserList();
        });

        $('#tr_GroupsUsers').click(function () {
            var userGroupsClass = new ClassUsersGroups();
            userGroupsClass.ShowsGroupsUsers();
        });

        $('#tr_UsersList').click();
    };

    var newUserForms = function ()
    {
        var content = $('<div>', {id: 'AddTableNewUser'});

        var userStructure;

        BootstrapDialog.show({
            title: '<i class="fa fa-user fa-lg"></i> Nuevo Usuario',
            size: BootstrapDialog.SIZE_SMALL,
            type: BootstrapDialog.TYPE_PRIMARY,
            message: content,
            closable: true,
            closeByBackdrop: true,
            closeByKeyboard: true,
            buttons: [
                {
                    icon: 'fa fa-plus-circle fa-lg',
                    label: 'Agregar',
                    cssClass: "btn-primary",
                    action: function (dialogRef) {
                        var button = this;
                        button.spin();
                        dialogRef.enableButtons(false);
                        dialogRef.setClosable(false);

                        if (AddUser(userStructure))
                            dialogRef.close();
                        else {
                            button.stopSpin();
                            dialogRef.enableButtons(true);
                            dialogRef.setClosable(true);
                        }

                    }
                },
                {
                    label: 'Cerrar',
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                }
            ],
            onshow: function () {

            },
            onshown: function (dialogRef) {
                userStructure = GetAllStructure('Usuarios');
                var designer = new Designer();

                if ($.type(userStructure) === 'object')
                    designer.buildFormsStructure(content, userStructure);

                var Forms = $(content).find('form-control');

                var FieldsValidator = new ClassFieldsValidator();
                FieldsValidator.InspectCharacters(Forms);
            }
        });

    };

    this.showUserList = function ()
    {
        var Buttons = {};
        $('#div_consola_users').dialog('option', 'buttons', Buttons);
        $('#WS_Users').empty();
        $('#WS_Users').append('<div class="PlaceWaiting" id = "UsersPlaceWaiting"><img src="../img/loadinfologin.gif"></div>');
        var Struct = GetAllStructure('Usuarios');
        var thead = '';
        $('#WS_Users').append('<table id="Table_UsersList" class="table table-striped table-bordered table-hover table-condensed"></table>');

        var cont = 0;

        $(Struct).find("Campo").each(function () {
            var name = $(this).find("name").text();
            thead += '<th>' + name + '</th>';

            if (String(name).toLowerCase() === 'login')
                self.LoginColumn = cont;

            if (String(name).toLowerCase() === 'password')
                self.PasswordColumn = cont;

            cont++;
        });

        thead = '<thead><tr>' + thead + '<th>Grupo</th></tr></thead><tbody></tbody>';
        $('#Table_UsersList').append(thead);

        TableUsersdT = $('#Table_UsersList').dataTable({
            "sDom": 'lfTrtip',
            "bInfo": false, "autoWidth": false, "oLanguage": LanguajeDataTable,
            "tableTools": {
                "aButtons": [
                    {"sExtends": "text", "sButtonText": '<i class="fa fa-plus-circle fa-lg"></i> Nuevo', "fnClick": function () {
                            newUserForms();
                        }},
                    {"sExtends": "text", "sButtonText": '<i class="fa fa-pencil-square-o fa-lg"></i> Editar', "fnClick": function () {
                            _showUserData();
                        }},
                    {"sExtends": "text", "sButtonText": '<i class="fa fa-trash fa-lg"></i> Eliminar', "fnClick": function () {
                            _CM_ConfirmRemoveUser();
                        }},
                    {
                        "sExtends": "collection",
                        "sButtonText": '<i class="fa fa-floppy-o fa-lg"></i>',
                        "aButtons": ["csv", "xls", "pdf", "copy"]
                    }
                ]
            }
        });

        TableUsersDT = new $.fn.dataTable.Api('#Table_UsersList');

        $.ajax({
            async: true,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "php/Usuarios.php",
            data: {opcion: "UsersList"},
            success: function (xml)
            {
                if ($.parseXML(xml) === null) {
                    $('#UsersPlaceWaiting').remove();
                    errorMessage(xml);
                    return 0;
                } else
                    xml = $.parseXML(xml);

                if ($(xml).find("Usuario").length > 0)
                    _BuildtableUsers(Struct, xml);
                else
                    $('#UsersPlaceWaiting').remove();


                $(xml).find("Error").each(function ()
                {
                    var $Error = $(this);
                    var estado = $Error.find("Estado").text();
                    var mensaje = $Error.find("Mensaje").text();
                    errorMessage(mensaje);
                    $('#UsersPlaceWaiting').remove();
                });

            },
            beforeSend: function () {},
            error: function (jqXHR, textStatus, errorThrown) {
                $('#UsersPlaceWaiting').remove();
                errorMessage(textStatus + "<br>" + errorThrown);
            }
        });
    };
    
    /**
     * @description Envia un XML con los usuarios a registrar en el sistema.
     * @returns {undefined}
     */
    var _CM_AddXmlUser = function ()
    {
        var self = this;
        Loading();
        var xml_usuario = document.getElementById("NewUser_InputFile");
        var archivo = xml_usuario.files;
        var data = new FormData();

        for (i = 0; i < archivo.length; i++)
        {
            data.append('archivo', archivo[i]);
            data.append('opcion', 'AddXmlUser');
        }
        ajax = objetoAjax();
        ajax.open("POST", 'php/Usuarios.php', true);
        ajax.send(data);
        ajax.onreadystatechange = function ()
        {
            if (ajax.readyState === 4 && ajax.status === 200)
            {
                $('#Loading').dialog('close');
                $('#NewUser_InputFile').remove();
                Salida(ajax.responseText);
                self.CM_AddUserForms();
            }
        };
    };

    /* Tabla que muestra la informacion de los usuarios */
    _BuildtableUsers = function (StructuraUsuarios, XmlUsuarios)
    {
        var userGroup = new ClassUsersGroups();
        var userGroupList = userGroup.getUserGroups();

        var groupsSize = $(userGroupList).find('Grupo').length;

        $(XmlUsuarios).find("Usuario").each(function () {
            var $Usuario = $(this);
            var Login = $Usuario.find("Login").text(); /* Campo por default */
            var IdUsuario = $Usuario.find("IdUsuario").text();
            var PassWord = $Usuario.find("Password").text();
            var idGroup = $Usuario.find('IdGrupo').text();
            var Data = [];

            $(StructuraUsuarios).find("Campo").each(function (){
                var name = $(this).find("name").text();
                var valor = $Usuario.find(name).text();
                Data[Data.length] = valor;
            });
                        
            $(userGroupList).find('Grupo').each(function (index) {
                if ($(this).find('IdGrupo').text() === idGroup)
                    return Data.push($(this).find('Nombre').text());
                else if (index+1 ===  parseInt(groupsSize))
                    Data.push('');
            });

            var ai = TableUsersDT.row.add(Data).draw();
            var n = TableUsersdT.fnSettings().aoData[ ai[0] ].nTr;
            n.setAttribute('id', IdUsuario);
        });

        $('#Table_UsersList tbody').on('click', 'tr', function () {
            if ($(this).hasClass('selected'))
                $(this).removeClass('selected');
            else {
                TableUsersdT.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
            }
        });

        $('#UsersPlaceWaiting').remove();

        $('#Table_UsersList tbody').on('click', 'tr', function (){
            TableUsersDT.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            var IdRow = $('#Table_UsersList tr.selected').attr('id');

            var position = TableUsersdT.fnGetPosition(this); // getting the clicked row position
            IdUsuario = IdRow;
            NombreUsuario = TableUsersdT.fnGetData(position)[self.LoginColumn];
            Password = TableUsersdT.fnGetData(position)[self.PasswordColumn];
        });

        TableUsersdT.find('tbody tr:eq(0)').click();  /* Activa la primera fila  */

    };

    var _showUserData = function () {
        var idUser = $('#Table_UsersList tr.selected').attr('id');

        if (parseInt(idUser) > 0)
            _openUserInfoPanel(idUser);

    };

    var _openUserInfoPanel = function (idUser) {
        var content = $('<div>', {id: "div_edit_user"});
        content.append('<center><i class="fa fa-spinner fa-spin fa-lg"></i></center>');
        var StructUser;

        BootstrapDialog.show({
            title: '<i class="fa fa-user fa-lg"></i> Información de Usuario',
            size: BootstrapDialog.SIZE_SMALL,
            type: BootstrapDialog.TYPE_INFO,
            message: content,
            closable: true,
            closeByBackdrop: true,
            closeByKeyboard: true,
            buttons: [
                {
                    icon: 'fa-pencil-square fa-lg',
                    label: 'Modificar',
                    cssClass: "btn-warning",
                    action: function (dialogRef) {
                        var button = this;
                        button.spin();
                        dialogRef.enableButtons(false);
                        dialogRef.setClosable(false);

                        if (_ModifyUser(StructUser, idUser))
                            dialogRef.close();
                        else {
                            button.stopSpin();
                            dialogRef.enableButtons(true);
                            dialogRef.setClosable(true);
                        }

                    }
                },
                {
                    label: 'Cerrar',
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                }
            ],
            onshown: function (dialogRef) {
                dialogRef.enableButtons(false);

                StructUser = GetAllStructure('Usuarios');
                var designer = new Designer();
                designer.buildFormsStructure(content, StructUser);

                var Forms = $(content).find('.form-control');
                var FieldsValidator = new ClassFieldsValidator();
                FieldsValidator.InspectCharacters(Forms);

                var userInfo = _getUserInfo(idUser);

                $(StructUser).find("Campo").each(function () {
                    var $Campo = $(this);
                    var name = $Campo.find("name").text();
                    var type = $Campo.find("type").text();
                    var long = $Campo.find("long").text();
                    var required = $Campo.find("required").text();
                    var value = $(userInfo).find(name).text();

                    $('#div_edit_user_' + name).val(value);

                    if (String(name).toLowerCase() === 'password')
                        $('#div_edit_user_' + name).attr('type', 'password');

                });

                dialogRef.enableButtons(true);

                content.find('.fa-spinner').remove();
            }
        });
    };

    /**
     * @description Retorna los datos del usuario.
     * @param {Integer} IdUser
     * @returns {undefined}
     */
    _getUserInfo = function (IdUser)
    {
        var userStructure;

        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "php/Usuarios.php",
            data: 'opcion=GetInfoUser&IdUser=' + IdUser,
            success: function (xml)
            {
                if ($.parseXML(xml) === null)
                    return errorMessage(xml);
                else
                    xml = $.parseXML(xml);

                if ($(xml).find('Usuario').length > 0)
                    userStructure = xml;

                $(xml).find("Error").each(function ()
                {
                    var $Error = $(this);
                    var estado = $Error.find("Estado").text();
                    var mensaje = $Error.find("Mensaje").text();
                    errorMessage(mensaje);
                });

            },
            beforeSend: function () {},
            error: function (jqXHR, textStatus, errorThrown) {
                errorMessage(textStatus + "<br>" + errorThrown);
            }
        });

        return userStructure;
    };

    /*
     * 
     * @param {type} StructUser
     * @param {type} IdModifyUser
     * @returns {undefined}
     */
    var _ModifyUser = function (StructUser, IdModifyUser)
    {
        var status = 0;
        var Forms = $('#table_edit_user :text');
        var FieldsValidator = new ClassFieldsValidator();
        var Validation = FieldsValidator.ValidateFields(Forms);
        if (!Validation)
            return 0;

        var Data = [];

        var UserNameModiffied = '';
        var xml = "<Modify version='1.0' encoding='UTF-8'>";

        $(StructUser).find("Campo").each(function ()
        {
            var $Campo = $(this);
            var name = $Campo.find("name").text();
            var type = $Campo.find("type").text();
            var long = $Campo.find("long").text();
            var required = $Campo.find("required").text();
            var value = $('#div_edit_user_' + name).val();

            if (String(name).toLowerCase() === "login")
                UserNameModiffied = value;

            xml += '<Campo>\n\
               <name>' + name + '</name>\n\
               <value>' + value + '</value>\n\
               <type>' + type + '</type>\n\
               <long>' + long + '</long>\n\
           </Campo>';

            Data[Data.length] = value;

        });

        xml += '</Modify>';

        $('#div_edit_user').append('<div class="PlaceWaiting" id = "UsersPlaceWaiting"><img src="../img/loadinfologin.gif"></div>');

        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "php/Usuarios.php",
            data: "opcion=ModifyUser&DataBaseName=" + EnvironmentData.DataBaseName + '&IdUser=' + EnvironmentData.IdUsuario + '&UserName=' + EnvironmentData.NombreUsuario + '&IdGrupo=' + EnvironmentData.IdGrupo + "&IdModifyUser=" + IdModifyUser + '&UserNameModiffied=' + UserNameModiffied + '&ModifyFileXml=' + xml,
            success: function (xml)
            {
                $('#UsersPlaceWaiting').remove();
                if ($.parseXML(xml) === null) {
                    errorMessage(xml);
                    return 0;
                } else
                    xml = $.parseXML(xml);
                $(xml).find("Modify").each(function ()
                {
                    status = 1;
                    var mensaje = $(this).find("Mensaje").text();
                    Notificacion(mensaje);

                    $('#Table_UsersList tr.selected').each(function ()
                    {
                        var position = TableUsersdT.fnGetPosition(this);
                        for (var cont = 0; cont < Data.length; cont++)
                            TableUsersdT.fnUpdate([Data[cont]], position, cont, false);
                    });

                });

                $(xml).find("Error").each(function ()
                {
                    var $Error = $(this);
                    var estado = $Error.find("Estado").text();
                    var mensaje = $Error.find("Mensaje").text();
                    errorMessage(mensaje);
                });

            },
            beforeSend: function () {},
            error: function (jqXHR, textStatus, errorThrown) {
                $('#UsersPlaceWaiting').remove();
                errorMessage(textStatus + "<br>" + errorThrown);
            }
        });

        return status;
    };

    _CM_ConfirmRemoveUser = function ()
    {
        BootstrapDialog.show({
            title: '<i class="fa fa-exclamation-triangle fa-lg"></i> Mensaje de Confirmación',
            size: BootstrapDialog.SIZE_SMALL,
            type: BootstrapDialog.TYPE_DANGER,
            message: '<p>Realmente desea elminar al usuario <b>' + NombreUsuario + '</b></p>',
            closable: true,
            closeByBackdrop: true,
            closeByKeyboard: true,
            buttons: [
                {
                    icon: 'fa-trash-o fa-lg',
                    label: 'Eliminar',
                    cssClass: "btn-danger",
                    action: function (dialogRef) {
                        var button = this;
                        button.spin();
                        dialogRef.enableButtons(false);
                        dialogRef.setClosable(false);

                        if (_deleteUser())
                            dialogRef.close();
                        else {
                            button.stopSpin();
                            dialogRef.enableButtons(true);
                            dialogRef.setClosable(true);
                        }

                    }
                },
                {
                    label: 'Cerrar',
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                }
            ],
            onshown: function (dialogRef) {

            }
        });

    };

    var _deleteUser = function ()
    {
        var status = 0;
        var IdRemoveUser = $('#Table_UsersList tr.selected').attr('id');

        if (!parseInt(IdRemoveUser) > 0)
            return Advertencia("No fue posible recuperar el identificador del usuario");

        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "php/Usuarios.php",
            data: 'opcion=CM_RemoveUser&IdRemoveUser=' + IdRemoveUser + '&NameUserToRemove = ' + this.NombreUsuario + '&Password=' + this.Password,
            success: function (xml)
            {
                if ($.parseXML(xml) === null)
                    return errorMessage(xml);
                else
                    xml = $.parseXML(xml);

                $(xml).find("RemoveUser").each(function () {
                    status = 1;
                    var $Usuario = $(this);
                    var Mensaje = $Usuario.find("Mensaje").text();
                    Notificacion(Mensaje);

                    TableUsersDT.row('tr[id=' + IdRemoveUser + ']').remove().draw(false);
                    TableUsersdT.find('tbody tr:eq(0)').click();  /* Activa la primera fila  */
                });

                $(xml).find("Error").each(function () {
                    var $Error = $(this);
                    var estado = $Error.find("Estado").text();
                    var mensaje = $Error.find("Mensaje").text();
                    errorMessage(mensaje);
                });

            },
            beforeSend: function () {},
            error: function (jqXHR, textStatus, errorThrown) {
                errorMessage(textStatus + "<br>" + errorThrown);
            }
        });

        return status;
    };



    var AddUser = function (XmlStructure)
    {
        var status = 0;
        var Forms = $('#AddTableNewUser input');
        var FieldsValidator = new ClassFieldsValidator();
        var Validation = FieldsValidator.ValidateFields(Forms);
        var data = [];

        if (!Validation)
            return 0;

        var UserXml = "<AddUser version='1.0' encoding='UTF-8'>";
        $(XmlStructure).find('Campo').each(function () {
            var FieldName = $(this).find("name").text();
            var type = $(this).find("type").text();
            var length = $(this).find("long").text();
            var required = $(this).find("required").text();
            var FieldValue = $('#AddTableNewUser_' + FieldName).val();
            UserXml +=
                    '<Field>' +
                    '<FieldName>' + FieldName + '</FieldName>' +
                    '<FieldType>' + type + '</FieldType>' +
                    '<FieldValue>' + FieldValue + '</FieldValue>' +
                    '</Field>'
                    ;

            if (String(FieldName).toLowerCase() === 'password')
                data.push('');
            else
                data.push(FieldValue);
        });
        
        UserXml += '</AddUser>';
        
        data.push('');  /* Columna de Grupo */

        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "php/Usuarios.php",
            data: {"opcion": "AddUser", 'UserXml': UserXml},
            success: function (xml)
            {
                if ($.parseXML(xml) === null)
                    return errorMessage(xml);
                else
                    xml = $.parseXML(xml);

                $(xml).find('userAdded').each(function ()
                {
                    status = 1;
                    var Mensaje = $(this).find('Mensaje').text();
                    Notificacion(Mensaje);

                    var idUser = $(xml).find('idUser').text();

                    var ai = TableUsersDT.row.add(data).draw();
                    var n = TableUsersdT.fnSettings().aoData[ ai[0] ].nTr;
                    n.setAttribute('id', idUser);

                    TableUsersdT.find('tr[id=' + idUser + ']').click();
                });

                $(xml).find("warning").each(function ()
                {
                    var mensaje = $(this).find("Mensaje").text();
                    Notificacion(mensaje);
                });

                $(xml).find("Error").each(function ()
                {
                    var mensaje = $(this).find("Mensaje").text();
                    errorMessage(mensaje);
                });

            },
            beforeSend: function () {},
            error: function (jqXHR, textStatus, errorThrown) {
                errorMessage(textStatus + "<br>" + errorThrown);
            }
        });

        return status;
    };

    /************** Popover Usuario (Icono Usuario  Menú superior) *************/

    self.addUserLoggedPopover = function () {

        if ($('#userLoggedPopupOptions').length > 0)
            return 0;

        $('#page').append('\
            <div id="userLoggedPopupOptions" class="popover">\n\
                <div class="arrow"></div>\n\
                <h3 class="popover-title"><span id = "closeUserLoggedPopupOptions" class="close pull-right" data-dismiss="popover-x">&times;</span><span class = "glyphicon glyphicon-user">  ' + EnvironmentData.NombreUsuario + '</span></h3>\n\
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

        $('#mainMenuUserIcon').click(function () {
            if (!$('#userLoggedPopupOptions').is(':visible')) {
                _resetUserLoggedPopover();
                $('#userLoggedPopupOptions').modalPopover('show');
            } else
                $('#userLoggedPopupOptions').hide();
        });
        $('#closeUserLoggedPopupOptions').click(function () {
            $('#userLoggedPopupOptions').hide();
        });
//    $('#mainMenuUserIcon').click(function(){
//        $('#userLoggedPopupOptions').popoverX('toggle');
//    });

        $('#btnChangeUserLoggedPassword').click(function () {
            changeUserLoggedPassword();
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

    _resetUserLoggedPopover = function () {
        var fieldsValidator = new ClassFieldsValidator();

        $('#firstUserLoggedPass').val("");
        $('#secondUserLoggedPass').val("");
        fieldsValidator.RemoveClassRequiredActive($('#firstUserLoggedPass'));
        fieldsValidator.RemoveClassRequiredActive($('#secondUserLoggedPass'));
        $('#firstUserLoggedPass').attr('title', '');
        $('#secondUserLoggedPass').attr('title', '');
    };

    _closeUserSession = function () {

        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "php/Usuarios.php",
            data: {opcion: "closeUserSession"},
            success: function (xml)
            {
                if ($.parseXML(xml) === null) {
                    errorMessage(xml);
                    return 0;
                } else
                    xml = $.parseXML(xml);

                $(xml).find('userSessionClosed').each(function ()
                {
                    location.reload();
                });

                $(xml).find("Error").each(function ()
                {
                    var mensaje = $(this).find("Mensaje").text();
                    errorMessage(mensaje);
                });

            },
            beforeSend: function () {},
            error: function (jqXHR, textStatus, errorThrown) {
                errorMessage(textStatus + "<br>" + errorThrown);
            }
        });
    };

    var changeUserLoggedPassword = function () {
        var fieldsValidator = new ClassFieldsValidator();
        var password1 = $('#firstUserLoggedPass').val();
        var password2 = $('#secondUserLoggedPass').val();

        $.ajax({
            async: true,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "php/Usuarios.php",
            data: {opcion: "changeUserPassword", newPassword: password1},
            success: function (xml)
            {
                if ($.parseXML(xml) === null) {
                    $('#UsersPlaceWaiting').remove();
                    errorMessage(xml);
                    return 0;
                } else
                    xml = $.parseXML(xml);

                $(xml).find("passwordChanged").each(function () {
                    var mensaje = $(this).find("Mensaje").text();
                    Notificacion(mensaje);
                    $('#userLoggedPopupOptions').hide();        /* Se cierra el Popover de Usuario*/
                });

                $(xml).find("Error").each(function ()
                {
                    var $Error = $(this);
                    var estado = $Error.find("Estado").text();
                    var mensaje = $Error.find("Mensaje").text();
                    errorMessage(mensaje);
                    $('#UsersPlaceWaiting').remove();
                });

            },
            beforeSend: function () {},
            error: function (jqXHR, textStatus, errorThrown) {
                $('#UsersPlaceWaiting').remove();
                errorMessage(textStatus + "<br>" + errorThrown);
            }
        });

    };

};

ClassUsers.prototype.getIndexLoginColumn = function ()
{
    return ClassUsers.LoginColumn;
};

ClassUsers.prototype.getIndexPasswordColumn = function ()
{
    return ClassUsers.PasswordColumn;
};

ClassUsers.prototype.closeUserSession = function () {

    BootstrapDialog.confirm({
        title: '<span class = "glyphicon glyphicon-warning-sign"></span> Advertencia',
        message: 'Se cerrará la sesión. ¿Desea continuar?',
        type: BootstrapDialog.TYPE_WARNING, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
        size: BootstrapDialog.SIZE_SMALL,
        closable: true, // <-- Default value is false
        draggable: false, // <-- Default value is false
        btnCancelLabel: 'Cancelar', // <-- Default value is 'Cancel',
        btnOKLabel: 'Cerrar Sesión', // <-- Default value is 'OK',
        btnOKClass: 'btn-danger', // <-- If you didn't specify it, dialog type will be used,
        callback: function (result) {
            // result will be true if button was click, while it will be false if users close the dialog directly.
            if (result) {
                _closeUserSession();
            } else {

            }
        }
    });

};