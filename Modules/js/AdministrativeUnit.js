/* global BootstrapDialog */

var AdministrativeUnit = function(){
    /**
     * @description Agrega la acción de respuesta al dar click sobre la opción de menú de "Unidad Administrativa".
     * @returns {undefined}
     */
    this.setActionToLink = function(){
        $('.LinkAdministrativeUnit').click(function(){
            buildConsole();
        });   
    };
    
    var buildConsole = function(){
                                /* --- TAB UNIDAD ADMINISTRATIVA --- */
        var tabbable = $('<div>');
 
        var navTab = $('<ul>', {class:"nav nav-tabs"});
        
        var adminUnitLi = $('<li>', {class:"active"}).append('<a href="#adminUnitDiv" data-toggle="tab"><span class = "archivalAdministrativeUnitIcon"></span> Unidad Administrativa</a>');
        var serieLi = $('<li>').append('<a href="#adminUnitSerie" data-toggle="tab"><span class = "archivalSectionIcon"></span> Serie</a>');
        
        var adminUnitDiv = $('<div>',{class:"tab-pane active", id:"adminUnitDiv"});
        var serieDiv = $('<div>',{class:"tab-pane", id:"adminUnitSerie"});
        
        var tabContent = $('<div>', {class:"tab-content"});
        
        var content = $('<div>');
        var navTabBar = $('<nav>',{class:"navbar navbar-default"});
        var container = $('<div>',{ class: "container-fluid"});
        var navHeader = $('<div>', {class: "navbar-header"});
        
        container.append(navHeader);
        container.append('<div class = "btn-group-sm" role="group">\n\
                            <button class = "btn btn-success navbar-btn newAdminUnit"><span class = "glyphicon glyphicon-plus"></span></button>\n\
                            <button class = "btn btn-warning navbar-btn editAdminUnit"><span class = "glyphicon glyphicon-edit"></span></button>\n\
                            <button class = "btn btn-danger navbar-btn removeAdminUnit"><span class = "glyphicon glyphicon-remove"></span></button>\n\
                         </div>');        
        
        navTabBar.append(container);
        
        content.append(navTabBar);
        
        var adminUnit = $('<div>',{id:"adminUnitTree"});
        
        content.append(adminUnit);

        adminUnitDiv.append(content);
        
                                /* --- TAB SERIE --- */
        
        content = $('<div>');
        navTabBar = $('<nav>',{class:"navbar navbar-default"});
        container = $('<div>',{ class: "container-fluid"});
        navHeader = $('<div>', {class: "navbar-header"});
        
        container.append(navHeader);
        container.append('<div class = "btn-group-sm" role="group">\n\
                            <button class = "btn btn-success navbar-btn newAdminUnitOfSerie"><span class = "glyphicon glyphicon-plus"></span></button>\n\
                            <button class = "btn btn-danger navbar-btn removeAdminUnitOfSerie"><span class = "glyphicon glyphicon-remove"></span></button>\n\
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
            type:BootstrapDialog.TYPE_PRIMARY,
            message: tabbable,
            closable: true,
            buttons: [
                
            ],
            onshown: function(dialogRef){
                adminUnit.dynatree();
                var root = $('#adminUnitTree').dynatree('getRoot');
                if(typeof root === 'object'){
                    var child = root.addChild({
                        title:"Unidades Administrativas",
                        key:0,
                        isFolder:true,
                        expand: true,
                        icon: "/img/archival/department.png"
                    });
                    child.activate(true);
                    
                    var treeStructure = tree.getTreeStructure();
                    if(typeof treeStructure === 'object')
                        tree.build(treeStructure);
                }
                
                $('.newAdminUnit').click(function(){
                    tree.newAdminUnit();
                });
                $('.editAdminUnit').click(function(){
                    tree.editAdminUnit();
                });
                $('.removeAdminUnit').click(function(){
                    tree.removeAdminUnit();
                });
                
                $('.removeAdminUnitOfSerie').click(function(){
                    serie.removeMergeOfAdminUnit();
                });
                
                $('.newAdminUnitOfSerie').click(function(){
                    serie.mergeAdminUnitInterface();
                });
                
                /* Inicio de Serie */
                
                $('#adminUnitSerie').dynatree();
                
                var serieRoot = $('#adminUnitSerie').dynatree('getRoot');
                
                if(typeof serieRoot !== 'object')
                    return errorMessage("No fué posible obtener la raíz de la estructura <b>Serie</b>");
                
                var serieChild = serieRoot.addChild({
                    title: "Series",
                    key:0,
                    isFolder:true,
                    expand: true,
                    icon: "/img/archival/serie.png"
                    
                });
                
                serieChild.activate(true);
                
                var series = serie.getSeriesStructure();
                if(typeof serie === 'object')
                    serie.buildTree(series);
                
            },
            onclose: function(dialogRef){
                
            }
        });
    };
    
    /**
     * @description Objeto que almacena los métodos relacionados con la estructura de Unidades Administrativas.
     * @type type
     */
    var tree = {
        getTreeStructure: function(){
            
            var structure = null;
            
            $.ajax({
            async: false, 
            cache: false,
            dataType: "html", 
            type: 'POST',   
            url: "Modules/php/AdministrativeUnit.php",
            data: {option: "getAdministrativeUnitStructure"}, 
            success:  function(xml)
            {           
                if($.parseXML( xml )===null){errorMessage(xml); return 0;}else xml=$.parseXML( xml );
                
                if($(xml).find("area").length > 0)
                    structure = xml;
                
                $(xml).find("Error").each(function()
                {
                    var mensaje=$(this).find("Mensaje").text();
                    errorMessage(mensaje);
                });                 

            },
            beforeSend:function(){},
            error: function(jqXHR, textStatus, errorThrown){errorMessage(textStatus +"<br>"+ errorThrown);}
            });  
            
            return structure;
        },
        build: function(structure){
            $(structure).find('area').each(function(){
                var idAdminUnit = $(this).find('idAdminUnit').text();
                var name = $(this).find('Name').text();
                var description = $(this).find('Description').text();
                var idParent = $(this).find('idParent').text();
                
                var parent = $('#adminUnitTree').dynatree('getTree').getNodeByKey(idParent);
                if(typeof parent === 'object')
                    parent.addChild({
                        title:name,
                        key:idAdminUnit,
                        description: description,
                        isFolder:true,
                        expand: true,
                        icon: "/img/archival/department.png"
                    });           
            });
        },
        editAdminUnit: function(){
            var activeNode = $('#adminUnitTree').dynatree('getActiveNode');

            if(typeof activeNode !== 'object')
                return Advertencia("Debe seleccionar una Unidad Administrativa");
            
            if(parseInt(activeNode.data.key) === 0)
                return 0;
            
            var content = $('<div>');
            var formGroup = $('<div>',{class:"form-group"});
            var nameLabel = $('<label>').append("Nombre");
            var nameForm = $('<input>',{class:"form-control", id:"adminUnitName", value: activeNode.data.title});
            formGroup.append(nameLabel);
            formGroup.append(nameForm);
            content.append(formGroup);

            formGroup = $('<div>',{class:"form-group"});
            var descriptionLabel = $('<label>').append("Descripción");
            var descriptionForm = $('<input>',{class:"form-control", id:"adminUnitDescription", value: activeNode.data.description});
            formGroup.append(descriptionLabel);
            formGroup.append(descriptionForm);
            content.append(formGroup);
        
            var dialog = BootstrapDialog.show({
                title: 'Nueva Unidad Administrativa',
                size: BootstrapDialog.SIZE_SMALL,
                type:BootstrapDialog.TYPE_INFO,
                message: content,
                closable: true,
                buttons: [
                    {
                        label:"Cancelar",
                        action: function(dialogRef){
                            dialogRef.close();
                        }
                    },
                    {
                        label:"Modificar",
                        cssClass: "btn-warning",
                        action: function(dialogRef){
                            var button = this;
                            BootstrapDialog.show({
                                title: 'Confirmación para Modificar',
                                size: BootstrapDialog.SIZE_SMALL,
                                type:BootstrapDialog.TYPE_WARNING,
                                message: "<p>Realmente desea Modificar la información de la Unidad Administrativa <b>"+activeNode.data.title+"</b></p>",
                                closable: true,
                                buttons: [
                                    {
                                        label:"Cancelar",
                                        action: function(confirmDialog){
                                            confirmDialog.close();
                                        }
                                    },
                                    {
                                        label:"Modificar",
                                        cssClass: "btn-warning",
                                        action: function(confirmDialog){
                                            confirmDialog.close();
                                            button.spin();
                                            button.disable();

                                            if(tree.modifyAdminUnit(activeNode))
                                                dialogRef.close();

                                            button.stopSpin();
                                            button.enable();
                                        }
                                    }

                                ],
                                onshown: function(confirmDialog){
                                },
                                onclose: function(confirmDialog){

                                }
                            });                    
                        }
                    }

                ],
                onshown: function(dialogRef){
                    nameForm.focus();
                },
                onclose: function(dialogRef){

                }
            });
        },
        modifyAdminUnit: function(activeNode){
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
            data: {option: "modifyAdminUnit", idAdminUnit:idAdminUnit, name:name, description:description}, 
            success:  function(xml)
            {           
                if($.parseXML( xml )===null){errorMessage(xml); return 0;}else xml=$.parseXML( xml );
                
                $(xml).find('adminUnitModified').each(function(){
                    status = 1;
                    activeNode.data.title = name;
                    activeNode.data.description = description;
                    activeNode.render();
                });

                $(xml).find("Error").each(function()
                {
                    var mensaje=$(this).find("Mensaje").text();
                    errorMessage(mensaje);
                });                 

            },
            beforeSend:function(){},
            error: function(jqXHR, textStatus, errorThrown){errorMessage(textStatus +"<br>"+ errorThrown);}
            });   
            
            return status;

        },
        removeAdminUnit: function(){
            var activeNode = $('#adminUnitTree').dynatree('getActiveNode');

            if(typeof activeNode !== 'object')
                return Advertencia("Debe seleccionar una Unidad Administrativa");
            
            BootstrapDialog.show({
            title: 'Mensaje de Confirmación',
            size: BootstrapDialog.SIZE_SMALL,
            type:BootstrapDialog.TYPE_DANGER,
            message: "<p>Realmente desea eliminar la Unidad Administrativa <b>"+activeNode.data.title+"</b>?</p>",
            closable: true,
            buttons: [
                {
                    label:"Cancelar",
                    action: function(dialogRef){
                        dialogRef.close();
                    }
                },
                {
                    label: "Eliminar",
                    cssClass:"btn-danger",
                    action: function(dialogRef){
                        var button = this;
                        button.spin();
                        button.disable();
                        tree.deleteAdminUnit();
                        dialogRef.close();
                    }
                }
            ],
            onshown: function(dialogRef){
                
            },
            onclose: function(dialogRef){
                
            }
        });
        },
        deleteAdminUnit: function(){
            var status = 0;
            
            var activeNode = $('#adminUnitTree').dynatree('getActiveNode');

            if(typeof activeNode !== 'object')
                return Advertencia("Debe seleccionar una Unidad Administrativa");
            
            if(parseInt(activeNode.data.key) === 0)
                return Advertencia("Debe seleccionar una Unidad Administrativa");
            
            var xml = "<delete version='1.0' encoding='UTF-8'>";        
            
            xml+= "<administrativeUnit>\n\
                        <idAdminUnit>"+activeNode.data.key+"</idAdminUnit>\n\
                   </administrativeUnit>";
            
            var children = activeNode.getChildren();
            if(children !== null)
                for(var cont = 0; cont < children.length; cont++){
                    var child = children[cont];
                    
                    xml+= "<administrativeUnit>\n\
                                <idAdminUnit>"+child.data.key+"</idAdminUnit>\n\
                           </administrativeUnit>";
                    
                    var areaChildren = children[cont].getChildren();
                    if(areaChildren !== null)
                        children = children.concat(areaChildren);
                }
            
            xml+= "</delete>";
                      

            $.ajax({
            async: false, 
            cache: false,
            dataType: "html", 
            type: 'POST',   
            url: "Modules/php/AdministrativeUnit.php",
            data: {option: "deleteAdminUnit", xml:xml}, 
            success:  function(xml)
            {           
                if($.parseXML( xml )===null){errorMessage(xml); return 0;}else xml=$.parseXML( xml );
                
                $(xml).find('adminUnitDeleted').each(function(){
                    status = 1;
                    activeNode.remove();
                });

                $(xml).find("Error").each(function()
                {
                    var mensaje=$(this).find("Mensaje").text();
                    errorMessage(mensaje);
                });                 

            },
            beforeSend:function(){},
            error: function(jqXHR, textStatus, errorThrown){errorMessage(textStatus +"<br>"+ errorThrown);}
            });   
            
            return status;
        },
        newAdminUnit: function(){
        
            var activeNode = $('#adminUnitTree').dynatree('getActiveNode');

            if(typeof activeNode !== 'object')
                return Advertencia("Debe seleccionar al menos el elemento Raíz");

            var content = $('<div>');
            var formGroup = $('<div>',{class:"form-group"});
            var nameLabel = $('<label>').append("Nombre");
            var nameForm = $('<input>',{class:"form-control", id:"adminUnitName"});
            formGroup.append(nameLabel);
            formGroup.append(nameForm);
            content.append(formGroup);

            formGroup = $('<div>',{class:"form-group"});
            var descriptionLabel = $('<label>').append("Descripción");
            var descriptionForm = $('<input>',{class:"form-control", id:"adminUnitDescription"});
            formGroup.append(descriptionLabel);
            formGroup.append(descriptionForm);
            content.append(formGroup);

            var dialog = BootstrapDialog.show({
                title: 'Nueva Unidad Administrativa',
                size: BootstrapDialog.SIZE_SMALL,
                type:BootstrapDialog.TYPE_PRIMARY,
                message: content,
                closable: true,
                buttons: [
                    {
                        label:"Cancelar",
                        action: function(dialogRef){
                            dialogRef.close();
                        }
                    },
                    {
                        label:"Agregar",
                        cssClass: "btn-primary",
                        action: function(dialogRef){
                            var button = this;             
                            button.spin();
                            button.disable();

                            if(tree.addNewAdminUnit(activeNode))
                                dialogRef.close();

                            button.stopSpin();
                            button.enable();
                        }
                    }

                ],
                onshown: function(dialogRef){
                    nameForm.focus();
                },
                onclose: function(dialogRef){

                }
            });
        },
        addNewAdminUnit: function(activeNode){
            var status = 0;
            var name = $.trim($('#adminUnitName').val());
            var description = $.trim($('#adminUnitDescription').val());
            var idParent = activeNode.data.key;

            if(String(name).length === 0)
                return Advertencia("El campo <b>Nombre</b> es obligatorio");

            $.ajax({
            async: false, 
            cache: false,
            dataType: "html", 
            type: 'POST',   
            url: "Modules/php/AdministrativeUnit.php",
            data: {option: "addNewAdminUnit", name:name, description:description, idParent:idParent}, 
            success:  function(xml)
            {           
                if($.parseXML( xml )===null){errorMessage(xml); return 0;}else xml=$.parseXML( xml );

                $(xml).find('newAdminUnitAdded').each(function(){
                    var idAdminUnit = $(this).find('idAdminUnit').text();
                    if(parseInt(idAdminUnit) > 0){
                        status = 1;
                        var child = activeNode.addChild({
                            title:name,
                            key:idAdminUnit,
                            description:description,
                            isFolder:true,
                            expand: true,
                            icon: "/img/archival/department.png"
                        });

                        child.activate(true);
                    }
                });

                $(xml).find("Error").each(function()
                {
                    var mensaje=$(this).find("Mensaje").text();
                    errorMessage(mensaje);
                });                 

            },
            beforeSend:function(){},
            error: function(jqXHR, textStatus, errorThrown){errorMessage(textStatus +"<br>"+ errorThrown);}
            });    

            return status;

        }
    };
   
   /**
    * @description Objeto con las funciones necesarias para ligar a Serie con unidades administrativas.
    * @type type
    */
   var serie = {
       getSeriesStructure: function(){
           var series = null;
           
           $.ajax({
            async: false, 
            cache: false,
            dataType: "html", 
            type: 'POST',   
            url: "Modules/php/AdministrativeUnit.php",
            data: {option: "getSeriesStructure"}, 
            success:  function(xml)
            {           
                if($.parseXML( xml )===null){errorMessage(xml); return 0;}else xml=$.parseXML( xml );

                if($(xml).find("serie").length > 0)
                    series = xml;
                    
                $(xml).find("Error").each(function()
                {
                    var mensaje=$(this).find("Mensaje").text();
                    errorMessage(mensaje);
                });                 
            },
            beforeSend:function(){},
            error: function(jqXHR, textStatus, errorThrown){errorMessage(textStatus +"<br>"+ errorThrown);}
            });    
            
            return series;
       },
       buildTree: function(series){
           var serieRoot = $('#adminUnitSerie').dynatree('getTree').getNodeByKey('0');
                
            if(typeof serieRoot !== 'object')
                return errorMessage("No fué posible obtener la raíz de la estructura <b>Serie</b>");

           $(series).find('serie').each(function(){
               var serie = $(this);
               var idDocDisposition = $(serie).find('idDocumentaryDisposition').text();
               var name = $(serie).find('Name').text();
               var description = $(serie).find('Description').text();
               var key = $(serie).find('NameKey').text();
               var idAdminUnit_DocDisposition = $(serie).find('idAdminUnit_DocDisposition').text();
               var idAdminUnit = $(serie).find('idAdminUnit').text();
               var adminUnitName = $(serie).find('adminUnitName').text();
               var idUserGroup = $(serie).find('idUserGroup').text();
               var userGroupName = $(serie).find('userGroupName').text();
               
               var serieChild = serieRoot.addChild({
                    title: name,
                    key: idDocDisposition,
                    nameKey: key,
                    description: description,
                    isFolder:true,
                    expand: true,
                    icon: "/img/archival/serie.png",
                    type:"serie"
               });
               
               if(parseInt(idAdminUnit) > 0){
                   var adminUnitChild = serieChild.addChild({
                        title: adminUnitName,
                        key: idAdminUnit,
                        isFolder:true,
                        expand: true,
                        icon: "/img/archival/department.png",
                        type:"adminUnit"
                   });
               }
               
           });
       },
       mergeAdminUnitInterface: function(){
           
           var serieTree = $('#adminUnitSerie').dynatree('getActiveNode');
           var idSerie = serieTree.data.key;
           
           if(!parseInt(idSerie) > 0)
               return 0;
           
           var content = $('<div>');
           
           var formGroup = $('<div>',{class: "form-group"});
           var adminUnitNameLabel = $('<label>',{}).append("Unidad Administrativa");
           var adminUnitNameSelect = $('<select>', {class: "form-control", id: "adminUnitNameMerge"});
           
           formGroup.append(adminUnitNameLabel);
           formGroup.append(adminUnitNameSelect);
           
           content.append(formGroup);
           
            BootstrapDialog.show({
                title: 'Unificar con Unidad Administrativa',
                size: BootstrapDialog.SIZE_SMALL,
                message: content,
                buttons: [
                    {
                        label: 'Cerrar',
                        action: function(dialogRef){
                            dialogRef.close();
                        }
                    },
                    {
                        label: 'Unificar',
                        cssClass:"btn-primary",
                        action: function(dialogRef){                    
                            var button = this;
                            button.spin();
                            button.disable();
                            
                            if(serie.mergeAdminUnitAndSerie())
                                dialogRef.close();
                            
                            button.stopSpin();
                            button.enable();
                        }
                    }
                ],
                onshown: function(dialogRef){
                    var adminUnit = tree.getTreeStructure();
                    
                    if(!typeof adminUnit === 'object')
                        return 0;                 
                    
                    $(adminUnit).find('area').each(function(){
                        var idAdminUnit = $(this).find('idAdminUnit').text();
                        var name = $(this).find('Name').text();
                        var description = $(this).find('Description').text();
                        var idParent = $(this).find('idParent').text();
                        var nameKey = $(this).find('NameKey').text();
                        
                        var option = $('<option>', {id: idAdminUnit, nameKey:nameKey, name:name}).append(name);
                        adminUnitNameSelect.append(option);
                    });
                    
                    if($('#adminUnitNameMerge option').size() === 0)
                        return Advertencia("<p>No existen <b>Unidades Administrativas</b></p>");
                    
                }
            });
       },
        mergeAdminUnitAndSerie: function(){         
            var status = 0;
            var adminUnitNameSelect = $('#adminUnitNameMerge option:selected');
            var idAdminUnit = parseInt(adminUnitNameSelect.attr('id'));
            var name = adminUnitNameSelect.attr('name');
            var nameKey = adminUnitNameSelect.attr('nameKey');
            
            var activeNode = $('#adminUnitSerie').dynatree('getActiveNode');
           
            if(typeof activeNode !== 'object')
                return errorMessage("<p>No fué posible obtener la serie activa</p>");
           
            if(!idAdminUnit > 0)
                return Advertencia("Debe seleccionar una Unidad Administrativa");
           
            var idSerie = activeNode.data.key;
           
            $.ajax({
                async: false, 
                cache: false,
                dataType: "html", 
                type: 'POST',   
                url: "Modules/php/AdministrativeUnit.php",
                data: {option: "mergeAdminUnitAndSerie", idAdminUnit:idAdminUnit, idSerie:idSerie},
                success:  function(xml){           

                    if($.parseXML( xml )===null){errorMessage(xml); return 0;}else xml=$.parseXML( xml );

                    if($(xml).find("doneMerge").length > 0){                  
                        status = 1;

                        var child = activeNode.addChild({
                            title: name,
                            key: idAdminUnit,
                            nameKey: nameKey,
                            isFolder:true,
                            expand: true,
                            icon: "/img/archival/department.png",
                            type: "administrativeUnit"
                        });
                        
                        child.activate(true);
                    }

                    $(xml).find("Error").each(function()
                    {
                        var mensaje=$(this).find("Mensaje").text();
                        errorMessage(mensaje);
                    });                 
                },
                beforeSend:function(){},
                error: function(jqXHR, textStatus, errorThrown){
                    errorMessage(textStatus +"<br>"+ errorThrown);
                }
            });    
            
            return status;
       },
       removeMergeOfAdminUnit: function(){
           
       }
   };
   
};