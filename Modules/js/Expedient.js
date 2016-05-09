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
    var templateName = null;
    var idEnterprise = null;
    var enterpriseKey = null;
    var repositoryName = null;
    var idDocDisposition = 0;
    var catalogKey = null;
    var templateData = null;
    var templateAssociated = null;
    var frontPageName = null;
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

        if (String(activeNode.data.catalogType) === 'serie')
            _templateSelectionInterface(activeNode);
        else if(parseInt(activeNode.data.key) === 1)
            _openDocumentaryDispositionInterface();
    };

    /**
     * @description Interface para selección de plantilla en el expediente.
     * @param {Object} activeNode Nodo activo en el árbol de directorios
     * @returns {undefined}
     */
    var _templateSelectionInterface = function (activeNode) {
        var content = $('<div>');
        var idRepository = $('#CM_select_repositorios option:selected').attr('idRepository');
        var repositoryName = $('#CM_select_repositorios option:selected').attr('repositoryname');
        var enterpriseKey = $('#CM_select_empresas option:selected').attr('value');
        catalogKey = activeNode.data.catalogkey;
        idDocDisposition = activeNode.data.idDocDisposition;
//        console.log("catalogKey: "+catalogKey + " idDocDisposition: " + idDocDisposition);
        var templates = TemplateDesigner.getTemplates(enterpriseKey, idRepository, repositoryName);

        var formGroup = $('<div>', {class: "form-group"});
        var templateForm = $('<select>', {class: "form-control"});

        formGroup.append(
                $('<label>').append('Plantilla')
                )
                .append(templateForm);
        
        content.append(formGroup);
        
        formGroup = $('<div>', {class: "form-group"});
        var expedientNameForm = $('<input>', {class: "form-control", id: "frontPageName"});
        formGroup.append('<label>Nombre</label>')
                .append(expedientNameForm);
        
        content.append(formGroup);
        
        var title = _getTitleTypeOfExpedient();

        BootstrapDialog.show({
            title: '<i class="fa fa-folder-open fa-lg"></i> ' + title,
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
                    hotkey: 13,
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
                var expedientName = _getExpedientName();
                expedientNameForm.val(expedientName);
            }
        });
    };
    
    var _getTitleTypeOfExpedient = function(){
        var activeNode = $('#contentTree').dynatree('getTree').getActiveNode();
        if(activeNode === null)
             Advertencia("Debe seleccionar una serie");
        if(parseInt(activeNode.data.isExpedient) === 1)
            return "Nuevo Expediente";
        else
            return "Nueva Plantilla";
    };
    
    /**
     * @description Retorna el nombre del expediente que ser creado (Nombre del directorio)
     * @returns {String}
     */
    var _getExpedientName = function(){
        var d = new Date();
        var n = d.getFullYear(); 
        var activeNode = $('#contentTree').dynatree('getTree').getActiveNode();
        if(activeNode === null){
             Advertencia("Debe seleccionar una serie");
             return null;
         }
         
        return activeNode.data.title + n + "/1";
    };

    /**
     * @description Asocia una plantilla en un legajo.
     * @param {Object} templateForm Select Form que contiene la plantilla seleccionada por el usuario.
     * @returns {undefined}
     */
    var _associateTemplate = function (templateForm) {
        frontPageName = $.trim($('#frontPageName').val());
        var templateSelected = $(templateForm).find('option:selected')[0];
        if (typeof templateSelected !== 'object')
            return Advertencia("Debe seleccionar un template");

        var templateObject = _getTemplate($(templateSelected));
        idEnterprise = $(templateSelected).attr('idrepository');
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
                        if (frontPage.upload())
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
                idDocDisposition: idDocDisposition,
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
     * @param {type} templatedata
     * @param {type} templateassociated
     * @returns {undefined}
     */
    var _setDataToTemplate = function(templatedata, templateassociated){
        console.log("templateData");
        console.log(templatedata);
        var activeNode = $('#contentTree').dynatree('getTree').getActiveNode();
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
            console.log("setting data to template");
            console.log("fieldName: "+ fieldNameUser + " columnName: " + columnName + " fieldValue: " + fieldValue + " idForm: " + idForm + " tName: "+tName);
                            
            if($(idForm).length > 0){
                if(String(fieldNameUser).toLowerCase() === 'fondo')
                    $(idForm).val(_getCatalogType(activeNode, "fondo")).attr('tName', tName);
                else if(String(fieldNameUser).toLowerCase() === 'seccion')
                    $(idForm).val(_getCatalogType(activeNode, "section")).attr('tName', tName);
                else if(String(fieldNameUser).toLowerCase() === 'serie')
                    $(idForm).val(_getCatalogType(activeNode, "serie")).attr('tName', tName);
                else if(String(fieldNameUser).toLowerCase() === 'subserie')
                    $(idForm).val(_getSubCatalogType(activeNode, "serie")).attr('tName', tName);
                else
                    $(idForm).val(fieldValue).attr('tName', tName);
            }
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
    
    var _getBuildObjectDataTemplate = function(activeNode){
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
            if($(idForm).length > 0 ){
                xml+= "<field>";
                    xml+= "<fieldValue>" + $(idForm).val() + "</fieldValue>\n\
                            <columnName>" + columnName + "</columnName>\n\
                            <fieldName> " + fieldNameUser + "</fieldName>\n\
                            <tableName> " + tableName + "</tableName>\n\
                            <fieldType>" + fieldType + "</fieldType>\n\
                            <fieldLength>" + fieldlength + "</fieldLength>";
                xml += "</field>";
            }
            else
                console.log("No existe "+idForm);
        });
        
        xml += "</template>";
        
        return xml;
    };
    
    var _getKeyErased = function(node){
        return String(node.data.key).replace(node.data.parentCatalogKey + ".", "");
    };
    
    /**
     * @description Se obtiene el fondo a partir de la estructura de directorios.
     * @param {type} activeNode
     * @param {type} typeSearched
     * @returns {String|node@call;getParent.data.title|Window.data.title}
     */
    var _getCatalogType = function(activeNode, typeSearched){
        var parents = [activeNode];

        for(var cont = 0; cont < parents.length; cont++){
            var node = parents[cont];
            if(node !== null){
                var catalogType = String(node.data.catalogType).toLowerCase();
                var parent = node.getParent();
                if(catalogType === String(typeSearched).toLowerCase()){
                    if(parent !== null){
                        return parent.data.docDispositionName;
                    }
                    else
                        return node.data.docDispositionName;
                }
                else
                    if(node.getParent() !== null)
                        parents.push(node.getParent());
            }   
        }
        return "No existe";
    };
    
    var _getSubCatalogType = function(activeNode, typeSearched){
        var parents = [activeNode];

        for(var cont = 0; cont < parents.length; cont++){
            var node = parents[cont];
            if(node !== null){
                var catalogType = String(node.data.catalogType).toLowerCase();
                if(catalogType === String(typeSearched).toLowerCase()){
                    if(node.getParent() !== null){
                        if(String(node.getParent().data.catalogType).toLowerCase() === typeSearched)
                            return node.data.docDispositionName;
                    }
                }
                else
                    if(node.getParent() !== null)
                        parents.push(node.getParent());
            }   
        }
        return "";
    };
    /**
     * @description Interface que muestra el catálogo de disposición documental para la selección de 
     *  una serie
     * @returns {undefined}
     */
    var _openDocumentaryDispositionInterface = function () {
        var content = $('<div>');

        var catalogDispTree = $('<div>', {id: "catalogDispTree", style: "max-height: calc(100vh - 200px); overflow-y: auto;"});

        content.append(catalogDispTree);

        BootstrapDialog.show({
            title: '<i class="fa fa-folder-open fa-lg"></i> Nuevo Expediente',
            size: BootstrapDialog.SIZE_WIDE,
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
                    onKeydown: null,
                    onClick: function(node){
                        console.log(node);
                    }
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
//                        expand: true,
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
//        var path = getPath(activeNode);
//        var path = _getStructureDispositionCatalog(activeNode);
        var path = _getDocDispoKeyPath(activeNode);
//        console.log("Result Path:");
//        console.log(path);
        var status = createPathOfDispositionCatalog(path);
        return status;
    };
    
    var _getDocDispoKeyPath = function(activeNode){
        var path = String(activeNode.getKeyPath());
        var keyPath = [];
//        console.log(path);
        path = path.split("/");
        for(var cont = path.length - 1; cont >= 2; cont--){
            var node = $('#catalogDispTree').dynatree('getTree').getNodeByKey(path[cont]);
            var child = $('#catalogDispTree').dynatree('getTree').getNodeByKey(path[cont+1]);
//            console.log("Enviando child");
//            console.log(child);
            var newKey = _getNewCatalogNamePath(node, child);
            node.data.newKey = newKey;
//            console.log("clave Obtenida: " + newKey);
            keyPath.push(node);
            
            var parent = parent = node.getParent();
            if(parent !== null)
                parent = _getNewCatalogNamePath(parent, node);
            node.data.newParentCatalogKey = parent;
//            console.log("New Parent Key Path: " + parent);
        }
        console.log("Resultado Final");
        console.log(keyPath);
        
        return keyPath;
    };
    
    var _getNewCatalogNamePath = function(activeNode, child){
//        console.log("+++");
//        console.log("   ");
//        console.log("procesando: " + activeNode.data.key);
//        if(child !== null)
//            console.log("child: "+child.data.key);
        if(activeNode === null)
            return "";
        var path = [activeNode];
        var catalogPath = "";
        for(var cont = 0; cont < path.length; cont++){
//            console.log(path);
            var node = path[cont];
            var parent = node.getParent();

            if(cont > 0)
                child = path[cont-1];
//            else if(child === null)
//                console.log("No tiene hijo");
            
            if (node === null) 
                continue;
            if (!parseInt(node.data.idDocDisposition) > 0)
                continue;
            
            var keyErased = String(node.data.key).replace(node.data.parentCatalogKey + ".", "");
            
//            console.log("retirando: " + node.data.parentCatalogKey + ". a " + node.data.key);
//            console.log("keyErased: "+keyErased);
            
//            if(child !== null)
//                console.log("child: " + child.data.key);
            
            var catalogType         = node.data.catalogType;
            var catalogTypeParent   = null;
            var catalogTypeChild    = null;
            
            if(child !== null)
                catalogTypeChild = child.data.catalogType;
            if(parent !== null){
//                console.log("Agregando Parent");
                catalogTypeParent = parent.data.catalogType;
                path.push(parent);
            }
            
            if(parent === null){
//                console.log("Hijo nulo");
                catalogPath = keyErased + "/";
            }else if(String(catalogType) === String(catalogTypeParent)){
//                console.log("Padre de igual tipo pero hijo de igual tipo " +catalogType + " == " +catalogTypeParent);
                if(String(catalogType) === String(catalogTypeChild)){
//                    console.log("Hijo igual " + catalogType + "== " + catalogTypeChild);
                    catalogPath = keyErased + "." + catalogPath;
                }
                else{
//                    console.log("Hijo diferente " + catalogType + "!= " + catalogTypeChild);
                    catalogPath = keyErased + "/" + catalogPath;
                }
            }
            else{
//                console.log("Padre diferente  " + catalogType + " != " + catalogTypeParent);
                if(String(catalogType) === String(catalogTypeChild)){
//                    console.log("Hijo igual " + catalogType + "== " + catalogTypeChild);
                    catalogPath = keyErased + "." + catalogPath;
                }
                else{
//                    console.log("Hijo diferente " + catalogType + "!= " + catalogTypeChild);
                    catalogPath = keyErased + "/" + catalogPath;
                }
            }
            
            console.log("catalogPath: "+catalogPath);
        }
        return catalogPath;
    };

    var getPath = function (activeNode){
        var path = [activeNode];
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
     * @param {type} path
     * @returns {Number}
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
            var idDocDisposition = node.data.idDocDisposition;
            var newParentCatalogKey = node.data.newParentCatalogKey;
            var parentCatalogKey = node.data.parentCatalogKey;
            var title = node.data.title;
            var catalogType = node .data.catalogType;
            var newKey = node.data.newKey;
            var parentNode = _checkIfExistCatalogNode(newParentCatalogKey, catalogType);
            var node = _checkIfExistCatalogNode(newKey, catalogType);
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
                            <idDocDisposition>' + idDocDisposition + '</idDocDisposition>\n\
                            <newParentCatalogKey>' + newParentCatalogKey + '</newParentCatalogKey>\n\
                            <parentCatalogKey>' + parentCatalogKey + '</parentCatalogKey>\n\\n\
                            <catalogKey>' + newKey + '</catalogKey>\n\
                            <name>' + title + '</name>\n\
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
                        var idDocDisposition = $(this).find('idDocDisposition').text();
                        var docDispositionName = $(this).find('docDispositionName').text();

                        var child = {
                            title: title,
                            idParent: idParent,
                            key: id,
                            isFolder: true,
                            catalogkey: catalogKey,
                            parentCatalogKey: parentCatalogKey,
                            catalogType: type,
                            idDocDisposition: idDocDisposition,
                            docDispositionName: docDispositionName,
                            autoincrement: 0
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
     * @param {String} searchCatalogKey
     * @param {String} catalogType
     * @returns {ExpedientClass._checkIfExistCatalogNode.children|ExpedientClass._checkIfExistCatalogNode.child}
     */
    var _checkIfExistCatalogNode = function (searchCatalogKey, catalogType) {
//        console.log("Buscando a "+searchCatalogKey);
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
//            console.log("Analizando nodo y comparando " + catalogKey + " , " + searchCatalogKey);
//            console.log(child);
            if (String(catalogKey) === String(searchCatalogKey))
                return child;

            var subChildren = child.getChildren();
                       
            if (subChildren !== null)
                children = children.concat(subChildren);
        }

        return null;
    };
    var expedient = {
        addExpedientInterface: function(){
            
        }
    };
    var frontPage = {
        upload: function(){
            var activeNode = $('#contentTree').dynatree('getTree').getActiveNode();
            var idDirectory = frontPage.addFrontPageDirectory();
            var objectDataTemplate = _getBuildObjectDataTemplate(activeNode);
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
                    idEnterprise: idEnterprise,
                    enterpriseKey: enterpriseKey,
                    repositoryName: repositoryName,
                    idDirectory: idDirectory,
                    directoryKeyPath: activeNode.getKeyPath(),
                    catalogKey: activeNode.catalogKey,
                    templateName: templateName + ".xml",
                    objectDataTemplate: objectDataTemplate,
                    path: activeNode.data.path
                },
                success: function (xml) {
                    if ($.parseXML(xml) === null)
                        return errorMessage(error);
                    else
                        xml = $.parseXML(xml);

                    $(xml).find('templateAdded').each(function () {
                        var message = $(this).find('Mensaje').text();
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
        },       
            /**
        * @description Agrega el directorio del expediente.
        * @returns {undefined}
        */
        addFrontPageDirectory: function(){
           var activeNode = $('#contentTree').dynatree('getActiveNode');
           if (activeNode === null)
               return Advertencia("No fue posible obtener el nodo activo");
           var path = getPath(activeNode);
           var tree = new ContentArbol();
           var node = activeNode.addChild({
                               isFolder: true, 
                               title: frontPageName, 
                               path: path,
                               isLegajo: 0,
                               directoryKeyPath: activeNode.getKeyPath(),
                               idParent: activeNode.data.key,
                               catalogKey: activeNode.data.catalogkey,
                               parentCatalogKey: activeNode.data.catalogKey,
                               idDocDisposition: 0,
                               catalogType: null,
                               isExpedient: 0,
                               isFrontPage: 1,
                               autoincrement: 0
                           });
           node.data.unselectable = true;

           var idDirectory = tree.addNewDirectory(node);

           return idDirectory;
       }
    };
};
