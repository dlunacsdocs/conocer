/* global BootstrapDialog, EnvironmentData, Tree */

var ClassPermissions = function ()
{
    /**
     * @description Muestra el panel de permisos del grupo seleccionado.
     * @param {type} idGroup
     * @param {type} userGroupName
     * @returns {undefined}
     */
    this.showPermissionsPanel = function (idGroup, userGroupName)
    {
        var self = this;

        var tabbable = $('<div>');

        var navTab = $('<ul>', {class: "nav nav-tabs"});

        var adminUnitLi = $('<li>', {class: "active"}).append('<a href="#userGroupsPermissions" data-toggle="tab"><i class="fa fa-cogs fa-lg"></i> Permisos</a>');

        var userGroupsPermissions = $('<div>', {class: "tab-pane active", id: "userGroupsPermissions"});

        var tabContent = $('<div>', {class: "tab-content"});

        var content = $('<div>');

        var repositoryTree = $('<div>', {id: "SM_Permissions"}).append('<div id = "TreeRepositoriesUserGroups"><ul><li id = "0_MSR" data = "icon: \'Catalogo.png\'" class = "folder"> Repositorios <ul id = "MSR_0"></ul></ul></div>');
        var permissionsTreeRepositories = $('<div>', {id: "TreeToolsOptions"});

        content.append(repositoryTree);
        content.append(permissionsTreeRepositories);

        userGroupsPermissions.append(content);

        tabContent.append(userGroupsPermissions);

        navTab.append(adminUnitLi);

        tabbable.append(navTab);
        tabbable.append(tabContent);

        var dialog = BootstrapDialog.show({
            title: 'Control de Permisos para el grupo <b>' + userGroupName + '</b>',
            size: BootstrapDialog.SIZE_NORMAL,
            type: BootstrapDialog.TYPE_PRIMARY,
            message: tabbable,
            closable: true,
            closeByBackdrop: false,
            buttons: [
                {
                    label: "Aplicar",
                    cssClass: "btn-primary",
                    action: function (dialogRef) {
                        var button = this;
                        button.spin();
                        button.disable();

                        _ApplyPermissionsSettings(idGroup);

                        button.stopSpin();
                        button.enable();
                    }
                }
            ],
            onshown: function (dialogRef) {
                var reporisoty = new ClassRepository();
                var XmlRepositories = reporisoty.GetRepositories(0);

                $(XmlRepositories).find("Repository").each(function () {
                    var IdRepositorio = $(this).find('IdRepositorio').text();
                    var Nombre = $(this).find('NombreRepositorio').text();
                    var ClaveEmpresa = $(this).find('ClaveEmpresa').text();
                    console.log("Ingresando al menú el repositorio " + Nombre);
                    $('#MSR_0').append('<li id="MSR_' + IdRepositorio + '" class="folder" data="icon: \'Repositorio.png\'">' + Nombre + '<ul id="' + IdRepositorio + '_MSR"></ul>');
                });

                $('#TreeRepositoriesUserGroups').dynatree({generateIds: false, expand: true, selectMode: 3, checkbox: true, minExpandLevel: 3,
                    onClick: function (node, event) {
                        if (node.getEventTargetType(event) === "checkbox")
                            node.activate();
                        if (node.getEventTargetType(event) === "title")
                            if (!node.bSelected)
                                node.toggleSelect();
                        node.sortChildren(cmp, false);
                        //                console.log('OnClick en '+node.data.title);
                    },
                    onActivate: function (node, event)
                    {
                        node.sortChildren(cmp, false);
                        _GetAccessPermissionsListOfRepository(node, idGroup, userGroupName);   /* Obtiene los permisos sobre el repositorio */
                    },
                    onCreate: function (node, event)
                    {
                        node.sortChildren(cmp, false);
                    }
                });

                var RepositoriesTree = $('#TreeRepositoriesUserGroups').dynatree("getTree");  /* crea el árbol izquierdo (repositorios)*/
                var ShowToolsOptions = _ShowToolsOptions();   /* Muestra la lista de menús del sistema */
                _GetRepositoryAccessList(RepositoriesTree, idGroup, userGroupName);    /* Permisos de acceso (check) árbol izquierdo (repositorios)*/
                ////        
                var rootNode = RepositoriesTree.getNodeByKey("0_MSR");

                var RepositoryChildren = rootNode.getChildren();
                if (typeof RepositoryChildren === 'object')
                    RepositoryChildren[0].activate();               /* Se activa el primer repositorio */

            },
            onclose: function (dialogRef) {

            }
        });

    };

    /**
     * @description Opciones de menú del sistema.
     * @returns {undefined}
     */
    var _ShowToolsOptions = function ()
    {

        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "php/Permissions.php",
            data: 'opcion=GetToolsOptions',
            success: function (xml)
            {
                if ($.parseXML(xml) === null) {
                    $('#UsersPlaceWaiting').remove();
                    Error(xml);
                    return 0;
                } else
                    xml = $.parseXML(xml);

                if ($(xml).find("Menu").length > 0)
                {
                    _BuildTreeOfToolsOptions(xml);
                    return 1;
                }

                $(xml).find("Error").each(function ()
                {
                    var $Error = $(this);
                    var estado = $Error.find("Estado").text();
                    var mensaje = $Error.find("Mensaje").text();
                    Error(mensaje);
                    $('#UsersPlaceWaiting').remove();
                });

            },
            beforeSend: function () {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('#UsersPlaceWaiting').remove();
                Error(textStatus + "<br>" + errorThrown);
            }
        });
    };
    
    

    var _BuildTreeOfToolsOptions = function (xml)
    {
        $('.PermissionsToolsOptions').remove();
        $('#TreeToolsOptions').append('<div class = "PermissionsToolsOptions"><ul><li id="SM_0" class="folder" data="icon: \'Repositorio.png\'">Permisos<ul id = "SM_0_"></ul></ul></div>');

        $(xml).find("Menu").each(function ()
        {
            var IdMenu = $(this).find("IdMenu").text();
            var IdParent = $(this).find("IdParent").text();
            var Nombre = $(this).find("Nombre").text();
//            console.log('IdMenu = '+IdMenu+' IdParent = '+IdParent+' Nombre = '+Nombre);
            if ($('#SM_' + IdParent + '_').length > 0)
                $('#SM_' + IdParent + '_').append('<li id = "SM_' + IdMenu + '" class="folder" data="icon: \'Catalogo.png\'">' + Nombre + '<ul id="SM_' + IdMenu + '_"></ul>');
        });

        var Menus = $('.PermissionsToolsOptions').dynatree({
            generateIds: false, selectMode: 3, checkbox: true, expand: true, minExpandLevel: 3,
            onClick: function (node, event) {
                node.sortChildren(cmp, false);
                if (node.getEventTargetType(event) === "title")
                    node.toggleSelect();
            },
            onKeydown: function (node, event) {
                if (event.which === 32) {
                    node.toggleSelect();
                    return false;
                }
            }
        });

//        var Menus = $(".PermissionsToolsOptions").dynatree("getTree");
        var node = $(".PermissionsToolsOptions").dynatree("getActiveNode");
        if (node)
            node.sortChildren(cmp, false);

        return 1;
    };

    /*---------------------------------------------------------------------------
     * @description Regresa los accesos a los repositorios a los cuales el grupo seleccionado
     * tiene permiso de acceso
     * 
     * @param {type} RepositoriesTree
     * @returns {undefined}
     ---------------------------------------------------------------------------*/
    var _GetRepositoryAccessList = function (RepositoriesTree, idUserGroup, userGroupName)
    {
        $('.PermissionsPanel').append('<div class="PlaceWaiting" id = "UsersPlaceWaiting"><img src="../img/loadinfologin.gif"></div>');

        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "php/Permissions.php",
            data: 'opcion=GetRepositoryAccessList&idUserGroup=' + idUserGroup + '&userGroupName=' + userGroupName,
            success: function (xml)
            {
                $('#UsersPlaceWaiting').remove();
                if ($.parseXML(xml) === null) {
                    Error(xml);
                    return 0;
                } else
                    xml = $.parseXML(xml);

                $(xml).find("Repository").each(function ()
                {
                    var IdRepository = $(this).find('IdRepositorio').text();
                    var node = RepositoriesTree.getNodeByKey("MSR_" + IdRepository);
                    if (!node.bSelected)
                        node.toggleSelect();
//                console.log(node);

                });

                $(xml).find("Error").each(function ()
                {
                    var mensaje = $(this).find("Mensaje").text();
                    Error(mensaje);
                    $('#UsersPlaceWaiting').remove();
                });

            },
            beforeSend: function () {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('#UsersPlaceWaiting').remove();
                Error(textStatus + "<br>" + errorThrown);
            }
        });
    };

    var _GetAccessPermissionsListOfRepository = function (node, idUserGroup, userGroupName)
    {
        $('#GroupPermissionsPanel').append('<div class="Loading" id = "UsersPlaceWaiting"><img src="../img/loadinfologin.gif"></div>');

        var SplitId = node.data.key;
        SplitId = String(SplitId.split("MSR_"));
        var IdRepositorio = SplitId.replace(",", "");
        if (!(IdRepositorio > 0))
            return;

        var PermissionsTree = $(".PermissionsToolsOptions").dynatree("getTree");
        var root = PermissionsTree.getNodeByKey('SM_0');

        if ($.type(root) === 'object')
            if (!root.bSelected)
            {
                root.toggleSelect();
                root.toggleSelect();
            }
            else
                root.toggleSelect();

        $.ajax({
            async: true,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "php/Permissions.php",
            data: 'opcion=GetAccessPermissionsList&IdRepositorio=' + IdRepositorio + '&NombreRepositorio=' + node.data.title + '&IdGrupo=' + idUserGroup + '&NombreGrupo=' + userGroupName,
            success: function (xml)
            {
                $('#UsersPlaceWaiting').remove();
                if ($.parseXML(xml) === null) {
                    Error(xml);
                    return 0;
                } else
                    xml = $.parseXML(xml);

                $(xml).find("Menu").each(function ()
                {
                    var IdMenu = $(this).find('IdMenu').text();
                    var node = PermissionsTree.getNodeByKey("SM_" + IdMenu);
                    if ($.type(node) === 'object')
                        if (!node.bSelected)
                            node.toggleSelect();
                    //                console.log(node);

                });

                $(xml).find("Error").each(function ()
                {
                    var mensaje = $(this).find("Mensaje").text();
                    Error(mensaje);
                    $('#UsersPlaceWaiting').remove();
                });

            },
            beforeSend: function () {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('#UsersPlaceWaiting').remove();
                Error(textStatus + "<br>" + errorThrown);
            }
        });
    };

    var _ApplyPermissionsSettings = function (idGroup)
    {
        var self = this;
        var node = $("#TreeRepositoriesUserGroups").dynatree("getActiveNode");
        var IdRepositorio = node.data.key;
        var NombreRepositorio = node.data.title;

        IdRepositorio = String(IdRepositorio).replace("MSR_", "");

        if (!parseInt(IdRepositorio) > 0)
            return Advertencia("Debe seleccionar un repositorio.");

        if (!parseInt(idGroup) > 0)
            return Advertencia("No fue posible obtener el identificador del grupo seleccionado para aplicar los permisos");

        var SelectedRepositoriesTree = Tree.GetSelectedNodes('#TreeRepositoriesUserGroups');
        var UnselectedRepositories = Tree.GetUncheckNodes('#TreeRepositoriesUserGroups');
        var SelectedMenus = Tree.GetSelectedNodes('.PermissionsToolsOptions');
        var UnselectedMenus = Tree.GetUncheckNodes('.PermissionsToolsOptions');
        var SettingsXml = undefined;

        if (SelectedMenus === 0 || SelectedRepositoriesTree === 0)
            return 0;

        SettingsXml = "<Settings version='1.0' encoding='UTF-8'>";

        $.each(SelectedRepositoriesTree, function ()
        {
            var SplitId = this.data.key;
            SplitId = String(SplitId.split("MSR_"));
            var Id = SplitId.replace(",", "");
            if (!(Id > 0))
                return;
            SettingsXml += "<AccessToTheRepository>";
            SettingsXml += "<IdRepository>" + Id + '</IdRepository>';
            SettingsXml += "<RepositoryTitle>" + this.data.title + '</RepositoryTitle>';
            SettingsXml += "</AccessToTheRepository>";
        });

        $.each(UnselectedRepositories, function ()
        {
            var SplitId = this.data.key;
            SplitId = String(SplitId.split("MSR_"));
            var Id = SplitId.replace(",", "");
            if (!(Id > 0))
                return;
            SettingsXml += "<WithoutAccessToTheRepository>";
            SettingsXml += "<IdRepository>" + Id + '</IdRepository>';
            SettingsXml += "<RepositoryTitle>" + this.data.title + '</RepositoryTitle>';
            SettingsXml += "</WithoutAccessToTheRepository>";
        });

        $.each(SelectedMenus, function ()
        {
            var SplitId = this.data.key;
            SplitId = String(SplitId.split("SM_"));
            var Id = SplitId.replace(",", "");
            if (!(Id > 0))
                return;
            SettingsXml += "<AccessMenu>";
            SettingsXml += "<IdMenu>" + Id + '</IdMenu>';
            SettingsXml += "<MenuTitle>" + this.data.title + '</MenuTitle>';
            SettingsXml += '</AccessMenu>';
        });

        $.each(UnselectedMenus, function ()
        {
            var SplitId = this.data.key;
            SplitId = String(SplitId.split("SM_"));
            var Id = SplitId.replace(",", "");
            if (!(Id > 0))
                return;
            SettingsXml += "<WithoutAccessMenu>";
            SettingsXml += "<IdMenu>" + Id + '</IdMenu>';
            SettingsXml += "<MenuTitle>" + this.data.title + '</MenuTitle>';
            SettingsXml += '</WithoutAccessMenu>';
        });

        SettingsXml += "</Settings>";

        $.ajax({
            async: true,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "php/Permissions.php",
            data: 'opcion=ApplyPermissionsSettingsOfGroup&IdRepositorio=' + IdRepositorio + '&NombreRepositorio=' + NombreRepositorio + '&IdGrupo=' + idGroup + '&SettingsXml=' + SettingsXml,
            success: function (xml)
            {
                if ($.parseXML(xml) === null) {
                    $('#UsersPlaceWaiting').remove();
                    Error(xml);
                    return 0;
                } else
                    xml = $.parseXML(xml);

                $(xml).find("ApplySettings").each(function ()
                {
                    var Mensaje = $(this).find("Mensaje").text();
                    Notificacion(Mensaje);
                });

                $(xml).find("SystemError").each(function ()
                {
                    var mensaje = $(this).find("Mensaje").text();
                    Notificacion(mensaje);
                    $('#UsersPlaceWaiting').remove();
                });

                $(xml).find("Error").each(function ()
                {
                    var mensaje = $(this).find("Mensaje").text();
                    Error(mensaje);
                    $('#UsersPlaceWaiting').remove();
                });
            },
            beforeSend: function () {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('#UsersPlaceWaiting').remove();
                Error(textStatus + "<br>" + errorThrown);
            }
        });

    };

    var cmp = function (a, b) {
        a = a.data.title.toLowerCase();
        b = b.data.title.toLowerCase();
        return a > b ? 1 : a < b ? -1 : 0;
    };
    
    this.ApplyUserPermissions = function (IdRepositorio)
    {
        var Permissions = _GetUserPermissions(IdRepositorio);
        if ($.type(Permissions) !== 'object')
            return 0;

        var HtmlNamePermission = new Array();
        var AccessPermissions = new Array();
        var DeniedPermissions = new Array();

        $(Permissions).find('DeniedPermissions').each(function ()
        {
            DeniedPermissions[DeniedPermissions.length] = [$(this).find('IdMenu').text(), $(this).find('Nombre').text()];
        });

        $(Permissions).find('AccessPermissions').each(function ()
        {
            AccessPermissions[AccessPermissions.length] = [$(this).find('IdMenu').text(), $(this).find('Nombre').text()];
        });

        $(Permissions).find('HtmlPermissionsName').each(function ()
        {
            HtmlNamePermission[$(this).find('Nombre').text()] = $(this).find('HtmlPermissionName').text();
        });

//        console.log(HtmlNamePermission);

        for (var cont = 0; cont < DeniedPermissions.length; cont++)
        {
            var IdMenu = DeniedPermissions[cont][0];
            var NombreMenu = DeniedPermissions[cont][1];

            if (HtmlNamePermission[NombreMenu] !== undefined)
            {
                var HtmlPermissionName = "." + HtmlNamePermission[NombreMenu];
                $(HtmlPermissionName).hide();
//                console.log(HtmlPermissionName+" Denegado...");
            }
            else
                console.log("No se encontró en el diccionario de menús a " + NombreMenu);
        }

        for (var cont = 0; cont < AccessPermissions.length; cont++)
        {
            var IdMenu = AccessPermissions[cont][0];
            var NombreMenu = AccessPermissions[cont][1];
            if (HtmlNamePermission[NombreMenu] !== undefined)
            {
                var HtmlPermissionName = "." + HtmlNamePermission[NombreMenu];
                $(HtmlPermissionName).show();
//                console.log(HtmlPermissionName+" Permitido...");
            }
            else
                console.log("No se encontró en el diccionario de menús a " + NombreMenu);
        }


        return 1;
    };
    
    _GetUserPermissions = function (IdRepositorio)
    {
        var Permissions = new Array();

        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "php/Permissions.php",
            data: 'opcion=GetUserPermissions&IdRepositorio=' + IdRepositorio,
            success: function (xml)
            {
                if ($.parseXML(xml) === null) {
//                    console.log(xml);
                    return 0;
                } else
                    xml = $.parseXML(xml);

                if ($(xml).find("Error").length > 0)
                {
                    $(xml).find("Error").each(function ()
                    {
                        var $Error = $(this);
                        var estado = $Error.find("Estado").text();
                        var mensaje = $Error.find("Mensaje").text();
                        Error(mensaje);
                    });
                }
                else
                    Permissions = xml;
            },
            beforeSend: function () {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                Error(textStatus + "<br>" + errorThrown);
            }
        });

        return Permissions;
    };
    
    /**
     * @description Devuelve el listado de permisos a los que tiene acceso el usuario.
     * @returns {undefined}
     */
    this.getAllUserPermissions = function(){
        
    };
};

