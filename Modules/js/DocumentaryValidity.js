
/* global BootstrapDialog, LanguajeDataTable */

var DocumentaryValidity = function(){
    var self = this;
    var panelBody;
    var fondoTabledT;
    var fondoTableDT;
    var sectionTabledT;
    var sectionTableDT;
    var serieTabledT;
    var serieTableDT;
    
    _buildInterface = function(){
        var panel = $('<div>', {});
        
        var fondoTable = $('<table>',{class:"table table-striped table-bordered table-hover table-condensed display hover", id: "fondoTable"});
        var thead = $('<thead>').append('<tr><th>Clave Fondo</th><th>Descripción</th></tr>');
        fondoTable.append(thead);
        
        var sectionTable = $('<table>',{class:"table table-striped table-bordered table-hover table-condensed display hover", id: "sectionTable"});
        thead = $('<thead>').append('<tr><th>Clave Sección</th><th>Descripción</th></tr>');
        sectionTable.append(thead);
        
        var serieTable = $('<table>',{class:"table table-striped table-bordered table-hover table-condensed display hover", id: "serieTable"});
        thead = $('<thead>').append('<tr><th>Clave Serie</th><th>Descripción</th></tr>');
        serieTable.append(thead);
        
        panel.append(fondoTable);
        panel.append(sectionTable);
        panel.append(serieTable);
        
        var dialog = BootstrapDialog.show({
            title: 'Validez Documental',
            size: BootstrapDialog.SIZE_WIDE,
            type:BootstrapDialog.TYPE_PRIMARY,
            message: panel,
            closable: false,
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
                        
                    }
                }
            ],
            onshown: function(dialogRef){
                _setTablesIntoInterface(dialogRef);
                var schema  = _getStructureScheme();
                                
                if(typeof schema === 'object')
                    _buildSchema(schema);
            },
            onshow: function(dialogRef){
                
                
            }
        });
        
        self.panelBody = dialog;
    };
    
    _setTablesIntoInterface = function(dialogRef){     
        
        self.fondoTabledT = $('#fondoTable').dataTable(
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

        self.fondoTableDT = new $.fn.dataTable.Api('#fondoTable');
        
        self.sectionTabledT = $('#sectionTable').dataTable(
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

        self.sectionTableDT = new $.fn.dataTable.Api('#sectionTable');
        
        self.serieTabledT = $('#serieTable').dataTable(
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

        self.serieTableDT = new $.fn.dataTable.Api('#serieTable');
    };
            
    _getStructureScheme = function(){
        
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
    
    _buildSchema = function(xml){
        console.log(xml);
    };
            
};


DocumentaryValidity.prototype.setActionToLinkDocumentaryValidity = function(){
    $('.LinkDocumentaryValidity').click(function(){
        _buildInterface();
    });
};
