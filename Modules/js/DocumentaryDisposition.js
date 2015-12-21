/* global BootstrapDialog, BotonesWindow 
 * 
 * @description Catálogo de disposición documental. Menú Archivística
 * */
var DocumentaryDispositionClass = function(){
    
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
    

    
    _buildDocumentaryDispositionConsole = function(){
        
        var tabbable = $('<div>',{id:"documentaryDispositionNavTab"});
        
        var navTab = $('<ul>', {class:"nav nav-tabs"});
        
        var fondoLi = $('<li>', {class:"active"}).append('<a href="#fondoTree" optionName = "Fondo" data-toggle="tab">Fondo</a>');
        var sectionLi = $('<li>').append('<a href="#sectionTree" optionName = "Seccion" data-toggle="tab">Sección</a>');
        var serieLi = $('<li>').append('<a href="#serieTree" optionName = "Serie" data-toggle="tab">Serie</a>');
        
        var fondoDiv = $('<div>',{id:"fondoTree", class:"tab-pane active"});;
        var sectionDiv = $('<div>',{id: "sectionTree", class:"tab-pane"});
        var serieDiv = $('<div>',{id: "serieTree", class:"tab-pane"});
        
        var tabContent = $('<div>', {class:"tab-content"});
        
        var navTabBar = $('<nav>',{class:"navbar navbar-default"});
        var container = $('<div>',{ class: "container-fluid"});
        var navHeader = $('<div>', {class: "navbar-header"});
        
        var deleteButton = $('<button>', {class: "btn btn-danger navbar-btn"}).append("Eliminar");
        var editButton = $('<button>', {class: "btn btn-warning navbar-btn"}).append("Editar");
                
        container.append('<button class = "btn btn-warning navbar-btn docDispositionEdit">Editar</button>\n\
                            <button class = "btn btn-danger navbar-btn docDispositionRemove">Eliminar</button>');        
        navTabBar.append(container);
        fondoDiv.append(navTabBar);
        
        navTabBar = $('<nav>',{class:"navbar navbar-default"});
        container = $('<div>',{ class: "container-fluid"});
        container.append('<button class = "btn btn-warning navbar-btn docDispositionEdit">Editar</button>\n\
                            <button class = "btn btn-danger navbar-btn docDispositionRemove">Eliminar</button>');        
        navTabBar.append(container);
        
        sectionDiv.append(navTabBar);
        
        navTabBar = $('<nav>',{class:"navbar navbar-default"});
        container = $('<div>',{ class: "container-fluid"});
        container.append('<button class = "btn btn-warning navbar-btn docDispositionEdit">Editar</button>\n\
                            <button class = "btn btn-danger navbar-btn docDispositionRemove">Eliminar</button>');        
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
                    id: 'documentaryDispositionButton',
                    label: 'Agregar',
                    cssClass:"btn-primary",
                    action: function(dialogRef){

                    }
                },
                {
                    id: 'docDispositionBuildButton',
                    label: 'Construir',
                    cssClass:"btn-success",
                    action: function(dialogRef){
                        _buildDocumentaryDispositionCatalog();                         
                    }
                },
                {
                    label: "Cerrar",
                    action: function(dialogRef){
                        BootstrapDialog.confirm('¿Desea continuar cerrando esta ventana?', function(result){
                            if(result) {
                                dialogRef.close();
                            }else {
                                
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
                        console.log(node);
                    }
                });
                
                var rootNode = $("#fondoTree").dynatree("getRoot");
                rootNode.data.key = 0;
                
                $('#fondoTree').dynatree("getTree").activateKey("fondoTree_0");
            
                                /* ______Sección______ */
                
                $('#sectionTree').dynatree({
                    minExpandLevel: 2,
                    onActivate: function(node) {
                        console.log(node);
                    }
                });
                
                rootNode = $("#sectionTree").dynatree("getRoot");
                rootNode.data.key = 0;
                
                 $('#sectionTree').dynatree("getTree").activateKey("sectionTree_0");                
                
                                /* ______Serie______ */
                
                $('#serieTree').dynatree({
                    minExpandLevel: 2,
                    onActivate: function(node) {
                        console.log(node);
                    }
                });
                
                rootNode = $("#serieTree").dynatree("getRoot");
                rootNode.data.key = 0;
            
                $('#serieTree').dynatree("getTree").activateKey("serieTree_0");

                                /*___________________*/

                /* Cambio de Nombre Botón del modal dialog */
                $('#documentaryDispositionNavTab .nav-tabs a').click(function (e) {
                    var optionName = $(this).attr('optionName');
                    $('#documentaryDispositionButton').html("Agregar "+optionName);    /* Cambio Nombre Botón */
                    $('#documentaryDispositionButton').attr({"optionName":optionName});
               });
               
               $('#documentaryDispositionNavTab .nav-tabs a:first').click();
               
               /* Acción del Botón Agregar */
               $('#documentaryDispositionButton').click(function(){
                   _showCatalogOption();
               });
               
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
        var optionName = $('#documentaryDispositionNavTab .nav-tabs a').attr('optionName');
        
        if(String(optionName).toLowerCase() === 'fondo'){
            node = $('#fondoTree').dynatree('getActiveNode');
            if(node === null)
                return Advertencia("Debe seleccionar un elemento para poder eliminarlo.");
        
            node.remove();
            
            node = $('#sectionTree').dynatree('getActiveNode');
            
            if(node !== null)
                node.remove();
        }
        if(String(optionName).toLowerCase() === 'seccion'){
            node = $('#sectionTree').dynatree('getActiveNode');
            
            if(node === null)
                return Advertencia("Debe seleccionar un elemento para poder eliminarlo.");
        
            node.remove();
            
            node = $('#serieTree').dynatree('getActiveNode');
            
            if(node !== null)
                node.remove();
        }
        if(String(optionName).toLowerCase() === 'serie'){
            node = $('#serieTree').dynatree('getActiveNode');
            
            if(node === null)
                return Advertencia("Debe seleccionar un elemento para poder eliminarlo.");
        
            node.remove();
        }
               
        
    };
    
    /**
     * @description Muestra los datos de un nodo perteneciente al Catálogo de Disposición Documental
     * @param {type} node
     * @returns {undefined}
     */
    _showDocDispositionCatalogData = function(node){
        var node = null;
        var optionName = $('#documentaryDispositionNavTab .nav-tabs a').attr('optionName');
        
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
                        node.data.title = "My new title";
                        node.render();
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
    
     /*
     * @description Agrega un elemento a Fondo, en el catálogo de Disposición Documental
     * @param {type} docDispositionData Contiene los datos para agregar un nuevo elemento
     *                                  al catálogo de disposición documental.
     * @returns {Number}
     */
    _addFondo = function(dialogRef){
        var docDispositionData = _getDocumentaryDispositionData();
        var activeKeyParent;
        
        if(_checkIfExistsKey(docDispositionData.catalogKey) === 1)
            return Advertencia("La clave <b>"+docDispositionData.catalogKey+"</b> que intenta ingresar ya existe");
        
        dialogRef.close();
        
        var activeNode = $("#fondoTree").dynatree("getRoot");
        
        if(activeNode.getChildren() !== null){
            
            activeKeyParent = $('#fondoTree').dynatree("getActiveNode").data.key;
            
            if(activeKeyParent === null)
                return Advertencia("No pudo ser recuperado el nodo activo de la estructura <b>Fondo</b>");
        }
        
        if(activeNode === null)
            return 0;
        
        if(activeNode.getChildren() !== null)
             if($("#fondoTree").dynatree("getActiveNode") !== null){
                 activeNode = $("#fondoTree").dynatree("getActiveNode");
                 if(activeNode === null)
                     return Advertencia("No se pudo recuperar el nodo activado.");
             }
         else
             return Advertencia("Debe seleccionar el Fondo");
        
        var childNode = activeNode.addChild({
            title: docDispositionData.catalogName,
            key: docDispositionData.catalogKey,
            tooltip: docDispositionData.catalogDescript,
            description: docDispositionData.catalogDescript,
            structureType: "fondo",
            isFolder: true
          });
          
        childNode.activate(true);
        
        var sectionTree = $('#sectionTree').dynatree("getRoot");
        var sectionTreeChildren = sectionTree.getChildren();
        var activeNodeSection;
        
        
        
        if(sectionTreeChildren !== null)
            activeNodeSection = $('#sectionTree').dynatree("getTree").activateKey(activeKeyParent);
        else
            activeNodeSection = $('#sectionTree').dynatree("getRoot");
        
        var childNodeSection = activeNodeSection.addChild({
            title: docDispositionData.catalogName,
            key: docDispositionData.catalogKey,
            tooltip: docDispositionData.catalogDescript,
            description: docDispositionData.catalogDescript,
            structureType: "fondo",
            isFolder: true
          });
       
       childNodeSection.activate(true);
    };
    
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
        
        dialogRef.close();
        
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
                
        var childNode = activeNodeSection.addChild({
            title: docDispositionData.catalogName,
            tooltip: docDispositionData.catalogDescript,
            description: docDispositionData.catalogDescript,
            key: docDispositionData.catalogKey,
            structureType: "section",
            isFolder: true
          });
          
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
              
        childNodeSerie = serieTree.addChild({
            title: docDispositionData.catalogName,
            tooltip: docDispositionData.catalogDescript,
            description: docDispositionData.catalogDescript,
            key: docDispositionData.catalogKey,
            structureType: "section",
            isFolder: true
        });
        
        childNodeSerie.activate(true);
    };
    
    _addSerie = function(dialogRef){
        var docDispositionData = _getDocumentaryDispositionData();
        
        if(_checkIfExistsKey(docDispositionData.catalogKey) === 1)
            return Advertencia("La clave <b>"+docDispositionData.catalogKey+"</b> que intenta ingresar ya existe");
        
        dialogRef.close();
        
        var serieTree = $("#serieTree").dynatree("getRoot");
        
        if(serieTree === null)
            return Advertencia("No se ha construido la estructura <b>Serie</b>");
        
        var serieTreeChildren = serieTree.getChildren();
        
        if(serieTreeChildren === null)
            return Advertencia("Debe ingresar almenos una <b>Sección</b>");
        
        var activeNodeSerie = $("#serieTree").dynatree("getActiveNode");
        
        if(activeNodeSerie === null)
            return Advertencia("Debe seleccionar una  ó subserie");
        
        var childNode = activeNodeSerie.addChild({
            title: docDispositionData.catalogName,
            tooltip: docDispositionData.catalogDescript,
            description: docDispositionData.catalogDescript,
            key: docDispositionData.catalogKey,
            structureType: "serie",
            isFolder: true
          });
          
        childNode.activate(true);
    };
    
    /*
     * @describe(Construye el catálogo de disposición documental definido por 
     * el usuario.)
     */
    _buildDocumentaryDispositionCatalog = function(){
        console.log("Construyendo catálogo de disposición documental");
        
        var fondoTree = $('#fondoTree').dynatree("getRoot");
        var sectionTree = $('#sectionTree').dynatree("getRoot");
        var serieTree = $('#serieTree').dynatree("getRoot");
        
        if(fondoTree === null || sectionTree === null || serieTree === null)
            return messageError("No fué posible obtener la estructura. Error Dynatree");
        
        if(fondoTree.getChildren() === null)
            return Advertencia("Debe ingresar un <b>Fondo</b>");
//        if(sectionTree.getChildren().length === 0)
//            return Advertencia("Debe ingresar una <b>Serie</b>");
//        if(serieTree.getChildren().length === 0)
//            return Advertencia("Debe ingresar una <b>Serie</b>");
        
        var catalogXmlStructure = _getCatalogXmlStructure(fondoTree, sectionTree, serieTree);
        
        _buildNewArchivalDispositionCatalog(catalogXmlStructure);
        
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
                console.log(xmlStructure);
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
                console.log(xmlStructure);
            }
            
            if(directory.getChildren() !== null){
                var children = directory.getChildren();
                sectionDirectories = sectionDirectories.concat(children);
            }
            
            var serieDirectories = null;
            
            if(sectionDirKey !== null){
                serieDirectories = $('#serieTree').dynatree("getTree").getNodeByKey(sectionDirKey);
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
                    console.log(xmlStructure);
                    console.log(serieDirectory.data.title+" type: "+serieDirectory.data.structureType);

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
     
    _buildNewArchivalDispositionCatalog = function(catalogXmlStructure){
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
        
        if(fondoNodesArray.length > 0)
            if(_buildFondoAndSectionTree(fondoNodesArray) === 1)
                _buildSectionTree(sectionNodesArray);
        
    };
    
    _buildFondoAndSectionTree = function(nodesArray){
        var fondoTree;
        var rootStatus = false;
        var newDirectory;
        
        for(var cont = 0; cont < nodesArray.length; cont++){
            var node = nodesArray[cont];            
            fondoTree = $('#fondoTree').dynatree('getRoot');      
            var sectionTree = $('#sectionTree').dynatree('getRoot');
                    
            if($(node).find('ParentKey').text() === '0'){
                newDirectory = {
                    title: $(node).find('Name').text(),
                    key: $(node).find('NameKey').text(),
                    tooltip: $(node).find('Name').text(),
                    description: $(node).find('Description').text(),
                    structureType: $(node).find('NodeType').text(),
                    isFolder: true
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
                    title: $(node).find('Name').text(),
                    key: $(node).find('NameKey').text(),
                    tooltip: $(node).find('Name').text(),
                    description: $(node).find('Description').text(),
                    structureType: $(node).find('NodeType').text(),
                    isFolder: true
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
        
        for(var cont = 0; cont < nodesArray.length; cont++){
            var node = nodesArray[cont];            
            serieTree = $('#serieTree').dynatree('getRoot');      
            parentSectionTree = $(node).find('ParentKey').text();
                       
            newDirectory = {
                title: $(node).find('Name').text(),
                key: $(node).find('NameKey').text(),
                tooltip: $(node).find('Name').text(),
                description: $(node).find('Description').text(),
                structureType: $(node).find('NodeType').text(),
                isFolder: true
            };
            
            if($(node).find('NodeType').text() === 'section'){
                console.log("Agregando en Serie");
                sectionTree = $('#sectionTree').dynatree('getTree');
                child = sectionTree.getNodeByKey(parentSectionTree);
                            
                if(child === null)
                    return errorMessage("No se ha localizado el nodo padre de  <b>"+$(node).find('Name').text()+"</b> con la clave padre  "+$(node).find('ParentKey').text()+" en la estructura de <b>Sección</b>");
 
                child.addChild(newDirectory);
                serieTree.addChild(newDirectory);
                
            }
            
//            if($(node).find('ParentKey').text() !== '0'){
//                sectionTree = $('#sectionTree').dynatree('getTree');
//                child = sectionTree.getNodeByKey(parentSectionTree);
//            
//                if(child === null)
//                    return errorMessage("No se ha localizado el nodo padre de  <b>"+$(node).find('Name').text()+"</b> con la clave padre  "+$(node).find('ParentKey').text()+" en la estructura de <b>Sección</b>");
// 
//                
//                child.addChild(newDirectory);
//                                
//             
//            }
                      
        }

        return 1;
    };
    
    _buildSerieTree = function(xmlStructure){
        console.log(xmlStructure);
    };
     
};  /* Fin Clase */

DocumentaryDispositionClass.prototype.setActionToLinkDocumentaryDispositionMenu = function(){
    var self = this;
    $('.LinkDocumentaryDisposition').click(function(){
       _buildDocumentaryDispositionConsole(); 
    });
};
