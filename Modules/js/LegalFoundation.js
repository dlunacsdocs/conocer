/* global LanguajeDataTable, BootstrapDialog */

var LegalFoundation = function(){
    
    var legalFoundationdT;
    var legalFoundationDT;
    
    this.setActionToLink = function(){
        $('.LinkLegalFoundation').click(function(){
            _buildConsole();
        });
    };
    
    var _buildConsole = function(){
        
        var table = $('<table>', {class:"table table-striped table-bordered table-hover table-condensed display hover", id:"legalFoundationTable"});
        var thead = $('<thead>').append('<tr><th columnName = "FoundationKey">Clave</th><th columnName = "Description">Descripción</th></tr>');
        table.append(thead);
          
        var dialog = BootstrapDialog.show({
            title: 'Fundamento Legal',
            size: BootstrapDialog.SIZE_NORMAL,
            type:BootstrapDialog.TYPE_PRIMARY,
            message: table,
            closable: true,
            buttons: [

            ],
            onshown: function(dialogRef){
                buildDataTable();
                _setDataIntoTable();
            },
            onclose: function(dialogRef){
               
            }
        });
    };
    
    var buildDataTable = function(){
        
        legalFoundationdT = $('#legalFoundationTable').dataTable(
        {
            "sDom": 'lfTrtip',
            "bInfo":false, "autoWidth" : false, "oLanguage":LanguajeDataTable,
            "tableTools": {
                "aButtons": [
                    {"sExtends":"text", "sButtonText": "Agregar", "fnClick" :function(){_newRegisterInterface();}},
                    {
                        "sExtends":    "collection",
                        "sButtonText": "Más...",
                        "aButtons":    [ "csv", "xls", "pdf", "copy" ]
                    }                          
                ]
            },
            "fnCreatedRow": function( nRow, aData, iDataIndex ) {
                _editRows(nRow);    /* Función que se invoca para editar una celda de la tabla catálogo */
            }
        });  

        legalFoundationDT = new $.fn.dataTable.Api('#legalFoundationTable');
        
        
    };
    
    var _setDataIntoTable = function(){
        var legalFoundationData = getLegalFoundationData();
        
        $(legalFoundationData).find('register').each(function(){
            var idLegalFoundation = $(this).find('idLegalFoundation').text();
            var key = $(this).find('FoundationKey').text();
            var description = $(this).find('Description').text();
            var ai = legalFoundationDT.row.add([key, description]).draw();
            var n = legalFoundationdT.fnSettings().aoData[ ai[0] ].nTr;
            n.setAttribute('id',idLegalFoundation);
        });
        
    };
    
    this.getLegalFoundationData = function(){
        
        var legalFoundationData = null;
        
        $.ajax({
        async: false, 
        cache: false,
        dataType: "html", 
        type: 'POST',   
        url: "Modules/php/LegalFoundation.php",
        data: {option: "getLegalFoundationData"}, 
        success:  function(xml)
        {           
            if($.parseXML( xml )===null){errorMessage(xml); return 0;}else xml=$.parseXML( xml );
            
            if($(xml).find('register').length > 0)
                legalFoundationData = xml;
            
            $(xml).find("Error").each(function()
            {
                var mensaje=$(this).find("Mensaje").text();
                errorMessage(mensaje);
            });                 

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){errorMessage(textStatus +"<br>"+ errorThrown);}
        });     
        
        return legalFoundationData;
    };
    
    var _editRows = function(nRow){
        $(nRow).children().each(function(index){
            var tr = $(this);
            var type = "text";
            var data = "";
            var onblur = "submit";

                $(this).editable( '../Modules/php/LegalFoundation.php', {                  
                    tooltip   : 'Click para editar...',
                    name:"value",
                    method: "POST", 
                    type: type,
                    onblur:onblur,
                    indicator: "Almacenando....",
                    data:data,
                    submitdata: {
                        option: "modifyRegister",
                        idLegalFoundation: function(){
                            return tr.parent().attr('id'); 
                        },
                        columName: function(){
                            var header = legalFoundationDT.column( index ).header();
                            console.log(header);
                            return $(header).attr('columnName');
                        }
                    },
                    onsubmit: function(settings, original){
                        var newVal = $('input',this).val();

                        if(newVal === undefined){
                            Advertencia("No fué posible obtener el nuevo valor");
                            return false;
                        }                      
                        
                        /* Cuando el valor no cambia */
                        if (original.revert === $('input',this).val()) {
                            original.reset();
                            return false;
                        }
                    },
                    placeholder: "",
                    "height": "25px",
                    "width": "100%",
                    "callback": function( sValue, y ) {       
                        legalFoundationdT.fnDraw();
                    }
                } );
        }); 
    };
    
    var _newRegisterInterface = function(){
        var content = $('<div>');
        var formGroup = $('<div>',{class:"form-group"});
        var keyArial = $('<label>').append("Clave");
        var keyForm = $('<input>',{class:"form-control", id:"foundationKeyForm"});
        
        formGroup.append(keyArial);
        formGroup.append(keyForm);
        content.append(formGroup);
        
        formGroup = $('<div>',{class:"form-group"});
        var descArial = $('<label>').append("Descripción");
        var descriptionForm = $('<input>',{class:"form-control", id:"descriptionForm"});
        formGroup.append(descArial);
        formGroup.append(descriptionForm);
        content.append(formGroup);
        
        
        var dialog = BootstrapDialog.show({
            title: 'Nuevo',
            size: BootstrapDialog.SIZE_SMALL,
            type:BootstrapDialog.TYPE_INFO,
            message: content,
            closable: true,
            buttons: [
                {
                    label: "Cancelar",
                    action:function(dialogRef){
                        dialogRef.close();
                    }
                },
                {
                    label: "Agregar",
                    action:function(dialogRef){
                        var button = this;
                        button.spin();
                        
                        if(_addNewRegister() === 1)
                            dialogRef.close();
                        
                        button.stopSpin();
                        
                    }
                }
            ],
            onshown: function(dialogRef){
                
            },
            onclose: function(dialogRef){
               
            }
        });
    };
    
    var _addNewRegister = function(){
        var status = 0;
        var key = $('#foundationKeyForm').val();
        var description = $('#descriptionForm').val();
        
        key = String($.trim(key));
        
        if(key.length === 0)
            return Advertencia("Debe ingresar una clave");
        
        if(key.length > 15)
            return Advertencia("La clave es demasiado larga. Debe ser menor a 16 caracteres.");
        
        $.ajax({
        async: false, 
        cache: false,
        dataType: "html", 
        type: 'POST',   
        url: "Modules/php/LegalFoundation.php",
        data: {option: "addNewRegister", key:key, description:description}, 
        success:  function(xml)
        {           
            if($.parseXML( xml )===null){errorMessage(xml); return 0;}else xml=$.parseXML( xml );
            
            $(xml).find('registerAdded').each(function(){
                var idLegalFoundation = $(this).find('idLegalFoundation').text();
                var message = $(this).find('message').text();
                var ai = legalFoundationDT.row.add([key, description]).draw();
                var n = legalFoundationdT.fnSettings().aoData[ ai[0] ].nTr;
                n.setAttribute('id',idLegalFoundation);
                status = 1;
                Notificacion(message);
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

