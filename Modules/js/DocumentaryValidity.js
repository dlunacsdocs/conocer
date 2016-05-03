
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
    var legalFoundationDT;
    var legalFoundationdT;
    var legalFoundationData = null;
   
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
        thead = $('<thead>').append('\
            <tr>\n\
                <th columnName = "NameKey">Clave Serie</th>         \n\
                <th columnName = "Description">Descripción</th>     \n\
                <th columnName = "Administrativo">A</th>            \n\
                <th columnName = "Legal">L</th>                     \n\
                <th columnName = "Fiscal">F</th>                    \n\
                <th columnName = "Informativo">I</th>               \n\
                <th columnName = "Testimonial">T</th>               \n\
                <th columnName = "Evidencial">E</th>                \n\
                <th columnName = "ArchivoTramite">AT</th>           \n\
                <th columnName = "ArchivoConcentracion">AC</th>     \n\
                <th columnName = "ArchivoDesconcentracion">AD</th>  \n\
                <th columnName = "Total">TOT</th>                   \n\
                <th columnName = "AnosHistorico">AH</th>            \n\
                <th columnName = "SolicitudInformacion">SI</th>     \n\
                <th columnName = "idLegalFoundation">FL</th>        \n\
                <th columnName = "Eliminacion">E</th>               \n\
                <th columnName = "Concentracion">C</th>             \n\
                <th columnName = "Muestreo">M</th>                  \n\
                <th columnName = "Publica">P</th>                   \n\
                <th columnName = "Reservada">R</th>                 \n\
                <th columnName = "Confidencial">C</th>              \n\
                <th columnName = "Mixta">M</th>                     \n\
                <th columnName = "ParcialmenteReservada">PR</th>    \n\
                <th class = "TotalExpedientes">TE</th>              \n\
            </tr>');
        
        serieTable.append(thead);
        
        fondoDiv.append("<br>").append(fondoTable);
        sectionDiv.append("<br>").append(sectionTable);
        serieDiv.append("<br>").append(serieTable);
        
        var dialog = BootstrapDialog.show({
            title: 'Vigencia Documental',
            size: BootstrapDialog.SIZE_WIDE,
            type:BootstrapDialog.TYPE_PRIMARY,
            message: tabbable,
            closable: true,
            buttons: [

            ],
            onshown: function(dialogRef){
                _buildTablesIntoInterface(dialogRef);
                var schema  = _getStructureScheme();
                                
                if(typeof schema === 'object'){
                    _setDataIntoTables(schema);
                    _setTotal();
                }
                                
                serieTableDT.$('.legalFoundationBtn').click(function(){
                    _openLegalFoundationInterface($(serieTableDT.$('.legalFoundationBtn')).index($(this)));
                });
                
                serieTableDT.$('td.legalFoundationTr').mouseover(function(){
                    $(this).find('.btn').css({"display": ""});
                });
                
                serieTableDT.$('td.legalFoundationTr').mouseout(function(){
                    $(this).find('.btn').css({"display": "none"});
                });
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
            "sDom": 'Tfrtlip',
            "bInfo":false, "autoWidth" : false, "oLanguage":LanguajeDataTable,
            "tableTools": {
                "aButtons": [
//                    {"sExtends":"text", "sButtonText": "Boton", "fnClick" :function(){}},
                    {
                        "sExtends":    "collection",
                        "sButtonText": '<i class="fa fa-floppy-o fa-lg"></i>',
                        "aButtons":    [ "csv", "xls", "pdf", "copy" ]
                    }                          
                ]
            }                              
        });  

        fondoTableDT = new $.fn.dataTable.Api('#fondoTable');
        
        sectionTabledT = $('#sectionTable').dataTable(
        {
            "sDom": 'Tfrtlip',
            "bInfo":false, "autoWidth" : false, "oLanguage":LanguajeDataTable,
            "tableTools": {
                "aButtons": [
//                    {"sExtends":"text", "sButtonText": "Boton", "fnClick" :function(){}},
                    {
                        "sExtends":    "collection",
                        "sButtonText": '<i class="fa fa-floppy-o fa-lg"></i>',
                        "aButtons":    [ "csv", "xls", "pdf", "copy" ]
                    }                          
                ]
            }                              
        });  

        sectionTableDT = new $.fn.dataTable.Api('#sectionTable');
    
        serieTabledT = $('#serieTable').dataTable(
        {
            "sDom": 'Tfrtlip',
            "bInfo":false, "autoWidth" : false, "oLanguage":LanguajeDataTable,
            "tableTools": {
                "aButtons": [
//                    {"sExtends":"text", "sButtonText": "Boton", "fnClick" :function(){}},
                    {
                        "sExtends":    "collection",
                        "sButtonText": '<i class="fa fa-floppy-o fa-lg"></i>',
                        "aButtons":    [ "csv", "xls", "pdf", "copy", "print" ]
                    }                          
                ]
            },
            "fnCreatedRow": function( nRow, aData, iDataIndex ) {
                editingSerieRow(nRow);    /* Función que se invoca para editar una celda de la tabla catálogo */
            }
        });  

        serieTableDT = new $.fn.dataTable.Api('#serieTable');   
    };
    
    var editingSerieRow = function(nRow){
        $(nRow).children().each(function(index){
            var tr = $(this);
            var type = "text";
            var data = "";
            var onblur = "submit";
            
            if(index === 9){
                $(tr).addClass('legalFoundationTr');
//                
//                type = "select";
//                data = {11:11,10:10,9:9, 8:8, 7:7, 6:6, 5:5, 4:4, 3:3, 2:2, 1:1, "":""};
//                onblur = "submit";
            }
            
            /* No puede cambiarse la clave de la serie 
             * No puede editarse el total de expedientes*/
            if(index > 1 && index !== 23 && index !== 11 && index !== 14)   
                $(this).editable( '../Modules/php/DocumentaryValidity.php', {                  
                    tooltip   : 'Click para editar...',
                    name:"value",
                    method: "POST", 
                    type: type,
                    onblur:onblur,
                    indicator: "Almacenando....",
                    data:data,
                    submitdata: {
                        option: "modifyColumnOfDocValidity",
                        idDocValidity: function(){
                            return tr.parent().attr('idDocValidity'); 
                        },
                        columName: function(){
                            var header = serieTableDT.column( index ).header();
//                            console.log(header);
                            return $(header).attr('columnName');
                        }
                    },
                    onsubmit: function(settings, original){
                        var newVal;
                        
                        if(type === 'text')
                            newVal = $('input',this).val();
                        
                        if(type === 'select')
                            newVal = $('select',this).val();
//                        console.log(newVal);
//                        console.log(original.revert);
                        if(newVal === undefined){
                            Advertencia("No fué posible obtener el nuevo valor");
                            return false;
                        }
                      
                        if(isNaN(newVal)){
                            Advertencia("Debe ingresar un tipo de dato numérico");   
                            original.reset();
                            return false;
                        }
                        
                        if(newVal > 999){
                            Advertencia("El tipo de dato sobrepasa el rango soportado");
                            original.reset();
                            return false;
                        }
                        
                        if(newVal < 0){
                            Advertencia("No puede ser negativo");
                            original.reset();
                            return false;
                        }
                        
                        if (original.revert === $('input',this).val()) {
                            original.reset();
                            return false;
                        }
                        
                        if (original.revert === $('select',this).val()) {
                            original.reset();
                            return false;
                        }
                    },
                    placeholder: "",
                    "height": "25px",
                    "width": "100%",
                    "callback": function( sValue, y ) {   
                        var position = serieTabledT.fnGetPosition($(tr)[0]);
                        serieTabledT.fnUpdate([sValue], position, index, false);
                        _setTotal();
                    }
                } );
        }); 
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
        var informativo = $(serie).find("Informativo").text();
        var testimonial = $(serie).find('Testimonial').text();
        var evidencial = $(serie).find('Evidencial').text();       
        var archivoTramite = $(serie).find('ArchivoTramite').text();
        var archivoConcentracion = $(serie).find('ArchivoConcentracion').text();
        var archivoDesconcentracion = $(serie).find('ArchivoDesconcentracion').text();
        var total = $(serie).find('Total').text();
        var anosHistorico = $(serie).find('AnosHistorico').text();
        var solicitudInformacion = $(serie).find('AnosInformacion').text();
        var foundationKey = $(serie).find('FoundationKey').text();
        var eliminacion = $(serie).find('Eliminacion').text();
        var concentracion = $(serie).find('Concentracion').text();
        var muestreo = $(serie).find('Muestreo').text();
        var publica = $(serie).find('Publica').text();
        var reservada = $(serie).find('Reservada').text();
        var confidencial = $(serie).find('Confidencial').text();
        var mixta = $(serie).find('Mixta').text();
        var parcialmenteReservada = $(serie).find('ParcialmenteReservada').text();
        var totalExpedientes = $(serie).find('TotalExpedientes').text();
        
        if(String(foundationKey).length === 0)
            foundationKey = '<a class = "btn btn-default legalFoundationBtn" style = "display:none"><li class = "fa fa-eye fa-lg"></li></a>';
        else
            foundationKey = foundationKey +' <a class = "btn btn-default legalFoundationBtn" style = "display:none"><li class = "fa fa-eye fa-lg"></li></a>';

                
        data = [
            nameKey, 
            description, 
            administrativo, 
            legal, 
            fiscal, 
            informativo,
            testimonial,
            evidencial,
            archivoTramite,
            archivoConcentracion, 
            archivoDesconcentracion, 
            total,
            anosHistorico, 
            solicitudInformacion, 
            foundationKey, 
            eliminacion,
            concentracion, 
            muestreo, 
            publica, 
            reservada, 
            confidencial, 
            mixta,
            parcialmenteReservada,
            totalExpedientes
        ];
            
        var ai = serieTableDT.row.add(data).draw();
        var n = serieTabledT.fnSettings().aoData[ ai[0] ].nTr;
        n.setAttribute('idDocDisposition',idDocDisposition);
        n.setAttribute('idDocValidity',idDocValidity);

    };
         
    var _setTotal = function(){
        var atColumn = serieTableDT.column(8).data();
        var acColumn = serieTableDT.column(9).data();
        var adColumn = serieTableDT.column(10).data();
        console.log(serieTableDT.rows().nodes());
        var trArray = serieTableDT.rows().nodes();
        for(var cont = 0; cont < trArray.length; cont++){
            var atValue = atColumn[cont];
            var acValue = acColumn[cont];
            var adValue = adColumn[cont];
            var rowTotal = 0;           
//            var tr = serieTabledT.find('tr')[cont+1];
            var tr = trArray[cont];
            console.log("atValue: " + atValue + " acValue: " + acValue + "adValue: " +adValue);
            if(isNaN(atValue) === false && isNaN(acValue) === false && isNaN(adValue) === false){
                rowTotal = parseInt(atValue) + parseInt(acValue) + parseInt(adValue);
                console.log("Sumando: " + rowTotal);
                console.log(tr);
                if(tr !== undefined)
                    serieTabledT.fnUpdate([rowTotal],tr,11, true);   
            }
            else
                console.log("No fue posible obtener el total");
           
        }
    };  
    
    var _openLegalFoundationInterface = function(indexRow){
        var legalFoundation = new LegalFoundation();
        legalFoundationData = legalFoundation.getLegalFoundationData();
                
        var content = $('<div>');
        var table = $('<table>', {class:"table table-striped table-bordered table-hover table-condensed display hover", id:"legalFoundationTable"});
        var thead = $('<thead>').append('<tr><th columnName = "FoundationKey">Clave</th><th columnName = "Description">Descripción</th></tr>');
        table.append(thead);
        
        content.append(table);
        
        BootstrapDialog.show({
            title: 'Fundamento Legal',
            size: BootstrapDialog.SIZE_NORMAL,
            type:BootstrapDialog.TYPE_PRIMARY,
            message: content,
            closable: true,
            buttons: [
                {
                    label: 'Agregar',
                    icon: 'fa fa-plus-circle fa-lg',
                    cssClass: 'btn btn-primary',
                    action: function(dialogRef){       
                        var button = this;
                        button.spin();
                        dialogRef.setClosable(false);
                        dialogRef.enableButtons(false);
                        var seriePosition = serieTableDT.$('tr').get(indexRow);
                        var idDocValidity = $(seriePosition).attr('iddocvalidity');

                        $('#legalFoundationTable tr.selected').each(function () {                         
                            var position = legalFoundationdT.fnGetPosition($(this)[0]);
                            var foundationKey = legalFoundationdT.fnGetData(position)[0] + 
                                    ' <a class = "btn btn-default legalFoundationBtn" style = "display:none">\n\
                                        <li class = "fa fa-eye fa-lg"></li>\n\
                                    </a>';
                            var idLegalFoundation = $(this).attr('id');

                            if (!parseInt(idLegalFoundation) > 0)
                                return 0;
                            
                            serieTabledT.fnUpdate([foundationKey], seriePosition, 9, true);
                
                            if(setLegalFoundation(idLegalFoundation, idDocValidity)){        
                                dialogRef.close();
                            }
                            else{
                                button.stopSpin();
                                dialogRef.enableButtons(true);
                                dialogRef.setClosable(true);
                            }
                                            
                        });
                        
                    }
                },
                {
                    label: 'Cerrar',
                    action: function(dialogRef){
                        dialogRef.close();
                    }
                }
            ],
            onshown: function(dialogRef){
                legalFoundationdT = $('#legalFoundationTable').dataTable(
                {
                    "sDom": 'Tfrtlip',
                    "bInfo":false, "autoWidth" : false, "oLanguage":LanguajeDataTable,
                    "tableTools": {
                        "aButtons": [
                            {"sExtends":"text", "sButtonText": '<li class = "fa fa-plus-circle" fa-lg></li> Fundamento Legal', 
                                "fnClick" :function(){
                                    legalFoundation.newRegisterInterface(legalFoundationdT, legalFoundationDT);
                                }
                            },
                            {
                                "sExtends":    "collection",
                                "sButtonText": '<i class="fa fa-floppy-o fa-lg"></i>',
                                "aButtons":    [ "csv", "xls", "pdf", "copy" ]
                            }                          
                        ]
                    }
                });  

                legalFoundationDT = new $.fn.dataTable.Api('#legalFoundationTable');
                
                $('#legalFoundationTable tbody').on('click', 'tr', function () {
                    if ($(this).hasClass('selected'))
                        $(this).removeClass('selected');
                    else {
                        legalFoundationdT.$('tr.selected').removeClass('selected');
                        $(this).addClass('selected');
                    }
                });
                
                $(legalFoundationData).find('register').each(function(){
                    var idLegalFoundation = $(this).find('idLegalFoundation').text();
                    var key = $(this).find('FoundationKey').text();
                    var description = $(this).find('Description').text();
                    var ai = legalFoundationDT.row.add([key, description]).draw();
                    var n = legalFoundationdT.fnSettings().aoData[ ai[0] ].nTr;

                    n.setAttribute('id',idLegalFoundation);
                });
                
            },
            onhidden: function(dialogRef){
                legalFoundationDT = null;
                legalFoundationdT = null;
      
            }
        });
        
    };
    
    /**
     * @description Asocia un fundamento legal seleccionado a la validez documental.
     * @param {type} idLegalFoundation
     * @param {type} idDocumentValidity
     * @returns {Number}
     */
    var setLegalFoundation = function(idLegalFoundation, idDocumentValidity){
        var status = 0;
        
        $.ajax({
        async: false, 
        cache: false,
        dataType: "html", 
        type: 'POST',   
        url: "Modules/php/DocumentaryValidity.php",
        data: {option: "setLegalFoundation", idLegalFoundation:idLegalFoundation, idDocumentValidity:idDocumentValidity}, 
        success:  function(xml)
        {           
            if($.parseXML( xml )===null)
                return errorMessage(xml); 
            else 
                xml = $.parseXML( xml );
            
            $(xml).find('settledLegalFoundation').each(function(){
                status = 1;
                var message = $(this).find('Mensaje').text();
                Notificacion(message);
                
                serieTableDT.$('.legalFoundationBtn').unbind('click').click(function(){
                    var click = $(this);
                    var index = $(serieTableDT.$('.legalFoundationBtn')).index(click);
                    _openLegalFoundationInterface(index);
                });
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
    };
    
};
