
/* global BootstrapDialog, LanguajeDataTable */

/**
 * @description Constructor de la clase DocumentaryValidity.
 * @returns {DocumentaryValidity}
 */
function DocumentaryValidity(){
    
}

/**
 * @description Clase que construye el modulo de Validez Documental.
 * @returns {DocumentaryValidity}
 */
var DocumentaryValidity = function(){
    "use strict";
    var self = this;
    var fondoTabledT;
    var fondoTableDT;
    var sectionTabledT;
    var sectionTableDT;
    var serieTabledT;
    var serieTableDT;
   
   /**
    * @description Activa la acción de abrir la interfaz de Vigencia Documental Sobre el menú de Vigencia Documental.
    * @returns {undefined}
    */
    this.setActionToLinkDocumentaryValidity = function(){
        $('.LinkDocumentaryValidity').click(function(){
            _buildInterface();
        });
    };
    
    /**
     * @description Construye la interfaz de Validez Documental.
     * @returns {undefined}
     */
   
    var _buildInterface = function(){
        
        var tabbable = $('<div>',{});
        
        var navTab = $('<ul>', {class:"nav nav-tabs"});
        
        var fondoLi = $('<li>', {class:"active"}).append('<a href="#fondoTree" optionName = "Fondo" data-toggle="tab"><span class = "archivalFondoIcon"></span> Fondo</a>');
        var sectionLi = $('<li>').append('<a href="#sectionTree" optionName = "Seccion" data-toggle="tab"><span class = "archivalSectionIcon"></span> Sección</a>');
        var serieLi = $('<li>').append('<a href="#serieTree" optionName = "Serie" data-toggle="tab"><span class = "archivalSerieIcon"></span> Serie</a>');
        
        var fondoDiv = $('<div>',{id:"fondoTree", class:"tab-pane active"});
        var sectionDiv = $('<div>',{id: "sectionTree", class:"tab-pane"});
        var serieDiv = $('<div>',{id: "serieTree", class:"tab-pane", style: "width: 100%; height:100%; overflow-x:auto;"});
        
        var tabContent = $('<div>', {class:"tab-content"});
                      
        tabContent.append(fondoDiv);
        tabContent.append(sectionDiv);
        tabContent.append(serieDiv);
        
        navTab.append(fondoLi);
        navTab.append(sectionLi);
        navTab.append(serieLi);
        
        tabbable.append(navTab);
        tabbable.append(tabContent);
                    
        var fondoTable = $('<table>',{class:"table table-striped table-bordered table-hover table-condensed display hover", id: "fondoTable"});
        var thead = $('<thead>').append('<tr><th>Clave Fondo</th><th>Descripción</th></tr>');
        fondoTable.append(thead);
        
        var sectionTable = $('<table>',{class:"table table-striped table-bordered table-hover table-condensed display hover", id: "sectionTable"});
        thead = $('<thead>').append('<tr><th>Clave Sección</th><th>Descripción</th></tr>');
        sectionTable.append(thead);
        
        var serieTable = $('<table>',{class:"table table-striped table-bordered table-hover table-condensed display hover", id: "serieTable"});
        thead = $('<thead>').append('<tr><th>Clave Serie</th><th>Descripción</th><th>A</th><th>L</th><th>F</th><th>AT</th><th>AC</th><th>AD</th><th>TOT</th><th>FL</th><th>E</th><th>C</th><th>M</th><th>P</th><th>R</th><th>C</th><th>PR</th></tr>');
        serieTable.append(thead);
        
        fondoDiv.append("<br>").append(fondoTable);
        sectionDiv.append("<br>").append(sectionTable);
        serieDiv.append("<br>").append(serieTable);
        
        var dialog = BootstrapDialog.show({
            title: 'Validez Documental',
            size: BootstrapDialog.SIZE_WIDE,
            type:BootstrapDialog.TYPE_PRIMARY,
            message: tabbable,
            closable: true,
            buttons: [

            ],
            onshown: function(dialogRef){
                _buildTablesIntoInterface(dialogRef);
                var schema  = _getStructureScheme();
                                
                if(typeof schema === 'object')
                    _setDataIntoTables(schema);
            },
            onclose: function(dialogRef){
                freeVariables();
            }
        });
        
    };
    
    var freeVariables = function(){
        fondoTabledT = undefined;
        fondoTableDT = undefined;
        sectionTabledT = undefined;
        sectionTableDT = undefined;
        serieTabledT = undefined;
        serieTableDT = undefined;
    };
    
    /**
     * @description Ingresa las tablas que almacenan los datos de Fondo, Sección y Serie.
     * @param {type} dialogRef
     * @returns {undefined}
     */
    
    var _buildTablesIntoInterface = function(dialogRef){     
        
        fondoTabledT = $('#fondoTable').dataTable(
        {
            "sDom": 'lfTrtip',
            "bInfo":false, "autoWidth" : false, "oLanguage":LanguajeDataTable,
            "tableTools": {
                "aButtons": [
                    {"sExtends":"text", "sButtonText": "Boton", "fnClick" :function(){}},
                    {
                        "sExtends":    "collection",
                        "sButtonText": "Más...",
                        "aButtons":    [ "csv", "xls", "pdf", "copy" ]
                    }                          
                ]
            }                              
        });  

        fondoTableDT = new $.fn.dataTable.Api('#fondoTable');
        
        sectionTabledT = $('#sectionTable').dataTable(
        {
            "sDom": 'lfTrtip',
            "bInfo":false, "autoWidth" : false, "oLanguage":LanguajeDataTable,
            "tableTools": {
                "aButtons": [
                    {"sExtends":"text", "sButtonText": "Boton", "fnClick" :function(){}},
                    {
                        "sExtends":    "collection",
                        "sButtonText": "Más...",
                        "aButtons":    [ "csv", "xls", "pdf", "copy" ]
                    }                          
                ]
            }                              
        });  

        sectionTableDT = new $.fn.dataTable.Api('#sectionTable');
    
        serieTabledT = $('#serieTable').dataTable(
        {
            "sDom": 'lfTrtip',
            "bInfo":false, "autoWidth" : false, "oLanguage":LanguajeDataTable,
            "tableTools": {
                "aButtons": [
                    {"sExtends":"text", "sButtonText": "Boton", "fnClick" :function(){}},
                    {
                        "sExtends":    "collection",
                        "sButtonText": "Más...",
                        "aButtons":    [ "csv", "xls", "pdf", "copy" ]
                    }                          
                ]
            }                              
        });  

        serieTableDT = new $.fn.dataTable.Api('#serieTable');
    };
    
    /**
     * @description Obtiene la estructura de catálogo de disposición documental.
     * @returns {xml|XMLDocument}
     */
    var _getStructureScheme = function(){
        
        var schema = null;
        
        $.ajax({
        async: false, 
        cache: false,
        dataType: "html", 
        type: 'POST',   
        url: "Modules/php/DocumentaryValidity.php",
        data: {option: "getStructureSchema"}, 
        success:  function(xml)
        {           
            if($.parseXML( xml )===null){errorMessage(xml); return 0;}else xml=$.parseXML( xml );
            
            schema = xml;
            
            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                errorMessage(mensaje);
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){errorMessage(textStatus +"<br>"+ errorThrown);}
        });     
        
        return schema;
    };     
    
    /**
     * @description Ingresa el total de registros y filas por Fondo, Sección y Serie.
     * @param {type} xml
     * @returns {undefined}
     */
    var _setDataIntoTables = function(xml){
        
        $(xml).find('schema').each(function(){
            var structureType = $(this).find('NodeType').text();
            
            if(String(structureType).toLowerCase() === 'fondo')
                _addFondo($(this));
            if(String(structureType).toLowerCase() === 'section')
                _addSection($(this));
            if(String(structureType).toLowerCase() === 'serie')
                _addSerie($(this));
                       
        });
        
    };
    
    /**
     * @description Agrega un fondo sobre la tabla Fondo.
     * @param {type} fondo
     * @returns {undefined}
     */
    var _addFondo = function(fondo){
        var data = [fondo.find('NameKey').text(), fondo.find('Description').text()];
        
        var ai = fondoTableDT.row.add(data).draw();
        var n = fondoTabledT.fnSettings().aoData[ ai[0] ].nTr;
        n.setAttribute('id',fondo.find('idDocumentaryDisposition').text());
    };
    
    /**
     * @description Agrega una sección sobre la tabla de secciones.
     * @param {type} section
     * @returns {undefined}
     */
    var _addSection = function(section){
        var data = [section.find('NameKey').text(), section.find('Description').text()];
        
        var ai = sectionTableDT.row.add(data).draw();
        var n = sectionTabledT.fnSettings().aoData[ ai[0] ].nTr;
        n.setAttribute('id',section.find('idDocumentaryDisposition').text());
    };
    
    /**
     * @description Agrega una serie sobre la tabla de Series.
     * @param {type} serie
     * @returns {undefined}
     */
    var _addSerie = function(serie){
        var data = [];
        
        var idDocDisposition = $(serie).find('idDocumentaryDisposition').text();
        var name = $(serie).find('Name').text();
        var nameKey = $(serie).find('NameKey').text();
        var description = $(serie).find('Description').text();
        var nodeType = $(serie).find('NodeType').text();
        var parentKey = $(serie).find('ParentKey').text();
        var idDocValidity = $(serie).find('idDocValidity').text();
        var administrativo = $(serie).find('Administrativo').text();
        var legal = $(serie).find('Legal').text();
        var fiscal = $(serie).find('Fiscal').text();
        var archivoTramite = $(serie).find('ArchivoTramite').text();
        var archivoConcentracion = $(serie).find('ArchivoConcentracion').text();
        var archivoDesconcentracion = $(serie).find('ArchivoDesconcentracion').text();
        var total = $(serie).find('Total').text();
        var foundationKey = $(serie).find('FoundationKey').text();
        var eliminacion = $(serie).find('Eliminacion').text();
        var concentracion = $(serie).find('Concentracion').text();
        var muestreo = $(serie).find('Muestreo').text();
        var publica = $(serie).find('Publica').text();
        var reservada = $(serie).find('Reservada').text();
        var confidencial = $(serie).find('Confidencial').text();
        var parcialmenteReservada = $(serie).find('ParcialmenteReservada').text();
        
        data = [nameKey, description, administrativo, legal, fiscal, archivoTramite,
        archivoConcentracion, archivoDesconcentracion, total, foundationKey, eliminacion,
        concentracion, muestreo, publica, reservada, confidencial, parcialmenteReservada];
    
        var ai = serieTableDT.row.add(data).draw();
        var n = serieTabledT.fnSettings().aoData[ ai[0] ].nTr;
        n.setAttribute('idDocDisposition',idDocDisposition);
        n.setAttribute('idDocValidity',idDocValidity);

    };
            
};
