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
        var content = $('<div>');
        var root = $('<div>', {id: "topographyStructure"});
        content.append(root);
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
                    label: "Nuevo",
                    cssClass: "btn-primary",
                    icon: "fa fa-plus-circle fa-lg",
                    hotkey: 13,
                    action: function(dialogRef){
                        newStructureInterface();
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
                buildStructure(root);
            }
        });
    };
    
     /**
     * @description Construye la estructura que muestra la organizacin de la topografia.
     * @param {object} rootStructure Raiz de la topofrafia.
     * @returns {Number}
     */
    var buildStructure = function(rootStructure){
        $(rootStructure).dynatree({
            minExpandLevel: 2,
            children:{
                title: "Topografia",
                key: 0,
                parentKey: 0,
                activate: true
            },
            onClick: function(node){
                console.log(node);
            }
        });
        var topographyStructure = getTopographyStructure();
        console.log("topographyStructure::");
        console.log(topographyStructure);
        addSectionChildren(topographyStructure,rootStructure);
        
        return 1;
    };
    
    var addSectionChildren = function(topographyStructure, rootStructure){
        $(topographyStructure).find('section').each(function(){
            $(this).children().each(function(){
                console.log("Hijo de seccion ");
                console.log($(this));
            });
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
    
    var newStructureInterface = function(){
        var content = $('<div>');
        var formGroup = $('<div>', {class: "form-group"});
        var nameStructureForm = $('<input>', {type: "text", class: "form-control"});
        var descriptionStructure = $('<input>', {type: "text", class: "form-control"});
        
        formGroup.append('<label>Nombre</label>')
                .append(nameStructureForm);
        content.append(formGroup);
        
        formGroup = $('<div>', {class: "form-group"});
        formGroup.append('<label>Descripcion</label>')
                .append(descriptionStructure);
        content.append(formGroup);
        
        BootstrapDialog.show({
            title: 'Topografia',
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
                        if(addNewSection(nameStructureForm,descriptionStructure))
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
    
    var addNewSection = function(nameStructureForm, descriptionStructure){
        var activeNode = $('#topographyStructure').dynatree('getActiveNode');
        if(activeNode === null)
            return ADvertencia("Debe seleccionar una seccion.");
        var status = 1;
        var nameStructure = String($.trim(nameStructureForm.val()));
        var description = String($.trim(descriptionStructure.val()));
        if(nameStructure.length === 0)
            return Advertencia("Debe ingresar un nombre a la nueva seccion");
        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "Modules/php/Topography.php",
            data: {option: "addNewSection", 
                nameStructure: nameStructure, 
                descriptionStructure:description,
                idParent: activeNode.data.key},
            success: function (xml) {
                if ($.parseXML(xml) === null)
                    return errorMessage(xml);
                else
                    xml = $.parseXML(xml);

                $(xml).find('newStructureAdded').forEach(function(){
                    var message = $(this).find('message').text();
                    var idChild = $(this).find('idStructure').text();
                    Notificacion(message);
                    status = 1;
                    addSectionNode(activeNode, {
                        title: nameStructureForm.val(), 
                        description: descriptionStructure.val(),
                        key: idChild,
                        idParent: activeNode.data.key,
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

