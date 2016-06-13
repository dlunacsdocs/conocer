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
/* global BootstrapDialog */

var Topography = function(){
    this.setActionToLink = function(){
        $('.LinkTopography').click(openInterface);
    };
    
    var openInterface = function(){
                
        var tabbable = $('<div>',{id:"documentaryDispositionNavTab"});
        
        var navTab = $('<ul>', {class:"nav nav-tabs"});
        
        var tramiteLi = $('<li>', {class:"active"}).append('<a href="#fondoTree" data-toggle="tab"> Tramite</a>');
        var concentracionLi = $('<li>').append('<a href="#sectionTree" data-toggle="tab"> Concentracion</a>');
        var historicoLi = $('<li>').append('<a href="#serieTree" data-toggle="tab"> Historico</a>');
        
        var tramiteDiv = $('<div>',{id:"fondoTree", class:"tab-pane active", style: "max-height: calc(100vh - 200px); overflow: auto;"});
        var concentracionDiv = $('<div>',{id: "sectionTree", class:"tab-pane", style: "max-height: calc(100vh - 200px); overflow: auto;"});
        var historicoDiv = $('<div>',{id: "serieTree", class:"tab-pane", style: "max-height: calc(100vh - 100px); overflow: auto;"});
        
        var tabContent = $('<div>', {class:"tab-content"});
        
        var navTabBar = $('<nav>',{class:"navbar navbar-default"});
        var container = $('<div>',{ class: "container-fluid"});
        var navHeader = $('<div>', {class: "navbar-header"}).append('<a class="navbar-brand" href="#"><img alt="Brand" src = "/img/archival/diagram.png"></a>');
        
        container.append(navHeader);
        container.append('<div class = "btn-group-sm" role="group">\n\
                            <button optionTitle = "Tramite" optionName = "tramite" class = "topographyButtonAdd btn btn-primary navbar-btn"><li class = "fa fa-plus fa-lg"></li></button>\n\
                            <button class = "btn btn-warning navbar-btn"><span class = "glyphicon glyphicon-edit"></span></button>\n\
                            <button class = "btn btn-danger navbar-btn"><span class = "glyphicon glyphicon-remove"></span></button>\n\
                        </div>');        
        navTabBar.append(container);
        tramiteDiv.append(navTabBar);
        
        navTabBar = $('<nav>',{class:"navbar navbar-default"});
        container = $('<div>',{ class: "container-fluid"});
        navHeader = $('<div>', {class: "navbar-header"}).append('<a class="navbar-brand" href="#"><img alt="Brand" src = "/img/archival/diagram.png"></a>');
        container.append(navHeader);
        container.append('<div class = "btn-group-sm" role="group">\n\
                            <button optionTitle = "Concentracion" optionName = "concentracion" class = "topographyButtonAdd btn btn-primary navbar-btn"><li class = "fa fa-plus fa-lg"></li></button>\n\
                            <button class = "btn btn-warning navbar-btn"><span class = "glyphicon glyphicon-edit"></span></button>\n\
                            <button class = "btn btn-danger navbar-btn"><span class = "glyphicon glyphicon-remove"></span></button>\n\
                        </div>');              
        navTabBar.append(container);
        concentracionDiv.append(navTabBar);
        
        navTabBar = $('<nav>',{class:"navbar navbar-default"});
        container = $('<div>',{ class: "container-fluid"});
        navHeader = $('<div>', {class: "navbar-header"}).append('<a class="navbar-brand" href="#"><img alt="Brand" src = "/img/archival/diagram.png"></a>');
        container.append(navHeader);
        container.append('<div class = "btn-group-sm" role="group">\n\
                            <button optionTitle = "Historico" optionName = "historico" class = "topographyButtonAdd btn btn-primary navbar-btn"><li class = "fa fa-plus fa-lg"></li></button>\n\
                            <button class = "btn btn-warning navbar-btn"><span class = "glyphicon glyphicon-edit"></span></button>\n\
                            <button class = "btn btn-danger navbar-btn"><span class = "glyphicon glyphicon-remove"></span></button>\n\
                        </div>');        
        navTabBar.append(container);
        historicoDiv.append(navTabBar);
        
        tabContent.append(tramiteDiv);
        tabContent.append(concentracionDiv);
        tabContent.append(historicoDiv);
        
        navTab.append(tramiteLi);
        navTab.append(concentracionLi);
        navTab.append(historicoLi);
        
        tabbable.append(navTab);
        tabbable.append(tabContent);
        
        var content = $('<div>');
        var tramiteTree = $('<div>', {id: "tramiteTree"});
        var concentracionTree = $('<div>', {id: "concentracionTree"});
        var historicoTree = $('<div>', {id: "historicoTree"});
        tramiteDiv.append(tramiteTree);
        concentracionDiv.append(concentracionTree);
        content.append(tabbable);
        historicoDiv.append(historicoTree);
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
            }
        });
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
            var keyStructure = $(this).find('keyStructure').text();
            console.log({
                    title: structureName,
                    key: idTopography,
                    keyDescription: keyDescription,
                    keyStructure: keyStructure
                });
            var idTree = "#"+String(structureType).toLowerCase()+"Tree";
            console.log(idTree);
            console.log($(idTree).dynatree('getTree'));
            var structureTree = $(idTree).dynatree('getTree').getNodeByKey(idParent);
            console.log(structureTree);
            if(structureTree !== null)
                structureTree.addChild({
                    title: structureName,
                    key: idTopography,
                    idParent: structureTree.data.key,
                    keyDescription: keyDescription,
                    keyStructure: keyStructure
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
                
            }
        });
    };
    
    var addNewSection = function(structureName, nameStructureForm, keyStructureForm, descriptionStructure){
        var activeNode = $('#'+structureName+'Tree').dynatree('getActiveNode');
        if(activeNode === null)
            return ADvertencia("Debe seleccionar una seccion.");
        var status = 1;
        var nameStructure = String($.trim(nameStructureForm.val()));
        var description = String($.trim(descriptionStructure.val()));
        var keyStructure = String($.trim(keyStructureForm.val()));
        if(nameStructure.length === 0)
            return Advertencia("Debe ingresar un nombre a la nueva seccion");
        if(keyStructure.length === 0)
            return Advertencia("Debe ingresar una clave para la seccion  ");
        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "Modules/php/Topography.php",
            data: {option: "addNewSection", 
                structureName: structureName,
                nameStructure: nameStructure,
                keyStructure: keyStructure,
                descriptionStructure:description,
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
                        title: nameStructureForm.val(), 
                        description: descriptionStructure.val(),
                        key: idChild,
                        idParent: activeNode.data.key,
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
        activeNode.addChild(node);
    };
};

