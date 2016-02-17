/* global BootstrapDialog, BotonesWindow, userPermissions 
 * 
 * @description Catálogo de disposición documental. Menú Archivística
 * */
var DocumentaryDispositionClass = function(){
    var self = this;
    var docDispoCatalogDialog = undefined;
    
    this.setActionToLinkDocumentaryDispositionMenu = function(){
    
        $('.LinkDocumentaryDisposition').click(function(){
            if(userPermissions['c5866e93cab1776890fe343c9e7063fb'] !== undefined)
                _buildDocumentaryDispositionConsole();
            else
                Advertencia("No dispone de permisos para abrir la interfaz del Catálogo de Disposición Documental ");
        });    
    };
    
    /*
     * @description Devuelve el panel para agregar un elemento al 
     *              Catálogo de Disposición Documental 
     * @returns {DocumentaryDispositionClass._getArchivalDispositionFormsPanel.div|jQuery@pro;jQuery|jQuery|$|_$|window.OpenLayers.Util.getElement|OpenLayers.Util.getElement|String}
     */
    _getArchivalDispositionFormsPanel = function(){
        var div = $('<div>');
        
        var formGroupName = $('<div>',{class:"form-group"});  
        var catalogNameForm = $('<input>',{type:"text", class:"form-control", id:"catalogNameDocDispo"});
        var catalogNameLabel = $('<label>').append("Nombre");
        
        formGroupName.append(catalogNameLabel);
        formGroupName.append(catalogNameForm);
        
        div.append(formGroupName);
        
        var formGroupKey = $('<div>',{class:"form-group"});
        var catalogKeyForm = $('<input>',{type:"text", class:"form-control", id:"catalogKeyDocDispo"});
        var catalogKeyLabel = $('<label>').append("Clave");
        
        formGroupKey.append(catalogKeyLabel);
        formGroupKey.append(catalogKeyForm);
        
        div.append(formGroupKey);
        
        var formGroupDescrip = $('<div>',{class:"form-group"});
        var catalogDescriptionForm = $('<input>',{type:"text", class:"form-control", id:"catalogDescripDocDispo"});
        var catalogDescriptionLabel = $('<label>').append("Decripción");
        
        formGroupDescrip.append(catalogDescriptionLabel);
        formGroupDescrip.append(catalogDescriptionForm);
        
        div.append(formGroupDescrip);
        
        return div;
    };
    
    /**
     * @description Muestra un panel con los formularios necesarios para agregar un nuevo elemento a la estructura seleccionada.
     * @returns {Number}
     */
    _showCatalogOption = function(){
        var optionName = $('#documentaryDispositionButton').attr('optionName');
        
        if(_validateActiveTree(optionName) === false)
            return 0;
        
        var panelContent = _getArchivalDispositionFormsPanel();
        
        BootstrapDialog.show({
            title: 'Agregando '+optionName,
            size: BootstrapDialog.SIZE_SMALL,
            message: panelContent,
            buttons: [
                {
                    label: 'Cerrar',
                    action: function(dialogRef){
                        dialogRef.close();
                    }
                },
                {
                    label: 'Agregar',
                    cssClass:"btn-primary",
                    action: function(dialogRef){                    
                        window["_add"+optionName](dialogRef);    /* Agregando elemento al Catálogo */
                    }
                }
            ],
            onshown: function(dialogRef){
                $('#catalogNameDocDispo').focus();
            }
        });
    };
    
    /*
     * @description Valida que al intentar agregar un nivel al árbol de catálogo
     *              se tengan activos los nodos correctos.
     * @returns {undefined}
     */
    _validateActiveTree = function(optionName){
        var status = true;
        
        switch(optionName){
            case 'Fondo': 
                var activeNodeFondo = $('#fondoTree').dynatree("getRoot");
                    
            break;
            
            case 'Seccion':
        
                var activeNodeFondo = $('#fondoTree').dynatree("getActiveNode");
                if(activeNodeFondo === null){
                    Advertencia("Debe ingresar un Fondo");
                    status = false;
                }
                
            break;
                
            case 'Serie':
                
                var serieTreeChildren = $('#serieTree').dynatree("getRoot");
                
                if(serieTreeChildren === null){
                    Advertencia("No se ha construido la estructura <b>Sección</b>");
                    status = false;
                    break;
                }
                var serieTreeChildren = serieTreeChildren.getChildren();
                
                if(serieTreeChildren === null){
                    Advertencia("Debe ingresar al menos una <b>Sección</b>");
                    status = false;
                    break;
                }
                
                var activeNodeSerie = $('#serieTree').dynatree("getActiveNode");
    
                if(activeNodeSerie === null){
                    Advertencia("Debe seleccionar una <b>Serie</b>");
                    status = false;
                }
            break;
        }
        
        return status;
    };
    
    /**
     * @description Retorna un objeto con los datos ingresados para agregar un nuevo elemento de Fondo, Sección o Serie.
     * @returns {DocumentaryDispositionClass._getDocumentaryDispositionData.data}
     */
    _getDocumentaryDispositionData = function(){
        var data = {};
        
        var catalogName = $('#catalogNameDocDispo').val();
        var catalogKey = $('#catalogKeyDocDispo').val();
        var catalogDescript = $('#catalogDescripDocDispo').val();
        
        data.catalogName = catalogName;
        data.catalogKey = catalogKey;
        data.catalogDescript = catalogDescript;
        
        return data;
    };
    
    /**
     * @description Construye la interfaz que muestra el Catálogo de Disposición Documental.
     * @returns {undefined}
     */
    _buildDocumentaryDispositionConsole = function(){
        
        var tabbable = $('<div>',{id:"documentaryDispositionNavTab"});
        
        var navTab = $('<ul>', {class:"nav nav-tabs"});
        
        var fondoLi = $('<li>', {class:"active"}).append('<a href="#fondoTree" optionName = "Fondo" data-toggle="tab"><span class = "archivalFondoIcon"></span> Fondo</a>');
        var sectionLi = $('<li>').append('<a href="#sectionTree" optionName = "Seccion" data-toggle="tab"><span class = "archivalSectionIcon"></span> Sección</a>');
        var serieLi = $('<li>').append('<a href="#serieTree" optionName = "Serie" data-toggle="tab"><span class = "archivalSerieIcon"></span> Serie</a>');
        
        var fondoDiv = $('<div>',{id:"fondoTree", class:"tab-pane active"});
        var sectionDiv = $('<div>',{id: "sectionTree", class:"tab-pane"});
        var serieDiv = $('<div>',{id: "serieTree", class:"tab-pane"});
        
        var tabContent = $('<div>', {class:"tab-content"});
        
        var navTabBar = $('<nav>',{class:"navbar navbar-default"});
        var container = $('<div>',{ class: "container-fluid"});
        var navHeader = $('<div>', {class: "navbar-header"}).append('<a class="navbar-brand" href="#"><img alt="Brand" src = "/img/archival/diagram.png"></a>');
                    
        container.append(navHeader);
        container.append('<div class = "btn-group-sm" role="group"><button class = "btn btn-warning navbar-btn docDispositionEdit"><span class = "glyphicon glyphicon-edit"></span></button>\n\
                            <button class = "btn btn-danger navbar-btn docDispositionRemove"><span class = "glyphicon glyphicon-remove"></span></button></div>');        
        navTabBar.append(container);
        fondoDiv.append(navTabBar);
        
        navTabBar = $('<nav>',{class:"navbar navbar-default"});
        container = $('<div>',{ class: "container-fluid"});
        navHeader = $('<div>', {class: "navbar-header"}).append('<a class="navbar-brand" href="#"><img alt="Brand" src = "/img/archival/diagram.png"></a>');
        container.append(navHeader);
        container.append('<div class = "btn-group-sm" role="group"><button class = "btn btn-warning navbar-btn docDispositionEdit"><span class = "glyphicon glyphicon-edit"></span></button>\n\
                            <button class = "btn btn-danger navbar-btn docDispositionRemove"><span class = "glyphicon glyphicon-remove"></span></button></div>');              
        navTabBar.append(container);
        
        sectionDiv.append(navTabBar);
        
        navTabBar = $('<nav>',{class:"navbar navbar-default"});
        container = $('<div>',{ class: "container-fluid"});
        navHeader = $('<div>', {class: "navbar-header"}).append('<a class="navbar-brand" href="#"><img alt="Brand" src = "/img/archival/diagram.png"></a>');
        container.append(navHeader);
        container.append('<div class = "btn-group-sm" role="group"><button class = "btn btn-warning navbar-btn docDispositionEdit"><span class = "glyphicon glyphicon-edit"></span></button>\n\
                            <button class = "btn btn-danger navbar-btn docDispositionRemove"><span class = "glyphicon glyphicon-remove"></span></button></div>');        
        navTabBar.append(container);
        
        serieDiv.append(navTabBar);
        
        tabContent.append(fondoDiv);
        tabContent.append(sectionDiv);
        tabContent.append(serieDiv);
        
        navTab.append(fondoLi);
        navTab.append(sectionLi);
        navTab.append(serieLi);
        
        tabbable.append(navTab);
        tabbable.append(tabContent);
        
        var dialog = BootstrapDialog.show({
            title: 'Catálogo de Disposición Documental',
            size: BootstrapDialog.SIZE_NORMAL,
            closable: false,
            message: tabbable,
            draggable: true,
            buttons: [
                {
                    icon: 'glyphicon glyphicon-plus',
                    id: 'documentaryDispositionButton',
                    label: 'Agregar',
                    action: function(dialogRef){

                    }
                },
                {
                    id: 'docDispositionBuildButton',
                    label: 'Guardar',
                    action: function(dialogRef){
                        _buildDocumentaryDispositionCatalog(dialogRef);                         
                    }
                },
                {
                    icon: 'glyphicon glyphicon-ban-circle',
                    label: "Cerrar",
                    id: 'docDispCloseButton',
                    action: function(dialogRef){
                        BootstrapDialog.show({
                            title: 'Mensaje de Confirmación',
                            size: BootstrapDialog.SIZE_SMALL,
                            type: BootstrapDialog.TYPE_WARNING,
                            closable: true,
                            message: "¿Desea continuar cerrando esta ventana?",
                            draggable: false,
                            buttons: [             
                                {
                                    label:"Cancelar",
                                    action: function(dialogConfirm){
                                        dialogConfirm.close();
                                    }
                                },
                                {
                                    label: "Cerrar",
                                    action: function(dialogConfirm){
                                        dialogConfirm.close();
                                        dialogRef.close();
                                    }
                                }
                            ],
                            onshown: function(dialogConfirm){

                            }
                        });
                        
                    }
                }
            ],
            onshown: function(dialogRef){
                
                                /* ______Fondo______ */
                
                $('#fondoTree').dynatree({
                    minExpandLevel: 2,
                    onActivate: function(node) {
//                        console.log(node);
                    },
                    keyboard: true
                });
                
                var rootNode = $("#fondoTree").dynatree("getRoot");
                rootNode.data.key = 0;
                
                $('#fondoTree').dynatree("getTree").activateKey("fondoTree_0");
            
                                /* ______Sección______ */
                
                $('#sectionTree').dynatree({
                    minExpandLevel: 2,
                    onActivate: function(node) {
//                        console.log(node);
                    },
                    keyboard: true
                });
                
                rootNode = $("#sectionTree").dynatree("getRoot");
                rootNode.data.key = 0;
                
                 $('#sectionTree').dynatree("getTree").activateKey("sectionTree_0");                
                
                                /* ______Serie______ */
                
                $('#serieTree').dynatree({
                    minExpandLevel: 2,
                    onActivate: function(node) {
//                        console.log(node);
                    },
                    keyboard: true
                });
                
                rootNode = $("#serieTree").dynatree("getRoot");
                rootNode.data.key = 0;
            
                $('#serieTree').dynatree("getTree").activateKey("serieTree_0");

                                /*___________________*/

                /* Cambio de Nombre Botón del modal dialog */
                $('#documentaryDispositionNavTab .nav-tabs a').click(function (e) {
                    var optionName = $(this).attr('optionName');
                    $('#documentaryDispositionButton').html('<span class = "glyphicon glyphicon-plus"></span>'+" Agregar "+optionName);    /* Cambio Nombre Botón */
                    $('#documentaryDispositionButton').attr({"optionName":optionName});
               });
               
               $('#documentaryDispositionNavTab .nav-tabs a:first').click();
               
               /* Acción del Botón Agregar */
               $('#documentaryDispositionButton').click(function(){
                   _showCatalogOption();
               });
                           
               /* Construcción del Catálogo de disposición documental */
               var xmlStructure = _getDocDispositionCatalogStructure();
               
               if(typeof (xmlStructure) === 'object')
                   _buildDocDispositionCatalog(xmlStructure);
               
               $('.docDispositionEdit').click(function(){
                   _showDocDispositionCatalogData();
               });
               
               $('.docDispositionRemove').click(function(){
                   _deleteDocDispositionCatalogNode();
               });
            }
        });
        
        docDispoCatalogDialog = dialog;
    };
    
    /**
     * @description Comprueba si existe previamente una clave especifica tro de 
     * alguna de las 3 estructuras.
     * @param {type} keyNode
     * @returns {Number}
     */
    _checkIfExistsKey = function(keyNode){
        var fondoNode = $('#fondoTree').dynatree("getTree").getNodeByKey(keyNode);
        var sectionNode = $('#sectionTree').dynatree("getTree").getNodeByKey(keyNode);
        var serieNode = $('#serieTree').dynatree("getTree").getNodeByKey(keyNode);
        
        if(fondoNode === null && sectionNode === null && serieNode === null)
            return 0;
        else
            return 1;
        
    };
    
    /**
     * @description Elimina un nodo de la estructura de Catálogo de disposición documental
     * @returns {unresolved}
     */
    _deleteDocDispositionCatalogNode = function(){
        var node = null;
        var optionName = $('#documentaryDispositionNavTab .nav-tabs li.active a').attr('optionName');
        console.log("deleteDocDispositionCatalogNode: "+optionName);
        if(String(optionName).toLowerCase() === 'fondo'){
            node = $('#fondoTree').dynatree('getActiveNode');
            if(node === null)
                return Advertencia("Debe seleccionar un elemento para poder eliminarlo.");
            
            _deleteDocDispoCatalogNodeConfirmMessage(optionName, node);

        }
        if(String(optionName).toLowerCase() === 'seccion'){
            node = $('#sectionTree').dynatree('getActiveNode');
            
            if(node === null)
                return Advertencia("Debe seleccionar un elemento para poder eliminarlo.");
        
            _deleteDocDispoCatalogNodeConfirmMessage(optionName, node);
        }
        if(String(optionName).toLowerCase() === 'serie'){
            node = $('#serieTree').dynatree('getActiveNode');
            
            if(node === null)
                return Advertencia("Debe seleccionar un elemento para poder eliminarlo.");
        
            _deleteDocDispoCatalogNodeConfirmMessage(optionName, node);
        }
               
    };
    
    _deleteDocDispoCatalogNodeConfirmMessage = function(optionName, node){
        BootstrapDialog.show({
            title: 'Mensaje de Confirmación',
            size: BootstrapDialog.SIZE_SMALL,
            type: BootstrapDialog.TYPE_DANGER,
            closable: true,
            message: "¿Desea continuar eliminando el elemento <b>"+node.data.title+"</b>?",
            draggable: false,
            buttons: [
                {
                    label: "Eliminar",
                    cssClass:"btn-danger",
                    action:function(dialogRef){
                  
                        if(String(optionName).toLowerCase() === 'fondo'){
                            _deleteFondo(optionName, node);
                        }
                        
                        if(String(optionName).toLowerCase() === 'seccion'){
                            _deleteFondo(optionName, node);
                        }
                        
                        if(String(optionName).toLowerCase() === 'serie'){
                            _deleteSerie(node);
                        }
                        
                        dialogRef.close();
                    }
                },
                {
                    label:"Cancelar",
                    action: function(dialogRef){
                        dialogRef.close();
                    }
                }
            ],
            onshown: function(dialogRef){
                
            }
        });
    };
 
    /**
     * @description Función que elimina una sección de la estructura de sección.
     * @param {type} node Nodo activo que se eliminará.
     * @returns {undefined}
     */
    _deleteFondo = function(optionName, node){        
        var sectionLimitOfDelete = [];
        var fondoToDelete = [];
        var sectionNode = $('#sectionTree').dynatree('getTree').getNodeByKey(node.data.key);
        
        var xml = "<delete version='1.0' encoding='UTF-8'>";        
             
        if(String(node.data.structureType).toLowerCase() === 'fondo')
            fondoToDelete.push(node);
        if(String(node.data.structureType).toLowerCase() === 'seccion')
            sectionLimitOfDelete.push(node);
          
        if(sectionNode !== null){
            xml+=   '<node>\n\
                        <idDocDisposition>'+node.data.idDocDisposition+'</idDocDisposition>\n\
                    </node>'; 
            console.log("Eliminando "+node.data.title);
            var sectionChildren = sectionNode.getChildren();
            if(sectionChildren !== null){
                
                if(String(node.data.structureType) === 'section'){
                    var serieNode = $('#serieTree').dynatree('getTree').getNodeByKey(node.data.key);
                    if(serieNode !== null){                     
                        var serieChildren = serieNode.getChildren();
                        if(serieChildren !== null){
                            for(var aux = 0; aux < serieChildren.length; aux++){
                                var serieChild = serieChildren[aux];
                                var subSerieChildren = serieChild.getChildren();

                                if(subSerieChildren !== null)
                                            serieChildren = serieChildren.concat(subSerieChildren);

                                if(String(serieChild.data.structureType).toLowerCase() === 'serie'){
                                    console.log("Eliminando Serie: "+serieChild.data.title+", "+serieChild.data.idDocDisposition);
                                    xml+=   '<node>\n\
                                                <idDocDisposition>'+serieChild.data.idDocDisposition+'</idDocDisposition>\n\
                                            </node>';
                                    sectionLimitOfDelete.push(serieChild);
                                }
                            }
                        }
                    }
                }
                
                for(var sectionCont = 0; sectionCont < sectionChildren.length; sectionCont++){

                    var sectionChild = sectionChildren[sectionCont];             
                    var sectionSubChildren = sectionChild.getChildren();

                    if(sectionSubChildren !== null)
                        sectionChildren = sectionChildren.concat(sectionSubChildren);

                    if(String(sectionChild.data.structureType).toLowerCase() === 'fondo'){
                        console.log("Eliminando Fondo: "+sectionChild.data.title+", "+sectionChild.data.idDocDisposition);
                        xml+=   '<node>\n\
                                    <idDocDisposition>'+sectionChild.data.idDocDisposition+'</idDocDisposition>\n\
                                </node>'; 
                        
                        fondoToDelete.push(sectionChild);

                    }

                    if(String(sectionChild.data.structureType).toLowerCase() === 'section'){
                        console.log("Eliminando Sección: "+sectionChild.data.title+", "+sectionChild.data.idDocDisposition);
                        
                        xml+=   '<node>\n\
                                    <idDocDisposition>'+sectionChild.data.idDocDisposition+'</idDocDisposition>\n\
                                </node>';

                        sectionLimitOfDelete.push(sectionChild);

                        serieNode = $('#serieTree').dynatree('getTree').getNodeByKey(sectionChild.data.key);

                        if(serieNode !== null){
                            serieChildren = serieNode.getChildren();
                            if(serieChildren !== null){
                                for(var aux = 0; aux < serieChildren.length; aux++){
                                    serieChild = serieChildren[aux];
                                    subSerieChildren = serieChild.getChildren();
                                    
                                    if(subSerieChildren !== null)
                                                serieChildren = serieChildren.concat(subSerieChildren);
                                                                                
                                    if(String(serieChild.data.structureType).toLowerCase() === 'serie'){
                                        console.log("Eliminando Serie: "+serieChild.data.title+", "+serieChild.data.idDocDisposition);
                                        xml+=   '<node>\n\
                                                    <idDocDisposition>'+serieChild.data.idDocDisposition+'</idDocDisposition>\n\
                                                </node>';
                                        sectionLimitOfDelete.push(serieChild);
                                    }
                                }
                            }
                        }
                    }                        
                }
                
                sectionLimitOfDelete.push(node);

                
            }
        }
        
        /* Se eliminan los nodos de cada Estructura (Fondo, Sección y Serie) */
                
        for(sectionCont = 0; sectionCont < sectionLimitOfDelete.length; sectionCont++){
            var sectionNodeToDeleting = sectionLimitOfDelete[sectionCont];
            var serieNodeToDeleting = null;
            var fondoNodeToDelete = null;

            if(String(sectionNodeToDeleting.data.structureType).toLowerCase() === 'section'){                        
                sectionNodeToDeleting = $('#sectionTree').dynatree('getTree').getNodeByKey(sectionNodeToDeleting.data.key);

                if(sectionNodeToDeleting !== null){
                    serieNodeToDeleting = $('#serieTree').dynatree('getTree').getNodeByKey(sectionNodeToDeleting.data.key);

                    if(serieNodeToDeleting !== null)
                        serieNodeToDeleting.remove();

                    if(sectionNodeToDeleting !== null)
                        sectionNodeToDeleting.remove();
                }

                continue;
            }   

            if(String(sectionNodeToDeleting.data.structureType).toLowerCase() === 'serie'){
                serieNodeToDeleting = $('#serieTree').dynatree('getTree').getNodeByKey(sectionNodeToDeleting.data.key);

                if(serieNodeToDeleting !== null)
                    serieNodeToDeleting.remove();
            }

        }
                
        /* Se eliminan los nodos de la estructura de Fondo */
        for(sectionCont = 0; sectionCont < fondoToDelete.length; sectionCont++){
            var sectionNodeToDeleting = fondoToDelete[sectionCont];
            var serieNodeToDeleting = null;
            var fondoNodeToDelete = null;
            console.log("Eliminando "+sectionNodeToDeleting.data.title);
            if(String(sectionNodeToDeleting.data.structureType).toLowerCase() === 'fondo'){
                fondoNodeToDelete = $('#fondoTree').dynatree('getTree').getNodeByKey(sectionNodeToDeleting.data.key);

                sectionNodeToDeleting = $('#sectionTree').dynatree('getTree').getNodeByKey(sectionNodeToDeleting.data.key);
                if(sectionNodeToDeleting !== null)
                    sectionNodeToDeleting.remove();

                if(fondoNodeToDelete !== null)
                    fondoNodeToDelete.remove();

                continue;
            }         

        }          
        
        xml+="</delete>";
        console.log(xml);       

        if(parseInt(node.data.idDocDisposition) > 0)
            _deleteDocDispoCatalogNode(xml);
    };
    
    _deleteSerie = function(node){
        console.log("deleteSerie");
        var xml = "<delete version='1.0' encoding='UTF-8'>";        
        
        var serieNode = $('#serieTree').dynatree('getTree').getNodeByKey(node.data.key);
        
        if(serieNode === null)
            return errorMessage("No fué posible recuperar el nodo activo para la <b>Serie "+node.data.title+"</b>");
        
        var serieChildren = serieNode.getChildren();
        
        if(serieChildren !== null){
            for(var cont = 0; cont < serieChildren.length; cont++){
                var child = serieChildren[cont];

                var subChild = child.getChildren();

                if(subChild !== null)
                    serieChildren = serieChildren.concat(subChild);

                xml+=   '<node>\n\
                        <idDocDisposition>'+child.data.idDocDisposition+'</idDocDisposition>\n\
                    </node>';
            }
        }
        
        xml+=   '<node>\n\
                    <idDocDisposition>'+node.data.idDocDisposition+'</idDocDisposition>\n\
                </node>';
        
        xml+="</delete>";
        node.remove();
        
        console.log(xml);
        
        if(parseInt(node.data.idDocDisposition) > 0)
            _deleteDocDispoCatalogNode(xml);
        
    };
    
    /**
     * @description Muestra los datos de un nodo perteneciente al Catálogo de Disposición Documental
     * @param {type} node
     * @returns {undefined}
     */
    _showDocDispositionCatalogData = function(node){
        var node = null;
        var optionName = $('#documentaryDispositionNavTab .nav-tabs li.active a').attr('optionName');
               
        if(String(optionName).toLowerCase() === 'fondo')
            node = $('#fondoTree').dynatree('getActiveNode');
        
        if(String(optionName).toLowerCase() === 'seccion')
            node = $('#sectionTree').dynatree('getActiveNode');
        
        if(String(optionName).toLowerCase() === 'serie')
            node = $('#serieTree').dynatree('getActiveNode');
               
        if(node === null)
           return Advertencia("Debe seleccionar un elemento para poder editarlo.");
        
        var panelForms = _getArchivalDispositionFormsPanel();
        
        var dialog = BootstrapDialog.show({
            title: 'Editando Datos',
            size: BootstrapDialog.SIZE_SMALL,
            closable: true,
            message: panelForms,
            draggable: false,
            buttons: [
                {
                    label: "Modificar",
                    cssClass:"btn-warning",
                    action: function(dialogRef){
                        var button = this;
                        button.spin();
                        
                        var oldTitle = node.data.title;
                        var oldKey = node.data.key;
                        var oldDescription = node.data.description;
                                              
                        var title = $('#catalogNameDocDispo').val();
                        var key = $('#catalogKeyDocDispo').val();
                        var description = $('#catalogDescripDocDispo').val();
                        
                        if(String(oldKey) === key)
                            console.log("La clave no ha cambiado");
                        else{
                            if(_checkIfExistsKey(key) === 1){
                                button.stopSpin();
                                return Advertencia("La clave <b>"+key+"</b> que intenta ingresar ya existe");
                            }
                        }
                        
                        node.data.title = title;
                        node.data.key = key;
                        node.data.description = description;
                        
                        if(parseInt(node.data.idDocDisposition) > 0)
                            _modifyDocDispoCatalogNode({idDocDisposition:node.data.idDocDisposition, catalogName: title, nameKey: key, structureType: node.data.structureType, description: description, parentKey: node.getParent().data.key});
                        
                        node.render();
                        
                        if(String(optionName).toLowerCase() === 'fondo'){
                            var sectionNode = $('#sectionTree').dynatree('getTree').getNodeByKey(oldKey);
                            if(sectionNode !== null){
                                sectionNode.data.title = title;
                                sectionNode.data.key = key;
                                sectionNode.data.description = description;
                                sectionNode.render();
                            }
                        }
                                

                        if(String(optionName).toLowerCase() === 'serie'){
                            var serieNode = $('#serieTree').dynatree('getTree').getNodeByKey(oldKey);
                            if(serieNode !== null){
                                serieNode.data.title = title;
                                serieNode.data.key = key;
                                serieNode.data.description = description;
                                serieNode.render();
                            }
                        }
                                                  
                        dialogRef.close();
                    }
                },
                {
                    label: "Cerrar",
                    action: function(dialogRef){
                        dialogRef.close();
                    }
                }
            ],
            onshown: function(dialogRef){
                $('#catalogNameDocDispo').val(node.data.title);
                $('#catalogKeyDocDispo').val(node.data.key);
                $('#catalogDescripDocDispo').val(node.data.description);
            }
        });
    };
    
    /**
     * @description Modifica los datos en la BD del nodo seleccionado.
     * @param {type} node
     * @returns {undefined}
     */
    _modifyDocDispoCatalogNode = function(data){
        $.ajax({
        async: false, 
        cache: false,
        dataType: "html", 
        type: 'POST',   
        url: "Modules/php/Archival.php",
        data: {option: "modifyDocDispCatalogNode", idDocDisposition:data.idDocDisposition, catalogName: data.catalogName, nameKey: data.nameKey, 
            nodeType: data.structureType, description: data.description, parentKey: data.parentKey}, 
        success:  function(xml)
        {           
            if($.parseXML( xml )===null){errorMessage(xml); return 0;}else xml=$.parseXML( xml );
     
            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                errorMessage(mensaje);
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){errorMessage(textStatus +"<br>"+ errorThrown);}
        });       
    };
    
    _deleteDocDispoCatalogNode = function(xml){
        
        $.ajax({
        async: false, 
        cache: false,
        dataType: "html", 
        type: 'POST',   
        url: "Modules/php/Archival.php",
        data: {option: "deleteDocDispoCatalogNode", xml: xml},
        success:  function(xml)
        {           
            if($.parseXML( xml )===null){errorMessage(xml); return 0;}else xml=$.parseXML( xml );
     
            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                errorMessage(mensaje);
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){errorMessage(textStatus +"<br>"+ errorThrown);}
        });       
    };
    
    /**
     * @description Almacena en la BD un nuevo nodo.
     * @returns {undefined}
     */
    _storeNewNodeIntoDataBase = function(data){
        var idDocDisposition = 0;
        
        $.ajax({
        async: false, 
        cache: false,
        dataType: "html", 
        type: 'POST',   
        url: "Modules/php/Archival.php",
        data: {option: "storeNewNodeIntoDataBase", catalogName: data.catalogName, nameKey: data.nameKey, 
            nodeType: data.structureType, description: data.description, parentKey: data.parentKey},
        success:  function(xml)
        {           
            if($.parseXML( xml )===null){errorMessage(xml); return 0;}else xml=$.parseXML( xml );
            
            if($(xml).find("newIdDocDisposition").length > 0){
                idDocDisposition = $(xml).find("newIdDocDisposition").text();
            }
                      
            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                errorMessage(mensaje);
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){errorMessage(textStatus +"<br>"+ errorThrown);}
        });   
        
        return idDocDisposition;
    };
    
     /*
     * @description Agrega un elemento a Fondo, en el catálogo de Disposición 
     *              Documental de manera dinámica y solo en memoria en el árbol de Fondo.
     * @param {type} docDispositionData Contiene los datos para agregar un nuevo elemento
     *                                  al catálogo de disposición documental.
     * @returns {Number}
     */
    _addFondo = function(dialogRef){
        var docDispositionData = _getDocumentaryDispositionData();
        var activeKeyParent;
        
        if(_checkIfExistsKey(docDispositionData.catalogKey) === 1)
            return Advertencia("La clave <b>"+docDispositionData.catalogKey+"</b> que intenta ingresar ya existe");
                
        var activeNode = $("#fondoTree").dynatree("getRoot");
        
        if(activeNode.getChildren() !== null){
            activeNode = $("#fondoTree").dynatree("getActiveNode");
            if(activeNode === null)
                return Advertencia("Debe seleccionar el Fondo");
                
            activeKeyParent = $('#fondoTree').dynatree("getActiveNode").data.key;
            
            if(activeKeyParent === null)
                return Advertencia("No pudo ser recuperado el nodo activo de la estructura <b>Fondo</b>");
        }
        
        if(activeNode === null)
            return Advertencia("No pudo ser recuperado el nodo activo de la estructura <b>Fondo</b>");
              
        var newNode = {
            title: docDispositionData.catalogName,
            key: docDispositionData.catalogKey,
            tooltip: docDispositionData.catalogDescript,
            description: docDispositionData.catalogDescript,
            structureType: "fondo",
            isFolder: true,
            expand: true,
            icon: "/img/archival/fondo.png"
        };
        var idDocDisposition = 0;
        
        if(parseInt(activeNode.data.idDocDisposition) > 0){
            console.log('Agregando Fondo');
            var docDispCloseButton = docDispoCatalogDialog.getButton('docDispCloseButton');
            docDispCloseButton.disable();
            
            var documentaryDispositionAddNodeButton = docDispoCatalogDialog.getButton('documentaryDispositionButton');
            documentaryDispositionAddNodeButton.spin();
            documentaryDispositionAddNodeButton.disable();
            
            idDocDisposition = _storeNewNodeIntoDataBase({parentKey: activeNode.data.key, catalogName: newNode.title, nameKey: newNode.key, structureType: newNode.structureType, description: newNode.description});
            
            documentaryDispositionAddNodeButton.enable();
            documentaryDispositionAddNodeButton.stopSpin();
            
            docDispCloseButton.enable();
            
            if(parseInt(idDocDisposition) > 0)
                newNode.idDocDisposition = idDocDisposition;
            else
                return 0;
        }
        
        var childNode = activeNode.addChild(newNode);
        
        childNode.activate(true);
        
        var sectionTree = $('#sectionTree').dynatree("getRoot");
        var sectionTreeChildren = sectionTree.getChildren();
        var activeNodeSection;

        if(sectionTreeChildren !== null)
            activeNodeSection = $('#sectionTree').dynatree("getTree").activateKey(activeKeyParent);
        else
            activeNodeSection = $('#sectionTree').dynatree("getRoot");
        
        var childNodeSection = activeNodeSection.addChild(newNode);
       
       childNodeSection.activate(true);
       
       dialogRef.close();
    };
    
    /*
     * @description Agrega un elemento a Sección, en el catálogo de Disposición 
     *              Documental de manera dinámica y solo en memoria en el árbol de Sección.
     * @param {type} docDispositionData Contiene los datos para agregar un nuevo elemento
     *                                  al catálogo de disposición documental.
     * @returns {Number}
     */
    _addSeccion = function(dialogRef){
        var docDispositionData = _getDocumentaryDispositionData();  
        var activeNodeFondo = $('#fondoTree').dynatree("getActiveNode");
        var sectionTree = $('#sectionTree').dynatree("getActiveNode");
        var fondoKey = activeNodeFondo.data.key;
        var sectionKey, sectionKeyParent;
        var serieTree;
        var childNodeSerie;
        
        if(_checkIfExistsKey(docDispositionData.catalogKey) === 1)
            return Advertencia("La clave <b>"+docDispositionData.catalogKey+"</b> que intenta ingresar ya existe");
        
        
        if(sectionTree === null)
            return Advertencia("No se ha activado una <b>sección</b>");
        
        if(activeNodeFondo === null)
            return Advertencia("Debe seleccionar <b>Fondo</b>");
        
        var fondoKey = activeNodeFondo.data.key;
        
        if(fondoKey === null)
            return Advertencia("Debe seleccionar un <b>Fondo</b>");
        
        var activeNodeSection = $("#sectionTree").dynatree("getActiveNode");
        
        if(activeNodeSection === null)
            return Advertencia("No existe la estructura de  <b>Sección</b>");
        
        var newNode = {
            title: docDispositionData.catalogName,
            tooltip: docDispositionData.catalogDescript,
            description: docDispositionData.catalogDescript,
            key: docDispositionData.catalogKey,
            structureType: "section",
            isFolder: true,
            expand: true,
            icon: "/img/archival/seccion.png"
        };
        
        var idDocDisposition;
        
        if(parseInt(activeNodeSection.data.idDocDisposition) > 0){
            console.log('Agregando Sección');
            var docDispCloseButton = docDispoCatalogDialog.getButton('docDispCloseButton');
            docDispCloseButton.disable();
            
            var documentaryDispositionAddNodeButton = docDispoCatalogDialog.getButton('documentaryDispositionButton');
            documentaryDispositionAddNodeButton.spin();
            documentaryDispositionAddNodeButton.disable();
            
            idDocDisposition = _storeNewNodeIntoDataBase({parentKey: activeNodeSection.data.key, catalogName: newNode.title, nameKey: newNode.key, structureType: newNode.structureType, description: newNode.description});
            
            documentaryDispositionAddNodeButton.enable();
            documentaryDispositionAddNodeButton.stopSpin();
            
            docDispCloseButton.enable();
            
            if(parseInt(idDocDisposition) > 0)
                newNode.idDocDisposition = idDocDisposition;
            else
                return 0;
        }
        
        var childNode = activeNodeSection.addChild(newNode);
          
        childNode.activate(true);
        
        /* Agregando Sección a Serie */
        serieTree = $('#serieTree').dynatree("getTree");
        
        sectionKeyParent = $('#sectionTree').dynatree("getTree").getNodeByKey(docDispositionData.catalogKey).getParent().data.key;
        
        if(serieTree.getNodeByKey(sectionKeyParent) !== null)          
            serieTree = serieTree.getNodeByKey(sectionKeyParent);
        else
            serieTree = $('#serieTree').dynatree("getRoot");
               
        if(serieTree === null)
            return Advertencia("No se ha construido la estructura <b>Serie</b>");
              
        childNodeSerie = serieTree.addChild(newNode);
        
        childNodeSerie.activate(true);
        
        dialogRef.close();
    };
    
    /*
     * @description Agrega un elemento a Serie, en el catálogo de Disposición 
     *              Documental de manera dinámica y solo en memoria en el árbol de Serie.
     * @param {type} docDispositionData Contiene los datos para agregar un nuevo elemento
     *                                  al catálogo de disposición documental.
     * @returns {Number}
     */
    _addSerie = function(dialogRef){
        var docDispositionData = _getDocumentaryDispositionData();
        
        if(_checkIfExistsKey(docDispositionData.catalogKey) === 1)
            return Advertencia("La clave <b>"+docDispositionData.catalogKey+"</b> que intenta ingresar ya existe");
                
        var serieTree = $("#serieTree").dynatree("getRoot");
        
        if(serieTree === null)
            return Advertencia("No se ha construido la estructura <b>Serie</b>");
        
        var serieTreeChildren = serieTree.getChildren();
        
        if(serieTreeChildren === null)
            return Advertencia("Debe ingresar almenos una <b>Sección</b>");
        
        var activeNodeSerie = $("#serieTree").dynatree("getActiveNode");
        
        if(activeNodeSerie === null)
            return Advertencia("Debe seleccionar una  ó subserie");
        
        var newNode = {
            title: docDispositionData.catalogName,
            tooltip: docDispositionData.catalogDescript,
            description: docDispositionData.catalogDescript,
            key: docDispositionData.catalogKey,
            structureType: "serie",
            isFolder: true,
            expand: true,
            icon: "/img/archival/serie.png"
        };
        
        var idDocDisposition;
    
        if(parseInt(activeNodeSerie.data.idDocDisposition) > 0){
            console.log('Agregando Serie');
            var docDispCloseButton = docDispoCatalogDialog.getButton('docDispCloseButton');
            docDispCloseButton.disable();
            
            var documentaryDispositionAddNodeButton = docDispoCatalogDialog.getButton('documentaryDispositionButton');
            documentaryDispositionAddNodeButton.spin();
            documentaryDispositionAddNodeButton.disable();
            
            idDocDisposition = _storeNewNodeIntoDataBase({parentKey: activeNodeSerie.data.key, catalogName: newNode.title, nameKey: newNode.key, structureType: newNode.structureType, description: newNode.description});
            
            documentaryDispositionAddNodeButton.enable();
            documentaryDispositionAddNodeButton.stopSpin();
            
            docDispCloseButton.enable();
            
            if(parseInt(idDocDisposition) > 0)
                newNode.idDocDisposition = idDocDisposition;
            else
                return 0;
        }  
        
        var childNode = activeNodeSerie.addChild(newNode);
            
        childNode.activate(true);
        
        dialogRef.close();
    };
    
    /*
     * @describe(Construye el catálogo de disposición documental definido por 
     * el usuario.)
     */
    _buildDocumentaryDispositionCatalog = function(dialogRef){
        console.log("Construyendo catálogo de disposición documental");
        
        var fondoTree = $('#fondoTree').dynatree("getRoot");
        var sectionTree = $('#sectionTree').dynatree("getRoot");
        var serieTree = $('#serieTree').dynatree("getRoot");
        
        if(fondoTree === null || sectionTree === null || serieTree === null)
            return messageError("No fué posible obtener la estructura. Error Dynatree");
        
        if(fondoTree.getChildren() === null)
            return Advertencia("Debe ingresar un <b>Fondo</b>");
        
        if(sectionTree.getChildren().length === 0)
            return Advertencia("Debe ingresar una <b>Serie</b>");
  
        var catalogXmlStructure = _getCatalogXmlStructure(fondoTree, sectionTree, serieTree);
        
        _buildNewArchivalDispositionCatalog(catalogXmlStructure, dialogRef);
        
        return 1;
    };
    
    /**
     * @description Construye un XML con la estructura formada por el usuario correspondiente 
     * al catálogo de disposición documental.
     * El recorrido de la estructura comienza en "Sección" analizando primero a "Fondo" y "Sección"
     * paralelamente al detectar una sección se recorreo la estructura de Serie. De esta forma se
     * obtiene el XML con la estructura jerárquica (Forma de árbol).
     *                           
     * @param {type} fondoTree      Estructura de árbol para Fondo
     * @param {type} sectionTree    Estructura de árbol para Sección
     * @param {type} serieTree      Estructura de árbol para Serie
     * @returns {String}            Xml generado.
     */
    _getCatalogXmlStructure = function(fondoTree, sectionTree, serieTree){
        var xmlStructure = "<docDispositionCatalog version='1.0' encoding='UTF-8'>";
        
        var sectionDirectories = sectionTree.getChildren();
        
        for(var cont = 0; cont < sectionDirectories.length; cont++){
            var directory = sectionDirectories[cont];
            var sectionStructureType = directory.data.structureType;
            var sectionDirKey = null;                       
            
            console.log(directory.data.title+" type: "+sectionStructureType);
            
            if(String(sectionStructureType).toLowerCase() === "section"){
                var nodeParent = directory.getParent();
                
                if(nodeParent === null)
                    nodeParent = "";
                else
                    nodeParent = nodeParent.data.key;
                
                xmlStructure+=  "<node>\n\
                                    <type>section</type>\n\
                                    <parentNode>"+nodeParent+"</parentNode>\n\
                                    <title>"+directory.data.title+"</title>\n\
                                    <description>"+directory.data.description+"</description>\n\
                                    <key>"+directory.data.key+"</key>\n\
                                </node>";
//                console.log(xmlStructure);
                sectionDirKey = directory.data.key;
                                
            }
            
            if(String(sectionStructureType).toLowerCase() === "fondo"){
                var nodeParent = directory.getParent();
                
                if(nodeParent === null)
                    nodeParent = "";
                else
                    nodeParent = nodeParent.data.key;
                
                xmlStructure+=  "<node>\n\
                                    <type>fondo</type>\n\
                                    <parentNode>"+nodeParent+"</parentNode>\n\
                                    <title>"+directory.data.title+"</title>\n\
                                    <description>"+directory.data.description+"</description>\n\
                                    <key>"+directory.data.key+"</key>\n\
                                </node>";
//                console.log(xmlStructure);
            }
            
            if(directory.getChildren() !== null){
                var children = directory.getChildren();
                sectionDirectories = sectionDirectories.concat(children);
            }
            
            var serieDirectories = null;
            
            if(sectionDirKey !== null){
                serieDirectories = $('#serieTree').dynatree("getTree").getNodeByKey(sectionDirKey);
                
                if(serieDirectories !== null)
                    serieDirectories = serieDirectories.getChildren();
            }
            
            if(serieDirectories !== null){
                for(var serieCont = 0; serieCont < serieDirectories.length ; serieCont++){
                    var serieDirectory = serieDirectories[serieCont];  
                    var serieStructureType = serieDirectory.data.structureType;
                    
                    if(String(serieStructureType).toLowerCase() === "section")
                        continue;
                    
                    var nodeParent = serieDirectory.getParent();
                
                    if(nodeParent === null)
                        nodeParent = "";
                    else
                        nodeParent = nodeParent.data.key;
                    
                    xmlStructure+=  "<node>\n\
                                        <type>serie</type>\n\
                                        <parentNode>"+nodeParent+"</parentNode>\n\
                                        <title>"+serieDirectory.data.title+"</title>\n\
                                        <description>"+serieDirectory.data.description+"</description>\n\
                                        <key>"+serieDirectory.data.key+"</key>\n\
                                    </node>";
//                    console.log(xmlStructure);

                    if(serieDirectory.getChildren() !== null){
                        var serieChildren = serieDirectory.getChildren();
                        serieDirectories = serieDirectories.concat(serieChildren);
                    }
                }
            }
        }
        
        xmlStructure+="</docDispositionCatalog>";
        
        return xmlStructure;
    };     
     
    _buildNewArchivalDispositionCatalog = function(catalogXmlStructure, dialogRef){
        
        $.ajax({
        async:false, 
        cache:false,
        dataType:'html', 
        type: 'POST',   
        url: "Modules/php/Archival.php",
        data: {option:"buildNewArchivalDispositionCatalog", xmlStructure:catalogXmlStructure}, 
        success:  function(xml)
        {   
            if($.parseXML( xml )===null){ errorMessage(xml); return 0;}else xml = $.parseXML( xml );
            
            $(xml).find('docuDispositionCatalogCreated').each(function(){
                var mensaje = $(this).find('Mensaje').text();
                Notificacion(mensaje);
                dialogRef.close();
                _buildDocumentaryDispositionConsole();
            });
            
            $(xml).find("Error").each(function()
            {
                var mensaje = $(this).find("Mensaje").text();
                
                errorMessage(mensaje);
            });  
            
        },
        beforeSend:function(){          },
        error: function(jqXHR, textStatus, errorThrown){errorMessage(textStatus +"<br>"+ errorThrown);}
        });
    }; 
    
    /**
     * @description Obtiene la estructura del Catálogo de Disposición Documental.
     * @return {XML} Xml con la estructura del Catálogo de Disposición Documental.
     */
    _getDocDispositionCatalogStructure = function(){
        var xmlStructure = null;
        
        $.ajax({
        async:false, 
        cache:false,
        dataType:'html', 
        type: 'POST',   
        url: "Modules/php/Archival.php",
        data: {option:"getDocDispositionCatalogStructure"}, 
        success:  function(xml)
        {   
            if($.parseXML( xml )===null){ errorMessage(xml); return 0;}else xml = $.parseXML( xml );
            
            if($(xml).find('docDispositionCatalog').length > 0)
                xmlStructure = xml;
            
            $(xml).find("Error").each(function()
            {
                var mensaje = $(this).find("Mensaje").text();
                
                errorMessage(mensaje);
            });  
            
        },
        beforeSend:function(){          },
        error: function(jqXHR, textStatus, errorThrown){errorMessage(textStatus +"<br>"+ errorThrown);}
        });
        
        return xmlStructure;
    };
    
    /**
     * @description Construye el Catálogo de Disposición Documental
     * @param {Xml} xmlStructure
     * @returns {undefined}
     */
    _buildDocDispositionCatalog = function(xmlStructure){
        var fondoNodesArray = new Array;
        var sectionNodesArray = new Array;
        var serieNodesArray = new Array();
        
        $(xmlStructure).find('node').each(function(){
            
            if($(this).find('NodeType').text() === 'fondo' )
                fondoNodesArray.push($(this));
            if($(this).find('NodeType').text() === 'section')
                sectionNodesArray.push($(this));
            if($(this).find('NodeType').text() === 'serie')
                serieNodesArray.push($(this));
        }); 
        
        if(fondoNodesArray.length > 0){
            if(_buildFondoAndSectionTree(fondoNodesArray) === 1)
                if(_buildSectionTree(sectionNodesArray) === 1)
                    _buildSerieTree(serieNodesArray);
        }
        
    };
    
    _buildFondoAndSectionTree = function(nodesArray){
        var fondoTree;
        var rootStatus = false;
        var newDirectory;
        
        $('#docDispositionBuildButton').remove();
        
        for(var cont = 0; cont < nodesArray.length; cont++){
            var node = nodesArray[cont];            
            fondoTree = $('#fondoTree').dynatree('getRoot');      
            var sectionTree = $('#sectionTree').dynatree('getRoot');
                    
            if($(node).find('ParentKey').text() === '0'){
                newDirectory = {
                    idDocDisposition: $(node).find('idDocumentaryDisposition').text(),
                    title: $(node).find('Name').text(),
                    key: $(node).find('NameKey').text(),
                    tooltip: $(node).find('Name').text(),
                    description: $(node).find('Description').text(),
                    structureType: $(node).find('NodeType').text(),
                    isFolder: true,
                    expand: true,
                    icon: "/img/archival/fondo.png",
                    activate: true
                };
                
                fondoTree.addChild(newDirectory);
                sectionTree.addChild(newDirectory);
                
                rootStatus = true;
        
                break;
            }
        }
        if(rootStatus === false)
            return errorMessage("No fué localizado el root de Fondo");
        
        for(cont = 0; cont < nodesArray.length; cont++){
            var node = nodesArray[cont];
            var parentKey = $(node).find('ParentKey').text();
            fondoTree = $('#fondoTree').dynatree('getTree');   
            var parent = fondoTree.getNodeByKey(parentKey);
            var sectionTree = $('#sectionTree').dynatree('getTree');
            var parentSectionTree = sectionTree.getNodeByKey(parentKey);
                  
            if($(node).find('ParentKey').text() !== '0'){
                if(parent === null)
                    return errorMessage("No se ha localizado el nodo padre <b>"+parentKey+"</b> de <b>"+$(node).find('Name').text()+"</b> para Fondo");
                if(parentSectionTree === null)
                    return errorMessage("No se ha localizado el nodo padre <b>"+parentKey+"</b> de <b>"+$(node).find('Name').text()+"</b> para Sección");
                
                newDirectory = {
                    idDocDisposition: $(node).find('idDocumentaryDisposition').text(),
                    title: $(node).find('Name').text(),
                    key: $(node).find('NameKey').text(),
                    tooltip: $(node).find('Name').text(),
                    description: $(node).find('Description').text(),
                    structureType: $(node).find('NodeType').text(),
                    isFolder: true,
                    expand: true,
                    icon: "/img/archival/fondo.png"
                };
                
                parent.addChild(newDirectory);
                parentSectionTree.addChild(newDirectory);
            }   
        }
        
        return 1;
    };
    
    _buildSectionTree = function(nodesArray){
        var sectionTree;
        var parentSectionTree;
        var serieTree;
        var newDirectory;
        var child;
        var serieChild;
        
        for(var cont = 0; cont < nodesArray.length; cont++){
            var node = nodesArray[cont];            
            serieTree = $('#serieTree').dynatree('getTree');      
            parentSectionTree = $(node).find('ParentKey').text();
                       
            newDirectory = {
                idDocDisposition: $(node).find('idDocumentaryDisposition').text(),
                title: $(node).find('Name').text(),
                key: $(node).find('NameKey').text(),
                tooltip: $(node).find('Name').text(),
                description: $(node).find('Description').text(),
                structureType: $(node).find('NodeType').text(),
                isFolder: true,
                expand: true,
                icon: "/img/archival/seccion.png"
            };
            
            if(cont === 0)
                newDirectory.activate = true;
            
            if($(node).find('NodeType').text() === 'section'){
                console.log("Agregando en Serie");
                sectionTree = $('#sectionTree').dynatree('getTree');
                child = sectionTree.getNodeByKey(parentSectionTree);
                serieChild = serieTree.getNodeByKey(parentSectionTree);
                            
                if(child === null)
                    return errorMessage("No se ha localizado el nodo padre de  <b>"+$(node).find('Name').text()+"</b> con la clave padre  "+$(node).find('ParentKey').text()+" en la estructura de <b>Sección</b>");
 
                child.addChild(newDirectory);     
                
                if(serieChild === null)
                    $('#serieTree').dynatree('getRoot').addChild(newDirectory);
                else
                    serieChild.addChild(newDirectory);
                
            }
            
        }

        return 1;
    };
    
    _buildSerieTree = function(nodesArray){
        console.log("Construyendo estructura de Serie");
        
        var serieNode;
        var serieTree = $('#serieTree').dynatree("getTree");
        var nodeSerieParent;
        var parentKey;
        
        for(var cont = 0; cont < nodesArray.length; cont++){
            serieNode = nodesArray[cont];
            parentKey = $(serieNode).find('ParentKey').text();
            nodeSerieParent = serieTree.getNodeByKey(parentKey);
            
            var newDirectory = {
                idDocDisposition: $(serieNode).find('idDocumentaryDisposition').text(),
                title: $(serieNode).find('Name').text(),
                key: $(serieNode).find('NameKey').text(),
                tooltip: $(serieNode).find('Name').text(),
                description: $(serieNode).find('Description').text(),
                structureType: $(serieNode).find('NodeType').text(),
                isFolder: true,
                expand: true,
                icon: "/img/archival/serie.png"
            };
            
            if(nodeSerieParent === null)
                $('#serieTree').dynatree("getRoot").addChild(newDirectory);
            else
                nodeSerieParent.addChild(newDirectory);
            
        }
    };
     
};  /* Fin Clase */

