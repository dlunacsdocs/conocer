/* 
 * Copyright 2016 daniel.
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
/* global BootstrapDialog, DocumentEnvironment */

var Topography = function(){
    this.setActionToLink = function(){
        $('.LinkTopography').click(openInterface);
    };
    
    /**
     * @description Se construye opcion dentro del panel principal para topografia.
     * @returns {undefined}
     */
    this.buildContentTopographyLink = function(){
        $('.expedientModuleLink .dropdown-menu').append('\n\
                <li class = "contentTopographyLink"><a href="#"><i class="fa fa-plus-circle fa-lg"></i> Topografia </span> </a></li>\n\
            ');

        $('.contentTopographyLink').on('click',openTopographyFromContent);
    };
    
    /**
     * @description Consulta de topografia desde el content.
     * @returns {undefined}
     */
    var openTopographyFromContent = function(){
        var idRepository = $('#CM_select_repositorios option:selected').attr('idrepository');
        var repositoryName = $('#CM_select_repositorios option:selected').attr('repositoryname');
        var activeNode = $('#contentTree').dynatree('getActiveNode');
        if (activeNode === null)
            return Advertencia("No fue posible obtener el directorio activo");
        if(parseInt(activeNode.data.isLegajo) !== 1)
            return Advertencia("Solo puede ubicar Legajos");
        if(repositoryName === undefined ||idRepository === undefined)
            return Advertencia("Seleccione un repositorio");
        
        var tramiteTree = $('<div>', {id: "tramiteTree"});
        var concentracionTree = $('<div>', {id: "concentracionTree"});
        var historicoTree = $('<div>', {id: "historicoTree"});
        var content = getTopographyObject(1, tramiteTree, concentracionTree, historicoTree);
        BootstrapDialog.show({
            title: 'Asignar Topografia',
            message: content,
            closable: true,
            closeByBackdrop: false,
            closeByKeyboard: true,
            size: BootstrapDialog.SIZE_NORMAL,
            type: BootstrapDialog.TYPE_PRIMARY,
            buttons: [
                {
                    label: 'Cerrar',
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                },
                {
                    label: "Asignar",
                    cssClass: "btn-primary",
                    icon: "fa fa-archive fa-lg",
                    action: function(dialogRef){
                        var button = this;
                        button.spin();
                        dialogRef.enableButtons(false);
                        dialogRef.setClosable(false);
                        if(setUbicationToLegajo(activeNode,repositoryName))
                            return dialogRef.close();
                        button.stopSpin();
                        dialogRef.enableButtons(true);
                        dialogRef.setClosable(true);
                    }
                }
            ],
            onshown: function (dialogRef) {
                buildStructure(tramiteTree, "Tramite", "Tramite");
                buildStructure(concentracionTree, "Concentracion", "Concentracion", "Concentracion");
                buildStructure(historicoTree, "Historico", "Historico");
                var topographyStructure = getTopographyStructure();
                addSectionsChildren(topographyStructure);
            }
        });
    };
    
    /**
     * @description Ubica un legajo en la topografia seleccionada.
     * @param {type} activeNode
     * @param {type} repositoryName
     * @returns {Number}
     */
    var setUbicationToLegajo = function(activeNode, repositoryName){
        var status = 0;
        var optionName = getActiveTopographyName();
        var topographyNode = null;
        if($('#'+optionName+'Tree').length > 0)
            topographyNode = $('#'+optionName+'Tree').dynatree('getTree').getActiveNode();
        if(topographyNode === null)
            return Advertencia("No fue posible obtener el nodo seleccionado de loa topografia.");
        if(!parseInt(topographyNode.data.key) > 0)
            return Advertencia("Debe seleccionar un destino para la topografia.");

        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "Modules/php/Topography.php",
            data: {option: "setUbicationToLegajo",
                    idDirectory: activeNode.data.key,
                    repositoryName: repositoryName,
                    structureType: topographyNode.data.structureType,
                    idTopography: topographyNode.data.key
            },
            success: function (xml) {
                if ($.parseXML(xml) === null)
                    return errorMessage(xml);
                else
                    xml = $.parseXML(xml);

                ($(xml).find('topographyAdded').each(function(){
                    var message = $(this).find('Mensaje').text();
                    Notificacion(message);
                    status = 1;
                }));
                    
                $(xml).find('Error').each(function ()
                {
                    var Mensaje = $(this).find('Mensaje').text();
                    errorMessage(Mensaje);
                });
            },
            beforeSend: function () {
            },
            error: function (objXMLHttpRequest) {
                errorMessage(objXMLHttpRequest);
            }
        });
        return status;
    };
    
    /**
     * @description Obtiene el nodo activo en el tab activo en la interfaz de la topografia.
     * @returns {undefined}
     */
    var getActiveTopographyName = function(){
        var activeTab = $('#topographyNavTab ul.nav-tabs li.active').attr('optionname');
        return activeTab;
    };
    
    /**
     * @param {Boolean} openFromContent Si esta activa la bandera esta indica que se abre la interfaz desde
     * el content.
     * @description Se abre interfaz principal.
     * @returns {undefined}
     */
    var openInterface = function(openFromContent){        
        var tramiteTree = $('<div>', {id: "tramiteTree"});
        var concentracionTree = $('<div>', {id: "concentracionTree"});
        var historicoTree = $('<div>', {id: "historicoTree"});
        var content = getTopographyObject(openFromContent, tramiteTree, concentracionTree, historicoTree);
        BootstrapDialog.show({
            title: 'Topografia',
            message: content,
            closable: true,
            closeByBackdrop: false,
            closeByKeyboard: true,
            size: BootstrapDialog.SIZE_NORMAL,
            type: BootstrapDialog.TYPE_PRIMARY,
            buttons: [
                {
                    label: 'Cerrar',
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                }
            ],
            onshown: function (dialogRef) {
                buildStructure(tramiteTree, "Tramite", "Tramite");
                buildStructure(concentracionTree, "Concentracion", "Concentracion", "Concentracion");
                buildStructure(historicoTree, "Historico", "Historico");
                var topographyStructure = getTopographyStructure();
                console.log("topographyStructure::");
                console.log(topographyStructure);
                addSectionsChildren(topographyStructure);
        
               $('.topographyButtonAdd').click(function(){
                   newStructureInterface($(this).attr('optionName'), $(this).attr('optionTitle'));
               });
               
               $('.topographyButtonEdit').click(function(){
                   editSection($(this).attr('optionName'));
               });
               
               $('.topographyButtonRemove').click(function(){
                   deleteStructureInterface($(this).attr('optionName'));
               });
            }
        });
    };
    
    /**
     * @description Devuelve un objeto con los elementos base para la construccion de la topografia.
     * @param {type} openFromContent
     * @param {type} tramiteTree
     * @param {type} concentracionTree
     * @param {type} historicoTree
     * @returns {Topography.getTopographyObject.content|$}
     */
    var getTopographyObject = function(openFromContent, tramiteTree, concentracionTree, historicoTree){
        var content = $('<div>');
        var tabbable = $('<div>',{id:"topographyNavTab"});
        
        var navTab = $('<ul>', {class:"nav nav-tabs"});
        
        var tramiteLi = $('<li>', {optionName: "tramite", class:"active"}).append('<a href="#fondoTree" data-toggle="tab"> Tramite</a>');
        var concentracionLi = $('<li>', {optionName: "concentracion"}).append('<a href="#sectionTree" data-toggle="tab"> Concentracion</a>');
        var historicoLi = $('<li>',{optionName: "historico"}).append('<a href="#serieTree" data-toggle="tab"> Historico</a>');
        
        var tramiteDiv = $('<div>',{optionName: "tramite", class:"tab-pane active", style: "max-height: calc(100vh - 200px); overflow: auto;"});
        var concentracionDiv = $('<div>',{optionName: "concentracion", class:"tab-pane", style: "max-height: calc(100vh - 200px); overflow: auto;"});
        var historicoDiv = $('<div>',{optionName: "historico", class:"tab-pane", style: "max-height: calc(100vh - 100px); overflow: auto;"});
        
        var tabContent = $('<div>', {class:"tab-content"});
        
        if(openFromContent !== 1)
            setTopographyOptionsPanel(tramiteDiv, concentracionDiv, historicoDiv);
        
        tabContent.append(tramiteDiv);
        tabContent.append(concentracionDiv);
        tabContent.append(historicoDiv);
        
        navTab.append(tramiteLi);
        navTab.append(concentracionLi);
        navTab.append(historicoLi);
        
        tabbable.append(navTab);
        tabbable.append(tabContent);
        
        tramiteDiv.append(tramiteTree);
        concentracionDiv.append(concentracionTree);
        content.append(tabbable);
        historicoDiv.append(historicoTree);
        return content;
    };
    /**
     * @description Inserta el panel de opciones de la topografia.
     * @param {type} tramiteDiv
     * @param {type} concentracionDiv
     * @param {type} historicoDiv
     * @returns {undefined}
     */
    var setTopographyOptionsPanel = function(tramiteDiv, concentracionDiv, historicoDiv){
        var navTabBar = $('<nav>',{class:"navbar navbar-default"});
        var container = $('<div>',{ class: "container-fluid"});
        var navHeader = $('<div>', {class: "navbar-header"});
        
        container.append(navHeader);
        container.append('<div class = "btn-group-sm" role="group">\n\
                            <button optionTitle = "Tramite" optionName = "tramite" class = "topographyButtonAdd btn btn-primary navbar-btn"><li class = "fa fa-plus fa-lg"></li></button>\n\
                            <button optionTitle = "Tramite" optionName = "tramite" class = "topographyButtonEdit btn btn-warning navbar-btn"><span class = "glyphicon glyphicon-edit"></span></button>\n\
                            <button optionTitle = "Tramite" optionName = "tramite" class = "topographyButtonRemove btn btn-danger navbar-btn"><span class = "glyphicon glyphicon-remove"></span></button>\n\
                        </div>');        
        navTabBar.append(container);
        tramiteDiv.append(navTabBar);
        
        navTabBar = $('<nav>',{class:"navbar navbar-default"});
        container = $('<div>',{ class: "container-fluid"});
        navHeader = $('<div>', {class: "navbar-header"});
        container.append(navHeader);
        container.append('<div class = "btn-group-sm" role="group">\n\
                            <button optionTitle = "Concentracion" optionName = "concentracion" class = "topographyButtonAdd btn btn-primary navbar-btn"><li class = "fa fa-plus fa-lg"></li></button>\n\
                            <button optionTitle = "Concentracion" optionName = "concentracion" class = "topographyButtonEdit btn btn-warning navbar-btn"><span class = "glyphicon glyphicon-edit"></span></button>\n\
                            <button optionTitle = "Tramite" optionName = "tramite" class = "topographyButtonRemove btn btn-danger navbar-btn"><span class = "glyphicon glyphicon-remove"></span></button>\n\
                        </div>');              
        navTabBar.append(container);
        concentracionDiv.append(navTabBar);
        
        navTabBar = $('<nav>',{class:"navbar navbar-default"});
        container = $('<div>',{ class: "container-fluid"});
        navHeader = $('<div>', {class: "navbar-header"});
        container.append(navHeader);
        container.append('<div class = "btn-group-sm" role="group">\n\
                            <button optionTitle = "Historico" optionName = "historico" class = "topographyButtonAdd btn btn-primary navbar-btn"><li class = "fa fa-plus fa-lg"></li></button>\n\
                            <button optionTitle = "Historico" optionName = "historico" class = "topographyButtonEdit btn btn-warning navbar-btn"><span class = "glyphicon glyphicon-edit"></span></button>\n\
                            <button optionTitle = "Tramite" optionName = "tramite" class = "topographyButtonRemove btn btn-danger navbar-btn"><span class = "glyphicon glyphicon-remove"></span></button>\n\
                        </div>');        
        navTabBar.append(container);
        historicoDiv.append(navTabBar);
    };
    
     /**
     * @description Construye la estructura que muestra la organizacin de la topografia.
     * @param {object} rootStructure Raiz de la topofrafia.
     * @param {String} structureType Tipo de estructura que se esta creando.
     * @param {String} title Titulo de la raiz
     * @returns {Number}
     */
    var buildStructure = function(rootStructure, structureType, title){
        var tree = $(rootStructure).dynatree({
            minExpandLevel: 2,
            children:{
                title: title,
                structureType: structureType,
                key: 0,
                parentKey: 0,
                activate: true
            },
            onClick: function(node){
                console.log(node);
            }
        });
        
        return 1;
    };
    
    /**
     * @description Construye los arboles de cada estructura.
     * @param {type} topographyStructure
     * @returns {undefined}
     */
    var addSectionsChildren = function(topographyStructure){
        $(topographyStructure).find('section').each(function(){
            var structureType = $(this).find('structureType').text();
            var structureName = $(this).find('name').text();
            var keyDescription = $(this).find('description').text();
            var idTopography = $(this).find('idTopography').text();
            var idParent = $(this).find('idParent').text();
            var structureKey = $(this).find('structureKey').text();

            var idTree = "#"+String(structureType).toLowerCase()+"Tree";
            var structureTree = $(idTree).dynatree('getTree').getNodeByKey(idParent);
            if(structureTree !== null)
                structureTree.addChild({
                    title: structureName,
                    key: idTopography,
                    idParent: structureTree.data.key,
                    description: keyDescription,
                    structureKey: structureKey,
                    structureType: structureType
                });
            else
                console.log("No se obtuve el arbol de " + '#'+structureType+"Tree");
        });
    };
    /**
     * @description Retorna el xml con la estructura de la topografia.
     * @returns {unresolved}
     */
    var getTopographyStructure = function(){
        var structure = null;
        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "Modules/php/Topography.php",
            data: {option: "getTopographyStructure"},
            success: function (xml) {
                if ($.parseXML(xml) === null)
                    return errorMessage(xml);
                else
                    xml = $.parseXML(xml);

                if($(xml).find('topographyStructure').length > 0)
                    structure = xml;

                $(xml).find('Error').each(function ()
                {
                    var Mensaje = $(this).find('Mensaje').text();
                    errorMessage(Mensaje);
                });
            },
            beforeSend: function () {
            },
            error: function (objXMLHttpRequest) {
                errorMessage(objXMLHttpRequest);
            }
        });
        return structure;
    };
        
    var newStructureInterface = function(structureName, optionTitle){
        var content = $('<div>');
        var formGroup = $('<div>', {class: "form-group"});
        var nameStructureForm = $('<input>', {type: "text", class: "form-control"});
        var keyStructure = $('<input>', {type: "text", class: "form-control"});
        var descriptionStructure = $('<input>', {type: "text", class: "form-control"});
        
        formGroup.append('<label>Nombre</label>')
                .append(nameStructureForm);
        content.append(formGroup);
        
        formGroup = $('<div>', {class: "form-group"});
        formGroup.append('<label>Clave</label>')
                .append(keyStructure);
        content.append(formGroup);
        
        formGroup = $('<div>', {class: "form-group"});
        formGroup.append('<label>Descripcion</label>')
                .append(descriptionStructure);
        content.append(formGroup);
        
        BootstrapDialog.show({
            title: 'Agregando a seccion en ' + optionTitle,
            message: content,
            closable: true,
            closeByBackdrop: false,
            closeByKeyboard: true,
            size: BootstrapDialog.SIZE_SMALL,
            type: BootstrapDialog.TYPE_PRIMARY,
            buttons: [
                {
                    label: "Agregar",
                    cssClass: "btn-primary",
                    icon: "fa fa-plus-circle fa-lg",
                    hotkey: 13,
                    action: function(dialogRef){
                        var button = this;
                        button.spin();
                        dialogRef.enableButtons(false);
                        dialogRef.setClosable(false);
                        if(addNewSection(structureName, nameStructureForm, keyStructure, descriptionStructure))
                            dialogRef.close();
                        else{
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
                nameStructureForm.focus();
            }
        });
    };
    
    var addNewSection = function(structureName, nameStructureForm, structureKeyForm, descriptionStructure){
        var activeNode = $('#'+structureName+'Tree').dynatree('getActiveNode');
        if(activeNode === null)
            return ADvertencia("Debe seleccionar una seccion.");
        var status = 0;
        var nameStructure = String($.trim(nameStructureForm.val()));
        var description = String($.trim(descriptionStructure.val()));
        var structureKey = String($.trim(structureKeyForm.val()));
        if(nameStructure.length === 0)
            return Advertencia("Debe ingresar un nombre a la nueva seccion");
        if(structureKey.length === 0)
            return Advertencia("Debe ingresar una clave para la seccion  ");
        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "Modules/php/Topography.php",
            data: {option: "addNewSection", 
                name: nameStructure,
                structureKey: structureKey,
                description: description,
                structureType: activeNode.data.structureType,
                idParent: activeNode.data.key},
            success: function (xml) {
                if ($.parseXML(xml) === null)
                    return errorMessage(xml);
                else
                    xml = $.parseXML(xml);

                $(xml).find('newStructureAdded').each(function(){
                    var message = $(this).find('message').text();
                    var idChild = $(this).find('idStructure').text();
                    Notificacion(message);
                    status = 1;
                    addSectionNode(activeNode, {
                        title: nameStructure, 
                        description: description,
                        key: idChild,
                        idParent: activeNode.data.key,
                        structureKey: structureKey,
                        structureType: activeNode.data.structureType,
                        activate: true
                    });
                });

                $(xml).find('Error').each(function ()
                {
                    var Mensaje = $(this).find('Mensaje').text();
                    errorMessage(Mensaje);
                });
            },
            beforeSend: function () {
            },
            error: function (objXMLHttpRequest) {
                errorMessage(objXMLHttpRequest);
            }
        });
        return status;
    };
    
    var addSectionNode = function(activeNode, node){
        var childNode = activeNode.addChild(node);
        childNode.activate(true);
    };
    
    var editSection = function(structureName){
        var activeNode = $('#'+structureName+'Tree').dynatree('getActiveNode');
        if(activeNode === null)
            return Advertencia("Debe seleccionar una seccion.");
        if(parseInt(activeNode.data.key) === 0)
            return 0;
        var content = $('<div>');
        var formGroup = $('<div>', {class: "form-group"});
        var nameStructureForm = $('<input>', {type: "text", class: "form-control"});
        var keyStructure = $('<input>', {type: "text", class: "form-control"});
        var descriptionStructure = $('<input>', {type: "text", class: "form-control"});
        
        formGroup.append('<label>Nombre</label>')
                .append(nameStructureForm);
        content.append(formGroup);
        
        formGroup = $('<div>', {class: "form-group"});
        formGroup.append('<label>Clave</label>')
                .append(keyStructure);
        content.append(formGroup);
        
        formGroup = $('<div>', {class: "form-group"});
        formGroup.append('<label>Descripcion</label>')
                .append(descriptionStructure);
        content.append(formGroup);
        BootstrapDialog.show({
            title: ' ',
            message: content,
            closable: true,
            closeByBackdrop: false,
            closeByKeyboard: true,
            size: BootstrapDialog.SIZE_SMALL,
            type: BootstrapDialog.TYPE_WARNING,
            buttons: [
                {
                    label: "Modificar",
                    cssClass: "btn-warning",
                    icon: "fa fa-plus-pencil fa-lg",
                    hotkey: 13,
                    action: function(dialogRef){
                        var button = this;
                        button.spin();
                        dialogRef.enableButtons(false);
                        dialogRef.setClosable(false);
                        if(modifyStructure(activeNode,structureName, nameStructureForm, keyStructure, descriptionStructure))
                            dialogRef.close();
                        else{
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
                nameStructureForm.val(activeNode.data.title);
                keyStructure.val(activeNode.data.structureKey);
                descriptionStructure.val(activeNode.data.description);
            }
        });        
    };
    
    var modifyStructure = function (activeNode, structureName, nameStructureForm, keyStructureForm, descriptionStructure) {
        var status = 0;
        var name = $.trim(nameStructureForm.val());
        var structureKey = $.trim($(keyStructureForm).val());
        var description = $.trim(descriptionStructure.val());
        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "Modules/php/Topography.php",
            data: {option: "modifyStructure", 
                idStructure: activeNode.data.key,
                structureName: structureName,
                name: name,
                description: description,
                structureKey: structureKey
            },
            success: function (xml) {
                if ($.parseXML(xml) === null)
                    return errorMessage(xml);
                else
                    xml = $.parseXML(xml);

                $(xml).find('structureModified').each(function(){
                    var message = $(this).find('Mensaje').text();
                    Notificacion(message);
                    activeNode.data.title = name;
                    activeNode.data.description = description;
                    activeNode.data.structureKey = structureKey;
                    activeNode.render();
                    status = 1;
                });
                
                $(xml).find('Error').each(function ()
                {
                    var Mensaje = $(this).find('Mensaje').text();
                    errorMessage(Mensaje);
                });
            },
            beforeSend: function () {
            },
            error: function (objXMLHttpRequest) {
                errorMessage(objXMLHttpRequest);
            }
        });
        return status;
    };
    
    var deleteStructureInterface = function(structureName){
        var activeNode = $('#'+structureName+'Tree').dynatree('getActiveNode');
        if(activeNode === null)
            return Advertencia("Debe seleccionar una seccion.");
        if(parseInt(activeNode.data.key) === 0)
            return 0;
        var content = $('<div>').append('<p>¿Realmente desea continuar?');
        BootstrapDialog.show({
            title: 'Eliminar a ' + activeNode.data.title,
            message: content,
            closable: true,
            closeByBackdrop: false,
            closeByKeyboard: true,
            size: BootstrapDialog.SIZE_SMALL,
            type: BootstrapDialog.TYPE_DANGER,
            buttons: [
                {
                    label: "Eliminar",
                    cssClass: "btn-danger",
                    icon: "fa fa-trash-o fa-lg",
                    hotkey: 13,
                    action: function (dialogRef) {
                        var button = this;
                        button.spin();
                        dialogRef.enableButtons(false);
                        dialogRef.setClosable(false);
                        if (deleteStructure(activeNode))
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
    
    var deleteStructure = function(activeNode){
        var status = 0;
        var xml = "<delete version='1.0' encoding='UTF-8'>";        
        xml+= getChildrenNodesString(activeNode);
        xml+="</delete>";
        console.log(xml);
        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "Modules/php/Topography.php",
            data: {option: "deleteStructure", 
                xml: xml
            },
            success: function (xml) {
                if ($.parseXML(xml) === null)
                    return errorMessage(xml);
                else
                    xml = $.parseXML(xml);

                $(xml).find('structureRemoved').each(function(){
                    var message = $(this).find('Mensaje').text();
                    Notificacion(message);
                    activeNode.remove();
                    status = 1;
                });
                
                $(xml).find('Error').each(function (){
                    var Mensaje = $(this).find('Mensaje').text();
                    errorMessage(Mensaje);
                });
            },
            beforeSend: function () {
            },
            error: function (objXMLHttpRequest) {
                errorMessage(objXMLHttpRequest);
            }
        });
        return status;
    };
    
    var getChildrenNodesString = function(activeNode){
        var children = activeNode.getChildren();
        var string = "<node>" + activeNode.data.key + "</node>";
        if(children !== null)
            for(var cont = 0; cont < children.length; cont++){
                var node = children[cont];
                var subChildren = node.getChildren();
                string += "<node>" + node.data.key + "</node>";
                if(subChildren !== null)
                    children = children.concat(subChildren);
            }
        return string;
    };
};

