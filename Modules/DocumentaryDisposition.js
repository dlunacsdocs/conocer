/* global BootstrapDialog */

var DocumentaryDispositionClass = function(){
    
    _addOption = function(){
        var optionName = $('#documentaryDispositionButton').attr('optionName');
        
        BootstrapDialog.show({
            title: 'Agregando '+optionName,
            size: BootstrapDialog.SIZE_SMALL,
            message: "",
            buttons: [{
                label: 'Cerrar',
                action: function(dialogRef){
                    dialogRef.close();
                }
            },
            {
                label: 'Agregar',
                cssClass:"btn-primary",
                action: function(dialogRef){
                    window["_add"+optionName]();
                    dialogRef.close();
                }
            }
            ],
            onshown: function(dialogRef){
                
            }
        });
    };
    
    _addFondo = function(){
        alert("_addFondo");
    };
    
    _addSeccion = function(){
        alert("_addSeccion");
    };
    
    _addSerie = function(){
        alert("addSerie");
    };
    
    _buildDocumentaryDispositionConsole = function(){
        var self = this;       
        var fondoTree = $('<ul>').append('<li id = "fondoTree_0" class = "folder">Fondo');
        var sectionTree = $('<ul>').append('<li id = "sectionTree_0" class = "folder">Sección');
        var serieTree = $('<ul>').append('<li id = "serieTree_0" class = "folder">Serie');
        
        var tabbable = $('<div>',{id:"documentaryDispositionNavTab"});
        
        var navTab = $('<ul>', {class:"nav nav-tabs"});
        
        var fondoLi = $('<li>', {class:"active"}).append('<a href="#fondoDiv" optionName = "Fondo" data-toggle="tab">Fondo</a>');
        var sectionLi = $('<li>').append('<a href="#sectionDiv" optionName = "Seccion" data-toggle="tab">Sección</a>');
        var serieLi = $('<li>').append('<a href="#serieDiv" optionName = "Serie" data-toggle="tab">Serie</a>');
        
        var fondoDiv = $('<div>',{id:"fondoDiv", class:"tab-pane active"}).append(fondoTree);;
        var sectionDiv = $('<div>',{id: "sectionDiv", class:"tab-pane"}).append(sectionTree);
        var serieDiv = $('<div>',{id: "serieDiv", class:"tab-pane"}).append(serieTree);
        
        var tabContent = $('<div>', {class:"tab-content"});
        
        tabContent.append(fondoDiv);
        tabContent.append(sectionDiv);
        tabContent.append(serieDiv);
        
        navTab.append(fondoLi);
        navTab.append(sectionLi);
        navTab.append(serieLi);
        
        tabbable.append(navTab);
        tabbable.append(tabContent);
        
        var button;
        BootstrapDialog.show({
            title: 'Catálogo de Disposición Documental',
            size: BootstrapDialog.SIZE_WIDE,
            message: tabbable,
            buttons: [{
                id: 'documentaryDispositionButton',
                label: 'Cerrar',
                cssClass:"btn-primary",
                action: function(dialogRef){
                    
                }
            },{
                label: "Cerrar",
                action: function(dialogRef){
                    dialogRef.close();
                }
            }
            ],
            onshown: function(dialogRef){
                $('#fondoDiv').dynatree({onActivate: function(node) {
                    alert("You activated " + node.data.key);
                }});
                $('#sectionDiv').dynatree({onActivate: function(node) {
                    alert("You activated " + node.data.key);
                }});
                $('#serieDiv').dynatree({onActivate: function(node) {
                    alert("You activated " + node.data.key);
                }});
                
                $('#documentaryDispositionNavTab .nav-tabs a').click(function (e) {
                    var optionName = $(this).attr('optionName');
                    $('#documentaryDispositionButton').html("Agregar "+optionName);    /* Cambio Nombre Botón */
                    $('#documentaryDispositionButton').attr({"optionName":optionName});
//                    alert($($(this).attr('href')).index());
               });
               
               $('#documentaryDispositionNavTab .nav-tabs a:first').click();
               
               /* Acción del Botón Agregar */
               $('#documentaryDispositionButton').click(function(){
                   _addOption();
               });
               
//               var tabIndex = $('#documentaryDispositionNavTab .nav-tabs a').attr('href').index();
            }
        });
        
        
    };
     
};

DocumentaryDispositionClass.prototype.setActionToLinkDocumentaryDispositionMenu = function(){
    var self = this;
    $('.LinkDocumentaryDisposition').click(function(){
       _buildDocumentaryDispositionConsole(); 
    });
};
