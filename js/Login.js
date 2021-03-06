/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var UserData = undefined;

/* global EnvironmentData, userPermissions, modulesControl */

function login()
{
    var Permissions = new ClassPermissions();
    var User = $('#form_user').val();
    var Password = $('#form_password').val();
    var instancia = $('#select_login_instancias').val();
    var database_name = $("#select_login_instancias option:selected").html();

    $.ajax({
        async: false,
        cache: false,
        dataType: "html",
        type: 'POST',
        url: "php/Login.php",
        data: "opcion=Login&UserName=" + User + "&Password=" + Password + "&IdDataBase=" + instancia + "&instanceName=" + database_name,
        success: function (xml) {
            $('.loading').remove();

            ($.parseXML(xml) === null) ? errorMessage(xml) : xml = $.parseXML(xml);

            $(xml).find("StartSession").each(function (){
                var IdUsuario = $(this).find("IdUsuario").text();
                var NombreUsuario = $(this).find("Login").text();
                var NombreGrupo = $(this).find("NombreGrupo").text();
                var IdGrupo = $(this).find("IdGrupo").text();
                var idInstance = $(this).find('idInstance').text();
                var NombreInstancia = $("#select_login_instancias option:selected").html();
                if (IdUsuario > 0){
                    
                    $('<li><a href="#" id = "mainMenuUserIcon">' + NombreUsuario + '</a></li>').insertAfter('#barra_sup_username');
                    $($('<li/>').html('<a href="#all" title = "Usted se encuentra en la instancia ' + NombreInstancia + '">' + NombreInstancia + '</a>')).insertAfter('#barra_sup_username');

                    EnvironmentData.NombreUsuario = NombreUsuario;
                    EnvironmentData.idDataBase = instancia;
                    EnvironmentData.DataBaseName = NombreInstancia;
                    EnvironmentData.IdUsuario = IdUsuario;
                    EnvironmentData.NombreGrupo = NombreGrupo;
                    EnvironmentData.IdGrupo = IdGrupo;
                    
                    UserData = {IDataBaseName: EnvironmentData.DataBaseName, dUser: EnvironmentData.IdUsuario, UserName: EnvironmentData.NombreUsuario, IdGroup: EnvironmentData.IdGrupo, GroupName: EnvironmentData.NombreGrupo};

                    var users = new ClassUsers();
                    users.addUserLoggedPopover();
                    
                    if (idInstance > 0){
                        
                        modulesControl.start(function(){
                            userPermissions = $(xml).find('permissions');
                            var ApplyPermissions = Permissions.ApplyUserPermissions();
                            if (ApplyPermissions)
                                StartSystem();
                        });

                        
                    }
                    else
                        StartSystem();

                }
                else
                    DeniedSystemStart();

            });

            $(xml).find("Error").each(function ()
            {
                var mensaje = $(this).find("Mensaje").text();
                errorMessage(mensaje);
            });

        },
        beforeSend: function () {
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $('.loading').remove();
            errorMessage(textStatus + "<br>" + errorThrown);
        }
    });
}

function checkSessionExistance()
{
    var Permissions =  new ClassPermissions();
    var activeSession = false;

    $.ajax({
        async: false,
        cache: false,
        dataType: "html",
        type: 'POST',
        url: "php/Login.php",
        data: {opcion: "checkSessionExistance"},
        success: function (xml) {

            if($.parseXML(xml) === null) 
                return errorMessage(xml);
            else
                xml = $.parseXML(xml);

            $(xml).find("StartSession").each(function ()
            {
                var IdUsuario = $(this).find("IdUsuario").text();
                var NombreUsuario = $(this).find("Login").text();
                var NombreGrupo = $(this).find("NombreGrupo").text();
                var IdGrupo = $(this).find("IdGrupo").text();
                var instanceName = $(this).find('instanceName').text();
                var idInstance = $(this).find("idInstance").text();

                if (IdUsuario > 0)
                {
                    activeSession = true;
                    $('<li><a href="#" id = "mainMenuUserIcon">' + NombreUsuario + '</a></li>').insertAfter('#barra_sup_username');
                    $($('<li/>').html('<a href="#all" title = "Usted se encuentra en la instancia ' + instanceName + '">' + instanceName + '</a>')).insertAfter('#barra_sup_username');

                    EnvironmentData.NombreUsuario = NombreUsuario;
                    EnvironmentData.DataBaseName = instanceName;
                    EnvironmentData.IdUsuario = IdUsuario;
                    EnvironmentData.NombreGrupo = NombreGrupo;
                    EnvironmentData.IdGrupo = IdGrupo;
                    
                    var users = new ClassUsers();
                    users.addUserLoggedPopover();
                    
                    modulesControl.start(function(){
                        UserData = {IDataBaseName: EnvironmentData.DataBaseName, dUser: EnvironmentData.IdUsuario, UserName: EnvironmentData.NombreUsuario, IdGroup: EnvironmentData.IdGrupo, GroupName: EnvironmentData.NombreGrupo};

                        var ApplyPermissions = Permissions.ApplyUserPermissions();

                        userPermissions = $(xml).find('permissions');

                        if(idInstance > 0){
                            if(ApplyPermissions)
                                removeLoginInterface();
                        }
                        else
                            StartSystem();
                    });
                }
                else
                    DeniedSystemStart();

            });
            
            $(xml).find("Error").each(function ()
            {
                var mensaje = $(this).find("Mensaje").text();
                errorMessage(mensaje);
            });

        },
        beforeSend: function () {
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $('.loading').remove();
            errorMessage(textStatus + "<br>" + errorThrown);
        }
    });

    return activeSession;
}

function removeLoginInterface() {
    $('#pageLogin').remove("hide");
    $('#pageLogin').addClass('initLogExit');
    $('#page, #head').addClass('vis');

}
