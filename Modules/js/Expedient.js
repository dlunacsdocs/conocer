/* 
 * Copyright 2016 CSDocs.
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

/* global BootstrapDialog, TemplateDesigner */

var ExpedientClass = function () {
    var self = this;
    var templateName;
    var enterpriseKey;
    var repositoryName;
    var catalogKey;
    var templateData;
    var templateAssociated;
    /**
     * @description Inserta el link del menú expediente.
     * @returns {undefined}
     */
    this.buildLink = function () {
        $('.expedientModuleLink').append('\n\
            <ul class="dropdown-menu">\n\
                <li class = "newExpedient"><a href="#"><i class="fa fa-plus-circle fa-lg"></i> Nuevo </span> </a></li>\n\
            </ul>\n\
            ');

        $('.newExpedient').on('click', self.newExpedient);
    };

    this.newExpedient = function () {
        if ($('#contentTree').is(':empty'))
            return Advertencia("Debe seleccionar un directorio");

        var activeNode = $('#contentTree').dynatree('getTree').getActiveNode();

        if (typeof activeNode !== 'object')
            return Advertencia("Debe seleccionar un directorio");

        if (parseInt(activeNode.data.isExpedient) === 1)
            return Advertencia("Ya existe un expediente.");

        if (!(String(activeNode.data.catalogType) === 'serie' || activeNode.data.isLegajo === 1))
            _openDocumentaryDispositionInterface();
        else
            _templateSelectionInterface(activeNode);

    };

    /**
     * @description Interface para selección de plantilla en el expediente.
     * @param {Object} activeNode Nodo activo en el árbol de directorios
     * @returns {undefined}
     */
    var _templateSelectionInterface = function (activeNode) {
        var idRepository = $('#CM_select_repositorios option:selected').attr('idRepository');
        var repositoryName = $('#CM_select_repositorios option:selected').attr('repositoryname');
        var enterpriseKey = $('#CM_select_empresas option:selected').attr('value');
        catalogKey = activeNode.data.catalogkey;
        console.log("catalogKey: "+catalogKey);
        var templates = TemplateDesigner.getTemplates(enterpriseKey, idRepository, repositoryName);

        var formGroup = $('<div>', {class: "form-group"});
        var templateForm = $('<select>', {class: "form-control"});

        formGroup.append(
                $('<label>').append('Plantilla')
                )
                .append(templateForm);

        var content = $('<div>').append(formGroup);

        BootstrapDialog.show({
            title: '<i class="fa fa-folder-open fa-lg"></i> Nuevo Expediente',
            size: BootstrapDialog.SIZE_SMALL,
            type: BootstrapDialog.TYPE_PRIMARY,
            message: content,
            closable: true,
            closeByBackdrop: true,
            closeByKeyboard: true,
            buttons: [
                {
                    icon: 'fa fa-plus-circle fa-lg',
                    label: 'Agregar Expediente',
                    cssClass: "btn-primary",
                    action: function (dialogRef) {
                        var button = this;
                        dialogRef.enableButtons(false);
                        dialogRef.setClosable(false);
                        if (_associateTemplate(templateForm))
                            dialogRef.close();
                        else {
                            dialogRef.setClosable(true);
                            dialogRef.enableButtons(true);
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
            onshow: function (dialogRef) {
                $(templates).find('template').each(function () {
                    var idRepository = $(this).find('idRepository').text();
                    var repositoryName = $(this).find('repositoryName').text();
                    var enterpriseKey = $(this).find('enterpriseKey').text();

                    $(this).find('templateList').each(function () {
                        $(this).find('templateName').each(function () {
                            var templateName = $(this).text();
                            templateName = templateName.replace(/\.[^/.]+$/, "");

                            var option = $('<option>', {
                                "idRepository": idRepository,
                                "repositoryName": repositoryName,
                                "enterpriseKey": enterpriseKey,
                                "templateName": templateName
                            }).append(templateName);

                            templateForm.append(option);

                        });
                    });


                });
            },
            onshown: function (dialogRef) {

            }
        });
    };

    /**
     * @description Asocia una plantilla en un legajo.
     * @param {Object} templateForm Select Form que contiene la plantilla seleccionada por el usuario.
     * @returns {undefined}
     */
    var _associateTemplate = function (templateForm) {
        var templateSelected = $(templateForm).find('option:selected')[0];
        if (typeof templateSelected !== 'object')
            return Advertencia("Debe seleccionar un template");

        var templateObject = _getTemplate($(templateSelected));
        enterpriseKey = $(templateSelected).attr('enterprisekey');
        repositoryName = $(templateSelected).attr('repositoryName');
        templateName = $(templateSelected).attr('templatename');
        
        _openDisassociatedTemplate(templateObject);
        return 1;
    };

    var _getTemplate = function (templateSelected) {
        return TemplateDesigner.getTemplate($(templateSelected).attr('enterprisekey'), $(templateSelected).attr('repositoryName'), $(templateSelected).attr('templatename') + ".xml");
    };
    
    /**
     * @description Devuelve un objeto HTML construido a través del XML de la plantilla seleccionada.
     * @param {type} templateXml
     * @returns {Number|$|object}
     */
    var _buildObjectOfTemplate = function(templateXml){
        return TemplateDesigner.buildContentOfTemplate(templateXml, 0, 1);
    };

    var _openDisassociatedTemplate = function (templateXml) {
        
        var templateObject = _buildObjectOfTemplate(templateXml);        
        var content = $('<div>', {id: "templateContent"});
        content.append(templateObject);
        console.log("open dissasociated template");
        console.log(templateObject);
        BootstrapDialog.show({
            title: '<i class="fa fa-folder-open fa-lg"></i> Asociar Plantilla',
            size: BootstrapDialog.SIZE_WIDE,
            type: BootstrapDialog.TYPE_PRIMARY,
            message: content,
            closable: true,
            closeByBackdrop: false,
            closeByKeyboard: true,
            buttons: [
                {
                    icon: 'fa fa-plus-circle fa-lg',
                    label: 'Agregar',
                    cssClass: "btn-primary",
                    action: function (dialogRef) {
                        dialogRef.enableButtons(false);
                        dialogRef.setClosable(false);
                        if (_addTemplate())
                            dialogRef.close();
                        else {
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
                var templatedata = _getTemplateData(content, templateXml);
                var templateAssociated = _getTemplateAssociated();
                _setDataToTemplate(templatedata, templateAssociated);
            }
        });
    };
    
    var _getTemplateData = function(content, templateXml){
        var templateData = null;
        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "Modules/php/Expedient.php",
            data: {
                option: "getTemplateData",
                enterpriseKey: enterpriseKey,
                repositoryName: repositoryName,
                templateName: templateName,
                catalogKey: catalogKey
            },
            success: function (xml) {
                if ($.parseXML(xml) === null)
                    return errorMessage(error);
                else
                    xml = $.parseXML(xml);
                
                if($(xml).find('templateData').length > 0)
                    templateData = xml;
                
                $(xml).find("Warning").each(function (){
                    var mensaje = $(this).find("Mensaje").text();
                    Advertencia(mensaje);
                });
                
                $(xml).find("Error").each(function (){
                    var mensaje = $(this).find("Mensaje").text();
                    errorMessage(mensaje);
                });

            },
            error: function (jqXHR, textStatus, errorThrown) {
                errorMessage(textStatus + "<br>" + errorThrown);
            }
        });
        
        return templateData;
    };
    
    var _getTemplateAssociated = function(){
        var templateAssociated = null;
        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "Modules/php/Expedient.php",
            data: {
                option: "getTemplateAssociated",
                enterpriseKey: enterpriseKey,
                repositoryName: repositoryName,
                templateName: templateName
            },
            success: function (xml) {
                if ($.parseXML(xml) === null)
                    return errorMessage(error);
                else
                    xml = $.parseXML(xml);

                if($(xml).find('association').length > 0)
                    templateAssociated = xml;
                
                $(xml).find("Error").each(function ()
                {
                    var mensaje = $(this).find("Mensaje").text();
                    errorMessage(mensaje);
                });

            },
            error: function (jqXHR, textStatus, errorThrown) {
                errorMessage(textStatus + "<br>" + errorThrown);
            }
        });
        
        return templateAssociated;
    };
    
    /**
     * @description Ingresa la información a la plantilla.
     * @param {type} template
     * @param {type} templatedata
     * @param {type} templateassociated
     * @returns {undefined}
     */
    var _setDataToTemplate = function(templatedata, templateassociated){
        templateData = templatedata;
        templateAssociated = templateassociated;
        var fieldsAssociator = new FieldsAssociator();
        var systemFields = fieldsAssociator.getSystemFields();
        
        $(templateassociated).find('field').each(function(){
            var fieldName = $(this).find('system').find('fieldName').text();
            var columnName = $(this).find('system').find('columnName').text();
            var fieldNameUser = $(this).find('userField').find('fieldName').text();
            var idForm = '#templateForm_'+fieldNameUser;
            var fieldValue = $(templatedata).find(columnName).text();
            var tName = _getTableName(systemFields, columnName);
            console.log("fieldName: "+ fieldNameUser + " columnName: " + columnName + " fieldValue: " + fieldValue + "idForm: " + idForm + " tName: "+tName);
            if($(idForm).length > 0)
                $(idForm).val(fieldValue).attr('tName', tName);
            else
                console.log("No existe "+idForm);
        });
        
    };
    
    var _getTableName = function(systemFields, columnname){
        for (var i = 0; i < systemFields.length; i++) {
                    var obj = systemFields[i];
                    for (var key in obj) {
                        var tableName = key;
                        var fields = obj[key];
                        for(var cont = 0; cont < fields.length; cont++){
                            var fieldObject = fields[cont];
                            var fieldTag = fieldObject.fieldTag;
                            var columnName = fieldObject.columnName;
                            if(String(columnName).toLowerCase() === String(columnname).toLowerCase())
                                return tableName;
                        }
                        
                    }
                }
    };

    var _addTemplate = function () {
        var objectDataTemplate = _getBuildObjectDataTemplate();
        console.log("objectDataTemplate");
        console.log(objectDataTemplate);
        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "Modules/php/Expedient.php",
            data: {
                option: "addTemplate",
                enterpriseKey: enterpriseKey,
                repositoryName: repositoryName,
                templateName: templateName + ".xml",
                objectDataTemplate: objectDataTemplate
            },
            success: function (xml) {
                if ($.parseXML(xml) === null)
                    return errorMessage(error);
                else
                    xml = $.parseXML(xml);

                $(xml).find('templateAdded').each(function () {
                    var message = $(this).find('message').text();
                    Notificacion(message);
                });

                $(xml).find("Error").each(function ()
                {
                    var mensaje = $(this).find("Mensaje").text();
                    errorMessage(mensaje);
                });

            },
            error: function (jqXHR, textStatus, errorThrown) {
                errorMessage(textStatus + "<br>" + errorThrown);
            }
        });
    };
    
    var _getBuildObjectDataTemplate = function(){
        var xml = "<template version='1.0' encoding='UTF-8' templateName = '"+templateName+"' enterpriseKey = '" + enterpriseKey + "' repositoryName = '" + repositoryName + "'>";
        
        $(templateAssociated).find('field').each(function(){
            var fieldName = $(this).find('system').find('fieldName').text();
            var columnName = $(this).find('system').find('columnName').text();
            var fieldNameUser = $(this).find('userField').find('fieldName').text();
            var idForm = '#templateForm_'+fieldNameUser;
            var fieldValue = $(templateData).find(columnName).text();
            var tableName = $(idForm).attr('tName');
            var fieldType = $(idForm).attr('fieldtype');
            var fieldlength = $(idForm).attr('fieldlength');
            console.log("fieldName: "+ fieldNameUser + " columnName: " + columnName + " fieldValue: " + fieldValue + "idForm: " + idForm);
            xml+= "<field>";
            if($(idForm).length > 0 )
                xml += "<fieldValue>" + $(idForm).val() + "</fieldValue>\n\
                        <columnName>" + columnName + "</columnName>\n\
                        <fieldName> " + fieldNameUser + "</fieldName>\n\
                        <tableName> " + tableName + "</tableName>\n\
                        <fieldType>" + fieldType + "</fieldType>\n\
                        <fieldLength>" + fieldlength + "</fieldLength>";
            else
                console.log("No existe "+idForm);
            
            xml += "</field>";
        });
        
        xml += "</template>";
        
        return xml;
    };
    
    /**
     * @description Agrega el directorio del expediente.
     * @returns {undefined}
     */
    var _addTemplateDirectory = function(){
        
    };

    /**
     * @description Interface que muestra el catálogo de disposición documental para la selección de 
     *  una serie
     * @returns {undefined}
     */
    var _openDocumentaryDispositionInterface = function () {
        var content = $('<div>');

        var catalogDispTree = $('<div>', {id: "catalogDispTree"});

        content.append(catalogDispTree);

        BootstrapDialog.show({
            title: '<i class="fa fa-folder-open fa-lg"></i> Nuevo Expediente',
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
                        var activeNode = $('#catalogDispTree').dynatree('getTree').getActiveNode();

                        if (activeNode === null)
                            return Advertencia("Debe seleccionar una serie");

                        if (String(activeNode.data.catalogType).toLowerCase() !== 'serie')
                            return Advertencia("Debe seleccionar una serie");

                        var button = this;
                        button.spin();
                        dialogRef.enableButtons(false);
                        dialogRef.setClosable(false);

                        if (addNewExpedient(activeNode))
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
                $('#catalogDispTree').dynatree({
                    children: [{
                            title: "Catálogo de Disposición Documental",
                            id: 0,
                            idParent: 0,
                            isFolder: true,
                            idCatalog: 0,
                            activate: true,
                            nameKey: 0,
                            key: 0
                        }],
                    onKeydown: null
                });

                var catalogDisposition = new DocumentaryDispositionClass();
                var catalogDisposition = catalogDisposition.getDocDispositionCatalogStructure();

//                console.log(catalogDisposition);

                $(catalogDisposition).find('node').each(function () {
                    var idDocDisp = $(this).find('idDocumentaryDisposition').text();
                    var name = $(this).find('Name').text();
                    var nameKey = $(this).find('NameKey').text();
                    var description = $(this).find('Description').text();
                    var parentKey = $(this).find('ParentKey').text();
                    var type = $(this).find('NodeType').text();
                    var icon;

                    if (type === 'fondo')
                        icon = "/img/archival/fondo.png";

                    if (type === 'section')
                        icon = "/img/archival/seccion.png";

                    if (type === 'serie')
                        icon = "/img/archival/serie.png";

                    var child = {
                        idDocDisposition: idDocDisp,
                        title: name,
                        key: nameKey,
                        nameKey: nameKey,
                        tooltip: name,
                        description: description,
                        catalogType: type,
                        isFolder: true,
                        expand: true,
                        parentCatalogKey: parentKey,
                        icon: icon
                    };

                    var parent = $('#catalogDispTree').dynatree('getTree').getNodeByKey(parentKey);

                    if (parent !== null) {
                        var newChild = parent.addChild(child);
                        newChild.activate(true);
                    }
                });
            }
        });
    };

    var addNewExpedient = function (activeNode) {
        var path = getPath(activeNode);

        var status = createPathOfDispositionCatalog(path);



        return status;
    };

    var getPath = function (activeNode) {
        var path = [];

        path.push(activeNode);

        var parent = activeNode.getParent();

        for (var cont = 0; cont < path.length; cont++) {
            var parent = path[cont].getParent();
            if (parent !== null) {
                if (parseInt(parent.data.idDocDisposition) > 0)
                    path.push(parent);
            }
        }

        return path;

    };

    /**
     * @description Crea el path de la serie del catálogo de disposición documental
     * Comprueba si el path ya existe sino lo crea.
     * @param {Array} Array con los nodos que conforman el path del catálogo de disposición documental
     * @returns {Boolean}
     */
    var createPathOfDispositionCatalog = function (path) {
        var xml = "<path version='1.0' encoding='UTF-8'>";

        var repositoryName = $('#CM_select_repositorios option:selected').attr('repositoryname');

        if (repositoryName === undefined)
            return Advertencia("No fue posible obtener el nombre del repositorio.");

        var status = 0;

        for (var cont = path.length; cont >= 0; cont--) {
            if (cont - 1 < 0)
                continue;
            var index = cont - 1;
            var node = path[index];
            var catalogKey = node.data.key;
            var parentCatalogKey = node.data.parentCatalogKey;
            var parentNode = _checkIfExistCatalogNode(parentCatalogKey);
            var node = _checkIfExistCatalogNode(catalogKey);
            var catalogNode = $('#catalogDispTree').dynatree('getTree').getNodeByKey(catalogKey);
            var nodePath;

            if (node === null) {
                var idParent = 0;
                if (parentNode !== null) {
                    idParent = parentNode.data.key;
                    nodePath = parentNode.getKeyPath();
                } else
                    nodePath = "1";

                xml += '<node>\n\
                            <parentCatalogKey>' + catalogNode.data.parentCatalogKey + '</parentCatalogKey>\n\\n\
                            <catalogKey>' + catalogNode.data.nameKey + '</catalogKey>\n\
                            <name>' + catalogNode.data.title + '</name>\n\
                            <idParent>' + idParent + '</idParent>\n\
                            <catalogType>' + catalogNode.data.catalogType + '</catalogType>\n\
                            <path>' + nodePath + '</path>\n\
                        </node>';
            }
        }

        xml += "</path>";

        if ($($.parseXML(xml)).find('node').length === 0)
            return Advertencia("Ya se ha creado el expediente para la serie seleccionada.");

        console.log(xml);

        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "Modules/php/Expedient.php",
            data: {option: "createPathOfDispositionCatalog", xml: xml, repositoryName: repositoryName},
            success: function (xml) {
                if ($.parseXML(xml) === null)
                    return errorMessage(error);
                else
                    xml = $.parseXML(xml);

                $(xml).find('expedientAdded').each(function () {
                    var message = $(this).find('message').text();
                    Notificacion(message);

                    $($(xml)).find('directory').each(function () {
                        var title = $(this).find('title').text();
                        var idParent = $(this).find('idParent').text();
                        var catalogKey = $(this).find('title').text();
                        var id = $(this).find('idDirectory').text();
                        var type = $(this).find('catalogType').text();

                        var child = {
                            title: title,
                            idParent: idParent,
                            key: id,
                            isFolder: true,
                            catalogkey: catalogKey,
                            parentCatalogKey: parentCatalogKey,
                            catalogType: type
                        };

                        var parent = $('#contentTree').dynatree('getTree').getNodeByKey(idParent);

                        if (parent !== null) {
                            var childNode = parent.addChild(child);
                            childNode.activate(true);
                        }
                    });
                    status = 1;
                });

                $(xml).find("Error").each(function ()
                {
                    var mensaje = $(this).find("Mensaje").text();
                    errorMessage(mensaje);
                });

            },
            error: function (jqXHR, textStatus, errorThrown) {
                errorMessage(textStatus + "<br>" + errorThrown);
            }
        });

        return status;
    };

    /**
     * @description Recorre la estructura de directorios en busca de una clave de un catálogo en específico
     * @param {type} catalogKey
     * @returns {undefined}
     */
    var _checkIfExistCatalogNode = function (searchCatalogKey) {
        var node = $('#contentTree').dynatree('getRoot');

        if (node === null)
            return null;

        var children = node.getChildren();

        for (var cont = 0; cont < children.length; cont++) {
            var child = children[cont];

            if (child === null)
                continue;

            var catalogKey = child.data.catalogkey;

            if (catalogKey === undefined || catalogKey === null && parseInt(child.data.key) !== 1)
                continue;

            console.log("Analizando nodo");
            console.log(child);

            if (String(catalogKey) === String(searchCatalogKey))
                return child;

            var subChildren = child.getChildren();

            if (subChildren !== null)
                children = children.concat(subChildren);
        }

        return null;
    };
};
