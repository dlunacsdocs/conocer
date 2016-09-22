/* 
 * Copyright 2016 Daniel Luna.
 * CSDocs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global BootstrapDialog */

/**
 * @returns {AdministrativeUnit}
 * 
 * @description Script que crea la interfaz de Unidad Administrativa.
 * 
 */
var AdministrativeUnit = function () {
    /**
     * @description Agrega la acción de respuesta al dar click sobre la opción de menú de "Unidad Administrativa".
     * @returns {undefined}
     */
    this.setActionToLink = function () {
        createCoreResource();
        $('.LinkAdministrativeUnit').click(buildConsole);
    };
    
    var createCoreResource = function () {
        var status = 0;
        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "Modules/php/AdministrativeUnit.php",
            data: {option: "createCoreResource"},
            success: function (xml)
            {
                if ($.parseXML(xml) === null)
                    return errorMessage(xml);
                else
                    xml = $.parseXML(xml);
                $(xml).find('success').each(function(){
                    status = 1;
                });
                $(xml).find("Error").each(function (){
                    var mensaje = $(this).find("Mensaje").text();
                    errorMessage(mensaje);
                });
            },
            beforeSend: function () {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                errorMessage(textStatus + "<br>" + errorThrown);
            }
        });
        return status;
    };
    
    var buildConsole = function () {
        /* --- TAB UNIDAD ADMINISTRATIVA --- */
        var tabbable = $('<div>');

        var navTab = $('<ul>', {class: "nav nav-tabs"});

        var adminUnitLi = $('<li>', {class: "active"}).append('<a href="#adminUnitDiv" data-toggle="tab"><span class = "archivalAdministrativeUnitIcon"></span> Unidad Administrativa</a>');
        var serieLi = $('<li>').append('<a href="#catalogDispTree" data-toggle="tab"><span class = "archivalSerieIcon"></span> Serie</a>');

        var adminUnitDiv = $('<div>', {class: "tab-pane active", id: "adminUnitDiv", style: "max-height: calc(100vh - 200px); overflow: auto;"});
        var serieDiv = $('<div>', {class: "tab-pane", id: "catalogDispTree", style: "max-height: calc(100vh - 200px); overflow: auto;"});

        var tabContent = $('<div>', {class: "tab-content"});

        var content = $('<div>');
        var navTabBar = $('<nav>', {class: "navbar navbar-default"});
        var container = $('<div>', {class: "container-fluid"});
        var navHeader = $('<div>', {class: "navbar-header"});

        container.append(navHeader);
        container.append('<div class = "btn-group-sm" role="group">\n\
                            <a class = "btn btn-success navbar-btn newAdminUnit"><span class = "glyphicon glyphicon-plus"></span> Nuevo</a>\n\
                            <a class = "btn btn-warning navbar-btn editAdminUnit"><span class = "glyphicon glyphicon-edit"></span> Editar</a>\n\
                            <a class = "btn btn-danger navbar-btn removeAdminUnit"><span class = "glyphicon glyphicon-remove"></span> Eliminar</a>\n\
                         </div>');

        navTabBar.append(container);

        content.append(navTabBar)
                .append('<center><li class = "fa fa-spinner fa-spin fa-lg"></li></center>');

        var adminUnit = $('<div>', {id: "adminUnitTree"});
        
        content.append(adminUnit);

        adminUnitDiv.append(content);

        /* ---------------- TAB SERIE ------------------ */

        content = $('<div>');
        navTabBar = $('<nav>', {class: "navbar navbar-default"});
        container = $('<div>', {class: "container-fluid"});
        navHeader = $('<div>', {class: "navbar-header"});

        container.append(navHeader);
        container.append('<div class = "btn-group-sm" role="group">\n\
                            <a class = "btn btn-success navbar-btn newAdminUnitOfSerie"><i class="fa fa-link fa-lg"></i> Unificar</a>\n\
                            <a class = "btn btn-danger navbar-btn removeAdminUnitOfSerie"><i class="fa fa-chain-broken fa-lg"></i> Desenlazar</a>\n\
                         </div>');

        navTabBar.append(container);
        content.append(navTabBar);
        serieDiv.append(content);

        tabContent.append(adminUnitDiv);
        tabContent.append(serieDiv);

        navTab.append(adminUnitLi);
        navTab.append(serieLi);

        tabbable.append(navTab);
        tabbable.append(tabContent);

        var dialog = BootstrapDialog.show({
            title: 'Unidad Administrativa',
            size: BootstrapDialog.SIZE_NORMAL,
            type: BootstrapDialog.TYPE_PRIMARY,
            message: tabbable,
            closable: true,
            closeByBackdrop: false,
            buttons: [
            ],
            onshown: function (dialogRef) {
                
                adminUnit.dynatree({
                    minExpandLevel: 2,
                    onActivate: function(node){
                        if (parseInt(node.data.key) === 0){
                            $('.editAdminUnit').addClass('disabled');
                            $('.removeAdminUnit').addClass('disabled');
                        }
                        else{
                            $('.editAdminUnit').removeClass('disabled');
                            $('.removeAdminUnit').removeClass('disabled');
                        }
                            
                    }
                });
                
                var root = $('#adminUnitTree').dynatree('getRoot');
                
                if (typeof root === 'object') {
                    var child = root.addChild({
                        title: "Unidades Administrativas",
                        key: 0,
                        isFolder: true,
                        expand: true,
                        icon: "/img/archival/department.png",
                        minExpandLevel: 2

                    });
                    child.activate(true);
                    
                    var treeStructure = adminUnitObject.getTreeStructure();
                    
                    if (typeof treeStructure === 'object')
                        adminUnitObject.build(treeStructure);
                }

                $('.newAdminUnit').click(adminUnitObject.newAdminUnit);
                $('.editAdminUnit').click(adminUnitObject.editAdminUnit);
                $('.removeAdminUnit').click(adminUnitObject.removeAdminUnit);

                $('.removeAdminUnitOfSerie').click(function () {
                    var activeNode = $('#catalogDispTree').dynatree('getActiveNode');
                    if (typeof activeNode !== 'object')
                        return 0;
                    
                    if (activeNode.data.type === 'serie') {
                    }
                    else if (activeNode.data.type === 'adminUnit')
                        serie.removeAdminUnitConfirmation(activeNode);                    
                    else if(activeNode.data.type === 'userGroup')
                        userGroup.removeMergeUserGroupAndAdminUnitConfirmation(activeNode);
                });

                $('.newAdminUnitOfSerie').click(function () {
                    var activeNode = $('#catalogDispTree').dynatree('getActiveNode');
                    if (typeof activeNode !== 'object')
                        return 0;

                    if (activeNode.data.type === 'serie') {
//                        if (activeNode.getChildren() === null)
                            serie.mergeAdminUnitInterface();
                    }
                    else
                    if (activeNode.data.type === 'adminUnit'){
//                        if(activeNode.getChildren() === null)
                            adminUnitObject.mergeUserGroupAndAdminUnit(activeNode);
                    }
                    else if(activeNode.data.type === 'userGroup')
                        userGroup.showPermissions(activeNode);
                    
                });

                /* Inicio de Serie */

                $('#catalogDispTree').dynatree({
                    onActivate: function(node){
                        if(node.data.type === 'serie'){
                            $('.newAdminUnitOfSerie').removeClass('disabled').html('<i class="fa fa-link fa-lg"></i> Unidad Administrativa');
                            $('.removeAdminUnitOfSerie').removeClass('disabled');
                        }
                        else if(node.data.type === 'adminUnit'){
                            $('.newAdminUnitOfSerie').removeClass('disabled').html('<i class="fa fa-link fa-lg"></i> Grupos de Usuario');
                            $('.removeAdminUnitOfSerie').removeClass('disabled');
                        }
                        else if(node.data.type === 'userGroup'){
                            $('.newAdminUnitOfSerie').removeClass('disabled').html('<i class="fa fa-cogs fa-lg"></i> Permisos');
                            $('.removeAdminUnitOfSerie').removeClass('disabled');
                        }
                        else{
                            $('.newAdminUnitOfSerie').addClass('disabled');
                            $('.removeAdminUnitOfSerie').addClass('disabled');
                        }
                    }
                });

                var serieRoot = $('#catalogDispTree').dynatree('getRoot');

                if (typeof serieRoot !== 'object')
                    return errorMessage("No fué posible obtener la raíz de la estructura <b>Serie</b>");

                var series = serie.getSeriesStructure();
                if (typeof serie === 'object')
                    serie.buildTree(series);
                
                adminUnitDiv.find('.fa-spinner').remove();
            },
            onclose: function (dialogRef) {

            }
        });
    };

    /**
     * @description Objeto que almacena los métodos relacionados con la estructura de Unidades Administrativas.
     * @type type
     */
    var adminUnitObject = {
        getTreeStructure: function () {

            var structure = null;

            $.ajax({
                async: false,
                cache: false,
                dataType: "html",
                type: 'POST',
                url: "Modules/php/AdministrativeUnit.php",
                data: {option: "getAdministrativeUnitStructure"},
                success: function (xml)
                {
                    if ($.parseXML(xml) === null) {
                        errorMessage(xml);
                        return 0;
                    } else
                        xml = $.parseXML(xml);

                    if ($(xml).find("area").length > 0)
                        structure = xml;

                    $(xml).find("Error").each(function ()
                    {
                        var mensaje = $(this).find("Mensaje").text();
                        errorMessage(mensaje);
                    });

                },
                beforeSend: function () {
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    errorMessage(textStatus + "<br>" + errorThrown);
                }
            });

            return structure;
        },
        getAdminUnitWithoutSerie: function () {
            var structure = null;

            $.ajax({
                async: false,
                cache: false,
                dataType: "html",
                type: 'POST',
                url: "Modules/php/AdministrativeUnit.php",
                data: {option: "getAdminUnitWithoutSerie"},
                success: function (xml)
                {
                    if ($.parseXML(xml) === null) {
                        errorMessage(xml);
                        return 0;
                    } else
                        xml = $.parseXML(xml);

                    if ($(xml).find("area").length > 0)
                        structure = xml;

                    $(xml).find("Error").each(function ()
                    {
                        var mensaje = $(this).find("Mensaje").text();
                        errorMessage(mensaje);
                    });

                },
                beforeSend: function () {
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    errorMessage(textStatus + "<br>" + errorThrown);
                }
            });

            return structure;
        },
        build: function (structure) {
            $(structure).find('area').each(function () {
                var idAdminUnit = $(this).find('idAdminUnit').text();
                var name = $(this).find('Name').text();
                var description = $(this).find('Description').text();
                var idParent = $(this).find('idParent').text();

                var parent = $('#adminUnitTree').dynatree('getTree').getNodeByKey(idParent);
                if (typeof parent === 'object')
                    parent.addChild({
                        title: name,
                        key: idAdminUnit,
                        description: description,
                        isFolder: true,
                        icon: "/img/archival/department.png"
                    });
            });
        },
        editAdminUnit: function () {
            var activeNode = $('#adminUnitTree').dynatree('getActiveNode');

            if (typeof activeNode !== 'object')
                return Advertencia("Debe seleccionar una Unidad Administrativa");

            if (parseInt(activeNode.data.key) === 0)
                return 0;

            var content = $('<div>');
            var formGroup = $('<div>', {class: "form-group"});
            var nameLabel = $('<label>').append("Nombre");
            var nameForm = $('<input>', {class: "form-control", id: "adminUnitName", value: activeNode.data.title});
            formGroup.append(nameLabel);
            formGroup.append(nameForm);
            content.append(formGroup);

            formGroup = $('<div>', {class: "form-group"});
            var descriptionLabel = $('<label>').append("Descripción");
            var descriptionForm = $('<input>', {class: "form-control", id: "adminUnitDescription", value: activeNode.data.description});
            formGroup.append(descriptionLabel);
            formGroup.append(descriptionForm);
            content.append(formGroup);

            var dialog = BootstrapDialog.show({
                title: 'Nueva Unidad Administrativa',
                size: BootstrapDialog.SIZE_SMALL,
                type: BootstrapDialog.TYPE_INFO,
                message: content,
                closable: true,
                closeByBackdrop: true,
                buttons: [
                    {
                        label: "Modificar",
                        cssClass: "btn-warning",
                        action: function (dialogRef) {
                            var button = this;
                            BootstrapDialog.show({
                                title: 'Confirmación para Modificar',
                                size: BootstrapDialog.SIZE_SMALL,
                                type: BootstrapDialog.TYPE_WARNING,
                                message: "<p>Realmente desea Modificar la información de la Unidad Administrativa <b>" + activeNode.data.title + "</b></p>",
                                closable: true,
                                buttons: [
                                    {
                                        label: "Cancelar",
                                        action: function (confirmDialog) {
                                            confirmDialog.close();
                                        }
                                    },
                                    {
                                        label: "Modificar",
                                        cssClass: "btn-warning",
                                        action: function (confirmDialog) {
                                            confirmDialog.close();
                                            dialogRef.setClosable(false);
                                            button.spin();
                                            button.disable();

                                            if (adminUnitObject.modifyAdminUnit(activeNode))
                                                dialogRef.close();
                                            
                                            dialogRef.setClosable(true);
                                            button.stopSpin();
                                            button.enable();
                                        }
                                    }

                                ],
                                onshown: function (confirmDialog) {
                                },
                                onclose: function (confirmDialog) {

                                }
                            });
                        }
                    }

                ],
                onshown: function (dialogRef) {
                    nameForm.focus();
                },
                onclose: function (dialogRef) {

                }
            });
        },
        modifyAdminUnit: function (activeNode) {
            var status = 0;
            var name = $.trim($('#adminUnitName').val());
            var description = $.trim($('#adminUnitDescription').val());
            var idAdminUnit = activeNode.data.key;

            $.ajax({
                async: false,
                cache: false,
                dataType: "html",
                type: 'POST',
                url: "Modules/php/AdministrativeUnit.php",
                data: {option: "modifyAdminUnit", idAdminUnit: idAdminUnit, name: name, description: description},
                success: function (xml)
                {
                    if ($.parseXML(xml) === null) {
                        errorMessage(xml);
                        return 0;
                    } else
                        xml = $.parseXML(xml);

                    $(xml).find('adminUnitModified').each(function () {
                        status = 1;
                        activeNode.data.title = name;
                        activeNode.data.description = description;
                        activeNode.render();
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
                    errorMessage(textStatus + "<br>" + errorThrown);
                }
            });

            return status;

        },
        removeAdminUnit: function () {
            var activeNode = $('#adminUnitTree').dynatree('getActiveNode');

            if (typeof activeNode !== 'object')
                return Advertencia("Debe seleccionar una Unidad Administrativa");

            BootstrapDialog.show({
                title: 'Mensaje de Confirmación',
                size: BootstrapDialog.SIZE_SMALL,
                type: BootstrapDialog.TYPE_DANGER,
                message: "<p>Realmente desea eliminar la Unidad Administrativa <b>" + activeNode.data.title + "</b>?</p>",
                closable: true,
                closeByBackdrop: true,
                buttons: [
                    {
                        label: "Eliminar",
                        cssClass: "btn-danger",
                        action: function (dialogRef) {
                            var button = this;
                            dialogRef.setClosable(false);
                            button.spin();
                            button.disable();
                            if(adminUnitObject.deleteAdminUnit())
                                dialogRef.close();
                            
                            button.stopSpin();
                            button.enable();
                            dialogRef.setClosable(true);
                        }
                    }
                ],
                onshown: function (dialogRef) {

                },
                onclose: function (dialogRef) {

                }
            });
        },
        deleteAdminUnit: function () {
            var status = 0;

            var activeNode = $('#adminUnitTree').dynatree('getActiveNode');

            if (typeof activeNode !== 'object')
                return Advertencia("Debe seleccionar una Unidad Administrativa");

            if (parseInt(activeNode.data.key) === 0)
                return Advertencia("Debe seleccionar una Unidad Administrativa");

            var xml = "<delete version='1.0' encoding='UTF-8'>";

            xml += "<administrativeUnit>\n\
                        <idAdminUnit>" + activeNode.data.key + "</idAdminUnit>\n\
                   </administrativeUnit>";

            var children = activeNode.getChildren();
            if (children !== null)
                for (var cont = 0; cont < children.length; cont++) {
                    var child = children[cont];

                    xml += "<administrativeUnit>\n\
                                <idAdminUnit>" + child.data.key + "</idAdminUnit>\n\
                           </administrativeUnit>";

                    var areaChildren = children[cont].getChildren();
                    if (areaChildren !== null)
                        children = children.concat(areaChildren);
                }

            xml += "</delete>";


            $.ajax({
                async: false,
                cache: false,
                dataType: "html",
                type: 'POST',
                url: "Modules/php/AdministrativeUnit.php",
                data: {option: "deleteAdminUnit", xml: xml},
                success: function (xml)
                {
                    if ($.parseXML(xml) === null) {
                        errorMessage(xml);
                        return 0;
                    } else
                        xml = $.parseXML(xml);

                    $(xml).find('adminUnitDeleted').each(function () {
                        status = 1;
                        activeNode.remove();
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
                    errorMessage(textStatus + "<br>" + errorThrown);
                }
            });

            return status;
        },
        newAdminUnit: function () {

            var activeNode = $('#adminUnitTree').dynatree('getActiveNode');

            if (typeof activeNode !== 'object')
                return Advertencia("Debe seleccionar al menos el elemento Raíz");

            var content = $('<div>');
            var formGroup = $('<div>', {class: "form-group"});
            var nameLabel = $('<label>').append("Nombre");
            var nameForm = $('<input>', {class: "form-control", id: "adminUnitName"});
            formGroup.append(nameLabel);
            formGroup.append(nameForm);
            content.append(formGroup);

            formGroup = $('<div>', {class: "form-group"});
            var descriptionLabel = $('<label>').append("Descripción");
            var descriptionForm = $('<input>', {class: "form-control", id: "adminUnitDescription"});
            formGroup.append(descriptionLabel);
            formGroup.append(descriptionForm);
            content.append(formGroup);

            var dialog = BootstrapDialog.show({
                title: 'Nueva Unidad Administrativa',
                size: BootstrapDialog.SIZE_SMALL,
                type: BootstrapDialog.TYPE_PRIMARY,
                message: content,
                closable: true,
                closeByBackdrop: true,
                buttons: [
                    {
                        label: "Agregar",
                        cssClass: "btn-primary",
                        action: function (dialogRef) {
                            var button = this;
                            button.spin();
                            button.disable();
                            dialogRef.setClosable(false);

                            if (adminUnitObject.addNewAdminUnit(activeNode))
                                dialogRef.close();

                            dialogRef.setClosable(true);
                            button.stopSpin();
                            button.enable();
                        }
                    }

                ],
                onshown: function (dialogRef) {
                    nameForm.focus();
                },
                onclose: function (dialogRef) {

                }
            });
        },
        addNewAdminUnit: function (activeNode) {
            var status = 0;
            var name = $.trim($('#adminUnitName').val());
            var description = $.trim($('#adminUnitDescription').val());
            var idParent = activeNode.data.key;

            if (String(name).length === 0)
                return Advertencia("El campo <b>Nombre</b> es obligatorio");

            $.ajax({
                async: false,
                cache: false,
                dataType: "html",
                type: 'POST',
                url: "Modules/php/AdministrativeUnit.php",
                data: {option: "addNewAdminUnit", name: name, description: description, idParent: idParent},
                success: function (xml)
                {
                    if ($.parseXML(xml) === null) {
                        errorMessage(xml);
                        return 0;
                    } else
                        xml = $.parseXML(xml);

                    $(xml).find('newAdminUnitAdded').each(function () {
                        var idAdminUnit = $(this).find('idAdminUnit').text();
                        if (parseInt(idAdminUnit) > 0) {
                            status = 1;
                            var child = activeNode.addChild({
                                title: name,
                                key: idAdminUnit,
                                description: description,
                                isFolder: true,
                                expand: true,
                                icon: "/img/archival/department.png"
                            });

                            child.activate(true);
                        }
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
                    errorMessage(textStatus + "<br>" + errorThrown);
                }
            });

            return status;

        },
        mergeUserGroupAndAdminUnit: function (activeNode) {
            var content = $('<div>');

            var formGroup = $('<div>', {class: "form-group"});
            var formGroupNameLabel = $('<label>', {}).append("Grupo de Usuario");
            var formGroupNameSelect = $('<select>', {class: "form-control", id: "groupNameForm"});

            formGroup.append(formGroupNameLabel);
            formGroup.append(formGroupNameSelect);

            content.append(formGroup);

            BootstrapDialog.show({
                title: 'Unificar con Grupo de Usuario',
                size: BootstrapDialog.SIZE_SMALL,
                closeByBackdrop: true,
                message: content,
                buttons: [
                    {
                        icon: 'fa fa-link fa-lg',
                        label: 'Unificar',
                        cssClass: "btn-primary",
                        action: function (dialogRef) {
                            var button = this;
                            button.spin();
                            dialogRef.enableButtons(false);
                            dialogRef.setClosable(false);
                            
                            if (userGroup.mergeUserGroupAndAdminUnit(activeNode))
                                dialogRef.close();
                                
                            button.stopSpin();
                            dialogRef.setClosable(true);
                        }
                    }
                ],
                onshown: function (dialogRef) {
                    var userGroups = userGroup.getUserGroups();

                    $(userGroups).find("userGroup").each(function () {
                        var $Grupo = $(this);
                        var IdGrupo = $Grupo.find("IdGrupo").text();
                        var NombreGrupo = $Grupo.find("Nombre").text();
                        var Descripcion = $Grupo.find("Descripcion").text();

                        var option = $('<option>', {idUserGroup: IdGrupo, name: NombreGrupo}).append(NombreGrupo);
                        formGroupNameSelect.append(option);
                    });
                }
            });
        }
    };

    /**
     * @description Objeto con las funciones necesarias para ligar a Serie con unidades administrativas.
     * @type type
     */
    var serie = {
        getSeriesStructure: function () {
            var series = null;

            $.ajax({
                async: false,
                cache: false,
                dataType: "html",
                type: 'POST',
                url: "Modules/php/AdministrativeUnit.php",
                data: {option: "getSeriesStructure"},
                success: function (xml)
                {
                    if ($.parseXML(xml) === null)
                        return errorMessage(xml);
                    else
                        xml = $.parseXML(xml);

                    if ($(xml).find("serie").length > 0)
                        series = xml;

                    $(xml).find("Error").each(function ()
                    {
                        var mensaje = $(this).find("Mensaje").text();
                        errorMessage(mensaje);
                    });
                },
                beforeSend: function () {
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    errorMessage(textStatus + "<br>" + errorThrown);
                }
            });

            return series;
        },
        /**
        * La estructura de la interfaz de la pestaña Serie, se representa de la siguiente manera al construirse
        *      Fondo
        *          Subfondo
        *              Sección
        *                  Subsección
        *                      Serie
        *                          Subserie
        *                              Unidad Administrativa
        *                                  ..
        *                                      ..
        *                                          Grupo Usuario
        * @param {type} series
        * @returns {unresolved}
        */
        buildTree: function (series) {
            var serieTree = $('#catalogDispTree').dynatree('getTree');

            if (typeof serieTree !== 'object')
                return errorMessage("No fué posible obtener la raíz de la estructura <b>Serie</b>");

            $(series).find('serie').each(function () {
                var catalogDispNode     = $(this);
                var idDocDisposition    = $(catalogDispNode).find('idDocumentaryDisposition').text();
                var name                = $(catalogDispNode).find('Name').text();
                var description         = $(catalogDispNode).find('Description').text();
                var nameKey             = $(catalogDispNode).find('NameKey').text();
                var parentKey           = "serie_" + $(catalogDispNode).find('ParentKey').text();
                var nodeType            = $(catalogDispNode).find('NodeType').text();
                var idAdminUnit         = $(catalogDispNode).find('idAdminUnit').text();
                var idAdminUnitParent   = $(catalogDispNode).find('idAdminUnitParent').text();
                var adminUnitName       = $(catalogDispNode).find('adminUnitName').text();
                var adminUnitParentNode = null;
                var idUserGroup         = $(catalogDispNode).find('idUserGroup').text();
                var userGroupName       = $(catalogDispNode).find('userGroupName').text();
                var icon                = serie.getDocDispositionIcon(nodeType);
                var nodeSerieParent     = serieTree.getNodeByKey(parentKey);
                var serieChild          = null;
                var serieNodeKey        = "serie_"+nameKey;
                var serieNodeTree       = serieTree.getNodeByKey(serieNodeKey);
                var adminUnitChild      = null;
                var userGroupChild      = null;
                var userGroupKey        = "userGroup_"+idUserGroup;
                var adminUnitKey        = idDocDisposition+"_"+idAdminUnit;
                var serieNode           = {
                                            idDocDisposition: idDocDisposition,
                                            title: name,
                                            key: serieNodeKey,
                                            nameKey: nameKey,
                                            parentKey: parentKey,
                                            nodeType: nodeType,
                                            description: description,
                                            isFolder: true,
                                            icon: icon,
                                            type: nodeType,
                                            expand: true
                                        };
                var adminUnitChildNode = {
                                            title: adminUnitName,
                                            key: adminUnitKey,
                                            isFolder: true,
                                            icon: "/img/archival/department.png",
                                            type: "adminUnit",
                                            idDocDisposition: idDocDisposition,
                                            idAdminUnit: idAdminUnit
                                        };
                var userGroupChildNode = {
                                            title: userGroupName,
                                            key: userGroupKey,
                                            isFolder: true,
                                            icon: "/img/userGroup.png",
                                            type: "userGroup",
                                            idUserGroup: idUserGroup,
                                            idDocDisposition: idDocDisposition,
                                            idAdminUnit: idAdminUnit
                                        };

                if(nodeSerieParent === null)
                    serieChild = $('#catalogDispTree').dynatree('getRoot').addChild(serieNode);
                else if(serieNodeTree === null)
                    serieChild = nodeSerieParent.addChild(serieNode);
                else
                    serieChild = serieNodeTree;
                
                if (parseInt(idAdminUnit) > 0) 
                    if (serieChild !== null){
                        if(parseInt(idAdminUnitParent) > 0)
                            adminUnitParentNode = serieTree.getNodeByKey(idDocDisposition+"_"+idAdminUnitParent);

                        if (adminUnitParentNode === null)
                            adminUnitChild = serieChild.addChild(adminUnitChildNode);
                        else if(adminUnitParentNode.data.idDocDisposition === idDocDisposition)
                                adminUnitChild = adminUnitParentNode.addChild(adminUnitChildNode);
                    } 
                
                if(parseInt(idUserGroup) > 0)
                    if(adminUnitChild !== null){
                        if(serieTree.getNodeByKey(userGroupKey) === null)
                            userGroupChild = adminUnitChild.addChild(userGroupChildNode);
                    }
            });
        },
        getDocDispositionIcon: function(nodeType){
            if (nodeType === 'fondo')
                return "/img/archival/fondo.png";

            if (nodeType === 'section')
                return "/img/archival/seccion.png";

            if (nodeType === 'serie')
                return "/img/archival/serie.png";
            
            return "";
        },
        /**
         * @description Construye la interfaz para unificar una serie con una unidad administrativa
         * @returns {Number}
         */
        mergeAdminUnitInterface: function () {

            var serieTree = $('#catalogDispTree').dynatree('getActiveNode');
            var idSerie = serieTree.data.idDocDisposition;
            
            if (!parseInt(idSerie) > 0)
                return 0;

            var adminUnitTreeWithoutSerie = $('<div>', {id: 'adminUnitTreeWithoutSerie'});
            var content = $('<div>').append(adminUnitTreeWithoutSerie);
            
            BootstrapDialog.show({
                title: 'Unificar serie y Unidad Administrativa',
                size: BootstrapDialog.SIZE_NORMAL,
                message: content,
                closeByBackdrop: true,
                buttons: [
                    {
                        label: "Cancelar",
                        action: function(dialogRef){
                            dialogRef.close();
                        }
                    },
                    {
                        label: 'Unificar',
                        cssClass: "btn-primary",
                        icon: 'fa fa-link fa-lg',
                        action: function (dialogRef) {
                            var button = this;
                            button.spin();
                            button.disable();
                            dialogRef.setClosable(false);
                            
                            if (serie.mergeAdminUnitAndSerie())
                                dialogRef.close();
                            
                            dialogRef.setClosable(true);
                            button.stopSpin();
                            button.enable();
                        }
                    }
                ],
                onshown: function (dialogRef) {
                    var adminUnitsWithoutSerie = adminUnitObject.getTreeStructure();
                    serie.buildAdminUnitTree(adminUnitTreeWithoutSerie, adminUnitsWithoutSerie);
                }
            });
        },
        /**
         * @description Construye la interfaz que contiene las U. A. a asociar con una serie
         * @param {type} adminUnitTreeWithoutSerie
         * @param {type} adminUnitsWithoutSerie
         * @returns {undefined}
         */
        buildAdminUnitTree: function(adminUnitTreeWithoutSerie, adminUnitsWithoutSerie){
            adminUnitTreeWithoutSerie.dynatree({
                minExpandLevel: 2,
                children: { 
                    title: "Unidades Administrativas",
                    key: 0,
                    isFolder: true,
                    icon: "/img/archival/department.png"
                }
            });
            
            $(adminUnitsWithoutSerie).find('area').each(function () {
                var idAdminUnit = $(this).find('idAdminUnit').text();
                var name        = $(this).find('Name').text();
                var description = $(this).find('Description').text();
                var idParent    = $(this).find('idParent').text();
                var nameKey     = $(this).find('NameKey').text();

                var parent = adminUnitTreeWithoutSerie.dynatree('getTree').getNodeByKey(idParent);
                if (typeof parent === 'object')
                    parent.addChild({
                        title: name,
                        key: idAdminUnit,
                        idAdminUnit: idAdminUnit,
                        description: description,
                        nameKey: nameKey,
                        isFolder: true,
                        icon: "/img/archival/department.png",
                        activate: true
                    });
            });
        },
        /**
         * @description Relaciona un Serie con una Unidad Administrativa.
         * @returns {Number}
         */
        mergeAdminUnitAndSerie: function () {
            var status = 0,
                adminUnitActiveNode = $('#adminUnitTreeWithoutSerie').dynatree("getTree").getActiveNode(),
                idAdminUnit,
                name,
//                nameKey,
                activeNode = $('#catalogDispTree').dynatree('getActiveNode');
            
            if(typeof adminUnitActiveNode !== "object")
                return Advertencia("Debe seleccionar una Unidad Administrativa");
            
            if (typeof activeNode !== 'object')
                return errorMessage("<p>No fué posible obtener la serie activa</p>");
            
            if(String(activeNode.data.type) !== "serie")
                return Advertencia("Solo puede asociar una Unidad Administrativa a una serie");
            
            idAdminUnit = adminUnitActiveNode.data.key;
            name        = adminUnitActiveNode.data.title;
//            nameKey     = adminUnitActiveNode.data.nameKey;

            if (!parseInt(idAdminUnit) > 0)
                return Advertencia("<p>No fué posible obtener el identificador de la Unidad Administrativa</p>");

            var idSerie = activeNode.data.idDocDisposition;
            
            if(!parseInt(idSerie) > 0)
                return Advertencia("<p>No fué posible obtener el identificador de la Serie</p>");
            
//            var adminUnitIds = serie.getAdminUnitIdsPath(adminUnitActiveNode);
            var adminUnitIds = serie.getAdminUnitNodesPath(activeNode, adminUnitActiveNode);
            activeNode.expand(true);
            if(adminUnitIds.length === 0)
                return 1;
            
            $.ajax({
                async: false,
                cache: false,
                dataType: "html",
                type: 'POST',
                url: "Modules/php/AdministrativeUnit.php",
                data: {option: "mergeAdminUnitAndSerie", idsAdminUnit: adminUnitIds.join(","), idSerie: idSerie},
                success: function (xml) {

                    if ($.parseXML(xml) === null) 
                        return errorMessage(xml);
                    else
                        xml = $.parseXML(xml);

                    if ($(xml).find("doneMerge").length > 0)
                        status = 1;

                    $(xml).find("Error").each(function (){
                        var mensaje = $(this).find("Mensaje").text();
                        errorMessage(mensaje);
                    });
                },
                beforeSend: function () {
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    errorMessage(textStatus + "<br>" + errorThrown);
                }
            });

            return status;
        },
        /**
         * @description Obtiene los nodos de la Unidad Administrativa que se van a fucionar con la serie.
         * @param {type} dispCatalog Nodo activo del árbol de Catálogo de Dispo. Doc. (También llamado árbol de series.)
         * @param {object} adminUnitActiveNode Nodo activo del árbol de Unidades Administrativas (Ventana emergente)
         * @returns {undefined}
         */
        getAdminUnitNodesPath: function (dispCatalog, adminUnitActiveNode) {
            var ids = [];
            var idDocDisposition = dispCatalog.data.idDocDisposition;
            var nodes = serie.getAdminUnitNodesParentPath(dispCatalog, adminUnitActiveNode);
            for (var cont = 0; cont < nodes.length; cont++) {
                var node = nodes[cont];
                console.log(dispCatalog.data.idDocDisposition);
                console.log("Buscando: "+idDocDisposition+"_"+node.idAdminUnit);
                var adminUnitNode = $('#catalogDispTree').dynatree('getTree').getNodeByKey(idDocDisposition+"_"+node.idAdminUnit);

                if (adminUnitNode === null) {
                    dispCatalog = dispCatalog.addChild(node);
                    ids.push(node.idAdminUnit);
                } else
                    dispCatalog = adminUnitNode;
            }
            return ids;
        },
        /**
         * @description Obtiene el path de nodos de la Unidad Admin a enlazar con la serie.
         * @param {type} dispCatalog Nodo activo del árbol de Catálogo de Dispo. Doc. (También llamado árbol de series.)
         * @param {Object} adminUnitActiveNode Nodo activo de la Unidad Admin que se enlazará con la serie.
         * @returns {undefined}
         */
        getAdminUnitNodesParentPath: function (dispCatalog, adminUnitActiveNode) {
            var parent = [adminUnitActiveNode.getParent()];
            adminUnitActiveNode.idCatalogDisposition = dispCatalog.data.idDocDisposition;
            var nodes = [serie.buildAdminUnitNode(adminUnitActiveNode)];
            var adminUnitNode;
            for (var cont = 0; cont < parent.length; cont++) {
                var node = parent[cont];
                if (parseInt(node.data.key) > 0) {
                    node.idCatalogDisposition = dispCatalog.data.idDocDisposition;
                    adminUnitNode = serie.buildAdminUnitNode(node);
                    nodes.unshift(adminUnitNode);
                }

                if (node.getParent() !== null)
                    parent.push(node.getParent());
            }

            return nodes;
        },
        /**
         * @description Crea un nodo hijo de una Unidad Administrativa 
         *      perteneciente al árbol de Catàtlogo de Disp. Doc. (para este caso Series)
         * @param {object} node Nodo que será procesado.
         * @returns {undefined}
         */
        buildAdminUnitNode: function(node){
            return {
                title: node.data.title,
                key: "adminUnit_"+node.data.key+"_adminUnit_"+node.idCatalogDisposition,
                idCatalogDisposition: node.idCatalogDisposition,
                idAdminUnit: node.data.key,
                isFolder: true,
                icon: "/img/archival/department.png",
                type: "adminUnit",
                expand: true
            };
        },
        /**
         * @description Mensaje de confirmación para eliminar la relación entre una serie y una unidad administrativa
         * @param {type} activeNodeSerie
         * @returns {undefined}
         */
        removeAdminUnitConfirmation: function (activeNodeSerie) {
            var parent = activeNodeSerie.getParent();
                     
            BootstrapDialog.show({
                title: 'Mensaje de Confirmación',
                size: BootstrapDialog.SIZE_SMALL,
                type: BootstrapDialog.TYPE_DANGER,
                message: "¿Realmente desea eliminar la relación entre la serie <b>" + parent.data.title + "</b> y la Unidad Administrativa <b>"+activeNodeSerie.data.title+"</b>?",
                buttons: [
                    {
                        label: 'Cancelar',
                        id:"cancel",
                        action: function (dialogRef) {
                            dialogRef.close();
                        }
                    },
                    {
                        label: 'Eliminar',
                        cssClass: "btn-danger",
                        action: function (dialogRef) {
                            var button = this;
                            var buttonCancel = dialogRef.getButton('cancel');
                            button.spin();
                            button.disable();
                            buttonCancel.disable();
                            
                            if(serie.removeAdminUnit(activeNodeSerie))
                                dialogRef.close();
                                      
                            button.stopSpin();
                            button.enable();
                            buttonCancel.enable();
                        }
                    }
                ],
                onshown: function (dialogRef) {

                }
            });
        },
        /**
         * @description Elimina la relación entre una serie y una unidad administrativa
         * @param {type} activeNode
         * @returns {Number}
         */
        removeAdminUnit: function (activeNode) {
            var status = 1;
            var idsAdminUnit      = serie.getAdminUnitChildren(activeNode);
            var idDocDisposition = activeNode.data.idDocDisposition;
            $.ajax({
                async: false,
                cache: false,
                dataType: "html",
                type: 'POST',
                url: "Modules/php/AdministrativeUnit.php",
                data: {option: "removeAdminUnit", idsAdminUnit: idsAdminUnit.join(','), idDocDisposition:idDocDisposition},
                success: function (xml) {

                    if ($.parseXML(xml) === null) 
                        return errorMessage(xml);
                    else
                        xml = $.parseXML(xml);

                    if ($(xml).find("adminUnitRemoved").length > 0) {
                        status = 1;
                        activeNode.remove();
                    }

                    $(xml).find("Error").each(function (){
                        var mensaje = $(this).find("Mensaje").text();
                        errorMessage(mensaje);
                    });
                },
                beforeSend: function () {
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    errorMessage(textStatus + "<br>" + errorThrown);
                }
            });
            
            return status;
        },
        /**
         * @description Obtiene una cadena de id's del path de la unidad administrativa activa separados por ','
         * @param {type} adminUnitNode
         * @returns {String}
         */
        getAdminUnitChildren: function(adminUnitNode){
            var children = [adminUnitNode];
            var ids = [];
            for (var cont = 0; cont < children.length; cont++){
                var node = children[cont];
                if(parseInt(node.data.idAdminUnit) > 0){
                    ids.push(node.data.idAdminUnit);
                    if(node.getChildren() !== null)
                        children = children.concat(node.getChildren());
                }
            }
            return ids;
        },
        /**
         * @description Obtiene la serie a la que pertenece una unidad unidad administrativa seleccionada.
         * @param {object} adminUnitNode Nodo activo de Unidad Administrativa.
         * @returns {undefined}
         */
        getSerieOfAdminUnit: function(adminUnitNode){
            var serieNode = null;
            var parent = [adminUnitNode.getParent()];
            for (var cont = 0; cont < parent.length; cont++){
                var node = parent[cont];
                if(String(node.data.nodeType) == "serie")
                    serieNode = node;
                else
                    if(node.getParent() !== null)
                        parent.push(node.getParent());
            }
            return serieNode;
        }
    };

    /**
     * @description Operaciones realizadas para grupos de usuario.
     * @type type
     */
    var userGroup = {
        getUserGroups: function(){
            var groups = null;
            $.ajax({
                async: false,
                cache: false,
                dataType: "html",
                type: 'POST',
                url: "Modules/php/AdministrativeUnit.php",
                data: {option: "getUserGroups"},
                success: function (xml) {

                    if ($.parseXML(xml) === null) 
                        return errorMessage(xml);
                    else
                        xml = $.parseXML(xml);

                    if ($(xml).find("userGroup").length > 0) 
                        groups = xml;

                    $(xml).find("Error").each(function ()
                    {
                        var mensaje = $(this).find("Mensaje").text();
                        errorMessage(mensaje);
                    });
                },
                beforeSend: function () {
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    errorMessage(textStatus + "<br>" + errorThrown);
                }
            });
            return groups;
        },
        mergeUserGroupAndAdminUnit: function (activeNode) {
            var status = 0;

            var idUserGroup = $('#groupNameForm option:selected').attr('idUserGroup');
            var idAdminUnit = activeNode.data.idAdminUnit;
            var groupName = $('#groupNameForm option:selected').attr('name');
            var serieNode = serie.getSerieOfAdminUnit(activeNode);
            var idSerie = 0;
            
            if (typeof serieNode !== 'object')
                return errorMessage("No fue posible obtener el nodo de Serie.");
            
            if(!parseInt(idAdminUnit) > 0)
                return Advertencia("No pudo ser obtenido el identificador de la Unidad Administrativa Seleccionada");
            
            idSerie = serieNode.data.idDocDisposition;
     
            $.ajax({
                async: false,
                cache: false,
                dataType: "html",
                type: 'POST',
                url: "Modules/php/AdministrativeUnit.php",
                data: {option: "mergeUserGroupAndAdminUnit", idUserGroup: idUserGroup, idAdminUnit: idAdminUnit, idSerie:idSerie},
                success: function (xml) {

                    if ($.parseXML(xml) === null) {
                        errorMessage(xml);
                        return 0;
                    } else
                        xml = $.parseXML(xml);

                    if ($(xml).find("doneMerge").length > 0) {
                        status = 1;

                        var child = activeNode.addChild({
                            title: groupName,
//                            key: "userGroup_"+idUserGroup,
                            isFolder: true,
                            expand: true,
                            icon: "/img/userGroup.png",
                            type: "userGroup",
                            idUserGroup: idUserGroup
                        });

                        child.activate(true);
                    }

                    $(xml).find("Error").each(function ()
                    {
                        var mensaje = $(this).find("Mensaje").text();
                        errorMessage(mensaje);
                    });
                },
                beforeSend: function () {
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    errorMessage(textStatus + "<br>" + errorThrown);
                }
            });

            return status;
        },
        removeMergeUserGroupAndAdminUnitConfirmation: function(activeNode){
            var parent = activeNode.getParent();
            
            if(typeof parent !== 'object')
                return Advertencia("No fué posible obtener el nodo padre del grupo seleccionado");
            
            BootstrapDialog.show({
                title: 'Mensaje de Confirmación',
                type: BootstrapDialog.TYPE_DANGER,
                size: BootstrapDialog.SIZE_SMALL,
                message: "¿Realmente desea desenlazar al grupo <b>"+activeNode.data.title+"</b> de la Unidad Administrativa <b>"+parent.data.title+"</b>?",
                closeByBackdrop: true,
                buttons: [
                    {
                        label: 'Desenlazar',
                        cssClass: "btn-danger",
                        action: function (dialogRef) {
                            var button = this;
                            button.spin();
                            button.disable();
                            dialogRef.setClosable(false);
                            
                            if (userGroup.removeMergeUserGroupAndAdminUnit(activeNode))
                                dialogRef.close();
                            
                            dialogRef.setClosable(true);
                            button.stopSpin();
                            button.enable();
                        }
                    }
                ],
                onshown: function (dialogRef) {

                }
            });
        },
        removeMergeUserGroupAndAdminUnit: function(activeNode){
            var status = 0;
            
            var idUserGroup = activeNode.data.idUserGroup;
            var idAdminUnit = activeNode.data.idAdminUnit;
            
            if(!parseInt(idUserGroup) > 0)
                return Advertencia("No fue posible obtener el identificador del Grupo");
            
            if(!parseInt(idAdminUnit) > 0)
                return Advertencia("No fue posible obtener el identificador de la Unidad Administrativa");
            
            $.ajax({
                async: false,
                cache: false,
                dataType: "html",
                type: 'POST',
                url: "Modules/php/AdministrativeUnit.php",
                data: {option: "removeMergeUserGroupAndAdminUnit", idUserGroup: idUserGroup, idAdminUnit: idAdminUnit},
                success: function (xml) {

                    if ($.parseXML(xml) === null) {
                        errorMessage(xml);
                        return 0;
                    } else
                        xml = $.parseXML(xml);

                    if ($(xml).find("removed").length > 0) {
                        activeNode.remove();
                        status = 1;
                        
                    }

                    $(xml).find("Error").each(function ()
                    {
                        var mensaje = $(this).find("Mensaje").text();
                        errorMessage(mensaje);
                    });
                },
                beforeSend: function () {
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    errorMessage(textStatus + "<br>" + errorThrown);
                }
            });
            
            return status;
        },
        showPermissions: function(activeUserGroup){
            var idUserGroup = activeUserGroup.data.idUserGroup;
            var userGroupName = activeUserGroup.data.title;
            
            if(!parseInt(idUserGroup) > 0)
                return Advertencia("No fue posible recuperar el identificador del grupo de usuario seleccionado.");
            
            var UsersGroups = new ClassUsersGroups();
            UsersGroups.showPermissionsPanel(idUserGroup, userGroupName);
        }
    };

};