/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var UserData = undefined;

/* global Permissions, EnvironmentData, Users */

/*******************************************************************************
 * 
 * @returns {true or false dependiendo si existe el usuario en la BD}
 */

function login()
{
    var User = $('#form_user').val();
    var Password = $('#form_password').val();
    var instancia = $('#select_login_instancias').val();
    var database_name = $("#select_login_instancias option:selected").html();

    $.ajax({
        async: true,
        cache: false,
        dataType: "html",
        type: 'POST',
        url: "php/Login.php",
        data: "opcion=Login&UserName=" + User + "&Password=" + Password + "&IdDataBase=" + instancia + "&DataBaseName=" + database_name,
        success: function (xml) {
            $('.loading').remove();

            ($.parseXML(xml) === null) ? errorMessage(xml) : xml = $.parseXML(xml);

            $(xml).find("StartSession").each(function ()
            {
                var IdUsuario = $(this).find("IdUsuario").text();
                var NombreUsuario = $(this).find("Login").text();
                var NombreGrupo = $(this).find("NombreGrupo").text();
                var IdGrupo = $(this).find("IdGrupo").text();
                var idInstance = $(this).find('idInstance').tetx();
                var NombreInstancia = $("#select_login_instancias option:selected").html();
                if (IdUsuario > 0)
                {
                    
                    $('<li><a href="#" id = "mainMenuUserIcon">' + NombreUsuario + '</a></li>').insertAfter('#barra_sup_username');
                    $($('<li/>').html('<a href="#all" title = "Usted se encuentra en la instancia ' + NombreInstancia + '">' + NombreInstancia + '</a>')).insertAfter('#barra_sup_username');

                    EnvironmentData.NombreUsuario = NombreUsuario;
                    EnvironmentData.idDataBase = instancia;
                    EnvironmentData.DataBaseName = NombreInstancia;
                    EnvironmentData.IdUsuario = IdUsuario;
                    EnvironmentData.NombreGrupo = NombreGrupo;
                    EnvironmentData.IdGrupo = IdGrupo;
                    
                    UserData = {IDataBaseName: EnvironmentData.DataBaseName, dUser: EnvironmentData.IdUsuario, UserName: EnvironmentData.NombreUsuario, IdGroup: EnvironmentData.IdGrupo, GroupName: EnvironmentData.NombreGrupo};

                    Users.addUserLoggedPopover();
                    
                    if (idInstance > 0)
                    {
                        var ApplyPermissions = Permissions.ApplyUserPermissions();
                        if (ApplyPermissions)
                            StartSystem();
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
                Error(mensaje);
            });

        },
        beforeSend: function () {
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $('.loading').remove();
            Error(textStatus + "<br>" + errorThrown);
        }
    });
}

function checkSessionExistance()
{
    var activeSession = false;

    $.ajax({
        async: false,
        cache: false,
        dataType: "html",
        type: 'POST',
        url: "php/Login.php",
        data: {opcion: "checkSessionExistance"},
        success: function (xml) {

            ($.parseXML(xml) === null) ? errorMessage(xml) : xml = $.parseXML(xml);

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
                    
                    Users.addUserLoggedPopover();


                    UserData = {IDataBaseName: EnvironmentData.DataBaseName, dUser: EnvironmentData.IdUsuario, UserName: EnvironmentData.NombreUsuario, IdGroup: EnvironmentData.IdGrupo, GroupName: EnvironmentData.NombreGrupo};

                    var ApplyPermissions = Permissions.ApplyUserPermissions();

                    if(idInstance > 0){
                        if(ApplyPermissions)
                            removeLoginInterface();
                    }
                    else
                        removeLoginInterface();

                }
                else
                    DeniedSystemStart();

            });

            $(xml).find("Error").each(function ()
            {
                var mensaje = $(this).find("Mensaje").text();
                Error(mensaje);
            });

        },
        beforeSend: function () {
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $('.loading').remove();
            Error(textStatus + "<br>" + errorThrown);
        }
    });

    return activeSession;
}

function removeLoginInterface() {
    $('#pageLogin').remove("hide");
    $('#pageLogin').addClass('initLogExit');
    $('#page, #head').addClass('vis');

}
