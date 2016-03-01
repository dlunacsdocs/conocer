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

/* global BootstrapDialog */

var ExpedientClass = function () {
    var self = this;

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
        
        if(repositoryName === undefined)
            return Advertencia("No fue posible obtener el nombre del repositorio.");
        
        var status = 0;

        for (var cont = path.length; cont >= 0; cont--) {
            if(cont -1 < 0)
                continue;
            var index = cont -1;
            var node = path[index];
            var catalogKey = node.data.key;
            var parentCatalogKey = node.data.parentCatalogKey;
            var parentNode = _checkIfExistCatalogNode(parentCatalogKey);
            var node = _checkIfExistCatalogNode(catalogKey);
            var catalogNode = $('#catalogDispTree').dynatree('getTree').getNodeByKey(catalogKey);
            var nodePath;
                        
            if (node === null){
                var idParent = 0;
                if(parentNode !== null){
                    idParent = parentNode.data.key;
                    nodePath = parentNode.getKeyPath();
                }
                else 
                    nodePath = "1";

                xml += '<node>\n\
                            <parentCatalogKey>'+catalogNode.data.parentCatalogKey+'</parentCatalogKey>\n\\n\
                            <catalogKey>'+catalogNode.data.nameKey+'</catalogKey>\n\
                            <name>'+catalogNode.data.title+'</name>\n\
                            <idParent>' + idParent + '</idParent>\n\
                            <catalogType>'+ catalogNode.data.catalogType +'</catalogType>\n\
                            <path>' + nodePath + '</path>\n\
                        </node>';
            }
        }
        
        xml += "</path>";
        
        if($($.parseXML(xml)).find('node').length === 0)
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
                
                $(xml).find('expedientAdded').each(function(){
                    var message = $(this).find('message').text();
                    Notificacion(message);
                    
                    $($(xml)).find('directory').each(function(){
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

                        if(parent !== null){
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
            error: function(jqXHR, textStatus, errorThrown){errorMessage(textStatus +"<br>"+ errorThrown);}
        });

        return status;
    };
    
    /**
     * @description Recorre la estructura de directorios en busca de una clave de un catálogo en específico
     * @param {type} catalogKey
     * @returns {undefined}
     */
    var _checkIfExistCatalogNode = function(searchCatalogKey){
        var node = $('#contentTree').dynatree('getRoot');
        
        if(node === null)
            return null;
        
        var children = node.getChildren();
        
        for(var cont = 0; cont < children.length; cont++){
            var child = children[cont];
            
            if(child === null)
                continue;
                        
            var catalogKey = child.data.catalogkey;
            
            if(catalogKey === undefined || catalogKey === null && parseInt(child.data.key) !== 1)
                continue;
            
            console.log("Analizando nodo");
            console.log(child);
            
            if(String(catalogKey) === String(searchCatalogKey))
                return child;
            
            var subChildren = child.getChildren();
            
            if(subChildren !== null)
                children = children.concat(subChildren);
        }
        
        return null;
    };
};
