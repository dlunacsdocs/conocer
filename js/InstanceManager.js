/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global DimensionsDialogMetadatas, ConsoleSettings, EnvironmentData, InstanceManager, LanguajeDataTable */
var instancesTableDetaildT, instancesTableDetailDT;
$(document).ready(function(){
    $('.LinkInstancesManager').click(function(){
        InstanceManager.buildManager();
    });
    
});

var ClassInstanceManager = function(){
    var self = this;
    /* Genera interfaz para agregar una nueva instancia en el espacio de trabajo WS */
    _newInstanceInterface = function(){
        $('#WSInstance').empty();
        $('#WSInstance').append('<div class = "titulo_ventana">Nueva Instancia</div>');
        $('#WSInstance').append('\
                 <div class = "form-inline">\n\
                    <div class = "form-group has-feedback text-muted">\n\
                         Nombre \n\
                        <input type = "text" class = "form-control" id = "newInstanceName" placeholder = "Nombre instancia">\n\
                    </div>\n\
                </div>\n\
                <br><br>\n\
            <p class = "well">Una instancia es un ambiente reservado y aislado dentro de su equipo NAS el cual podrá administrar \n\
            con nuevas empresas y repositorios para el almacenamiento y distribución de sus documentos.</p>\n\
        ');
        _addNewInstanceButtons();
    };
    
    _checkNewInstanceName = function(){
        var validator = new ClassFieldsValidator();
        var instanceName = $('#newInstanceName').val();
        instanceName = $.trim(instanceName);
        var find = ' ';
        var re = new RegExp(find, 'g');
        instanceName = instanceName.replace(re, '_');
        var regularExpression = /^([A-Za-z0-9 _]+$)/g;       /* Comprueba validez del nombre de la intancia */
        var patt = RegExp(regularExpression);
        var testResult = null;
        
        if(instanceName.length < 4){
            $('#newInstanceName').attr("title", "El nombre de la instancia debe ser amyor a 4 caracteres.");
            validator.AddClassRequiredActive($('#newInstanceName'));
            return false;
        }
        else
        {
            $('#newInstanceName').attr("title", "");
            validator.RemoveClassRequiredActive($('#newInstanceName'));
        }
        
        testResult = patt.test(instanceName);
        
        console.log("resultado de test:: "+testResult+" "+instanceName);
        
        if(testResult === false){
            $('#newInstanceName').attr("title", "El nombre no es válido. Únicamente se aceptan caracteres alfanuméricos. Evitar '´`}$%&#@!?¿¡.. etc");
            validator.AddClassRequiredActive($('#newInstanceName'));
            return false;
        }
        else{
            $('#newInstanceName').attr("title", "");
            validator.RemoveClassRequiredActive($('#newInstanceName'));
            return true;
        }
    };
    
    _buildNewInstance = function(){
        var instanceName = $('#newInstanceName').val();
        instanceName = $.trim(instanceName);
        var find = ' ';
        var re = new RegExp(find, 'g');
        instanceName = instanceName.replace(re, '_');
        
        if(!_checkNewInstanceName())
            return 0;
        
        _removeConsoleButtons();
        
        $('#WSInstance').append('<div class="PlaceWaiting" id = "newInstancePlaceWaiting"><img src="../img/loadinfologin.gif"></div>');
        
        $.ajax({
        async:true, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Instance.php",
        data: {option:"buildNewInstance", instanceName:instanceName, userName:EnvironmentData.NombreUsuario}, 
        success:  function(xml)
        {        
            $('#newInstancePlaceWaiting').remove();
            if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );         

            $(xml).find('newInstanceBuilded').each(function(){
                var mensaje = $(this).find("Mensaje").text();
                Notificacion(mensaje);
                _newInstanceInterface();
            });

            $(xml).find("Error").each(function()
            {
                var mensaje = $(this).find("Mensaje").text();
                Error(mensaje);
            });                    

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){$('#newInstancePlaceWaiting').remove(); Error(textStatus +"<br>"+ errorThrown);}
        });    
    };
    
    _addNewInstanceButtons = function(){
        var buttons = {"Crear":{click:function(){_buildNewInstance();}, text: "Crear Instancia"}};
        $('#divInstanceManager').dialog("option", "buttons", buttons);
    };
    
    _removeConsoleButtons = function(){
        var buttons = {};
        $('#divInstanceManager').dialog("option", "buttons", buttons);
    };
    
    
    /* Construye tabla con detalle de instancias */
    _buildInstancesTableDetail = function(instances){
        $('#instancesTableDetail').remove();
        $('#WSInstance').append('\
            <table id = "instancesTableDetail">\n\
                <thead>\n\
                    <th>Nombre Instancia</th>\n\
                    <th>Fecha Creación</th>\n\
                    <th>Usuario Creador</th>\n\
                </thead>\n\
            </table>');
        
        instancesTableDetaildT = $('#instancesTableDetail').dataTable(
        {
            "bInfo":false, "autoWidth" : false, "oLanguage":LanguajeDataTable,"dom": 'lfTrtip',
            "tableTools": {
                "aButtons": [
                    {"sExtends": "copy","sButtonText": "Copiar al portapapeles"},
                    {
                        "sExtends":    "collection",
                        "sButtonText": "Guardar como...",
                        "aButtons":    [ "csv", "xls", "pdf" ]
                    }                          
                ]
            }                              
        });  

        $('div.DTTT_container').css({"margin-top":"1em"});
        $('div.DTTT_container').css({"float":"left"});

        instancesTableDetailDT = new $.fn.dataTable.Api('#instancesTableDetail');
        
        $('#instancesTableDetail tbody').on( 'click', 'tr', function ()
        {
            instancesTableDetailDT.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        } ); 
        
        $('#instancesTableDetail tr:eq(0)').click();
        
        
        $(instances).find("Instance").each(function(){
            
            var instanceName = $(this).find("NombreInstancia").text();
            var IdInstance = $(this).find("IdInstancia").text();
            var creationDate = $(this).find("fechaCreacion").text();
            var creatorUser = $(this).find("usuarioCreador").text();
            var data = [instanceName, creationDate, creatorUser ];

            var ai = instancesTableDetailDT.row.add(data).draw();
            var n = instancesTableDetaildT.fnSettings().aoData[ ai[0] ].nTr;
            n.setAttribute('id',IdInstance);
            
        });
        
        
    };
    
    _deleteInstance = function(){
        var idInstanceSelected = $('#instancesTableDetail tr.selected').attr('id');
        if(!(idInstanceSelected > 0))
            return Advertencia("Debe seleccionar una instancia");
        
    };
    
    _ConfirmDeleteInstance = function()
    {
        var InstanceName = $('#DeleteInstanceForm option:selected').html();
        var IdInstance = $('#DeleteInstanceForm').val();
        
        if(!(IdInstance>0))
            return Advertencia("Debe seleccionar una instancia");

        $('#deleteInstanceConfirmation').remove();    
            
        $('#page').append('\
            <div id = "deleteInstanceConfirmation" class = "modal fade" tabindex="-1" role="dialog">\n\
                <div class="modal-dialog" role="document">\n\
                    <div class="modal-content">\n\
                      <div class="modal-header">\n\
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>\n\
                        <h4 class="modal-title">Mensaje de confirmación</h4>\n\
                      </div>\n\
                      <div class="modal-body">\n\
                        Usted esta apunto de eliminar la instancia\n\
                      </div>\n\
                      <div class="modal-footer">\n\
                        <button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>\n\
                        <button type="button" class="btn btn-primary">Eliminar</button>\n\
                      </div>\n\
                    </div>\n\
                  </div>\n\
                </div>\n\
            </div>');
        
        
        $('#DivConfirmDeleteInstance').dialog({title:'Mensaje de confirmacion', width:300, minWidth:300, height:300, minHeight:300, modal:true, closeOnEscape:false, 
            buttons:{Aceptar:{text:'Aceptar', click:function(){_DeleteInstance(IdInstance, InstanceName);$(this).dialog('destroy');}}}});
        $('#DivConfirmDeleteInstance').append('<p>¿Realmente desea eliminar la instancia <b>'+InstanceName+'? El proceso no puede revertirse.</b></p>');
    };
    
    
    _getInstances = function(){
        return self.getInstancesXml();
    };
    
};

ClassInstanceManager.prototype.buildManager = function(){
    $('#divInstanceManager').remove();
    $('body').append('<div id = "divInstanceManager"></div>');
    $('#divInstanceManager').append('\
        <div class="menu_lateral"> \n\
            <div id="instanceAccordion">\n\
                <div>\n\
                    <h3><a href="#">Instancias</a></h3>\n\
                    <div>\n\
                        <table id = "instanceManagerTable" class="TableInsideAccordion">\n\
                            <tr id = "linkNewInstance">\n\
                                <td><img src="img/newInstance.png"></td>\n\
                                <td>Nueva Instancia</td>\n\
                            </tr>\n\
                            <tr id = "linkInstanceManager">\n\
                                <td><img src="img/Storage.png"></td>\n\
                                <td>Administrar</td>\n\
                            </tr>\n\
                        </table>\n\
                    </div>\n\
                </div>\n\
            </div>\n\
        </div>\n\
        <div class="work_space" id="WSInstance"></div>\n\
');
    
    /********* Efectos sobre tabla dentro de acordeón ***********/
    $('#instanceManagerTable').on( 'click', 'tr', function ()
    {
        var active = $('#instanceManagerTable tr.TableInsideAccordionFocus');                
        $('#instanceManagerTable tr').removeClass('TableInsideAccordionFocus');
        $('#instanceManagerTable tr').removeClass('TableInsideAccordionActive');
        $(active).addClass('TableInsideAccordionFocus');
        $(this).removeClass('TableInsideAccordionHoverWithoutClass');
        $(this).addClass('TableInsideAccordionActive');     
    });
    $('#instanceManagerTable tr').hover(function()
    {
        if($(this).hasClass('TableInsideAccordionActive') || $(this).hasClass('TableInsideAccordionFocus'))
            $(this).addClass('TableInsideAccordionHoverWithClass');
        else
            $(this).addClass('TableInsideAccordionHoverWithoutClass');
    });
    $('#instanceManagerTable tr').mouseout(function()
    {
        if($(this).hasClass('TableInsideAccordionActive') || $(this).hasClass('TableInsideAccordionFocus'))
            $(this).removeClass('TableInsideAccordionHoverWithClass');
        else
            $(this).removeClass('TableInsideAccordionHoverWithoutClass');
    });
    
    /* Generación del acordeón (Panel izquierdo de la consola) */
    $("#instanceAccordion").accordion({ header: "h3", collapsible: true,heightStyle: "content" });
        
    $('#linkNewInstance').on("click", _newInstanceInterface);
    
    $('#linkInstanceManager').on("click", InstanceManager.instanceManagerInterface);
    
    /* Se abre la consola */
    $('#divInstanceManager').dialog(ConsoleSettings, {title: "Administración de instancias"}).dialogExtend(BotonesWindow);

    
    $('#linkNewInstance').click();
    
    
};

ClassInstanceManager.prototype.newInstanceInterface = function(){
    _newInstanceInterface();
};

/* Construye la interfaz de administración de instancias */
ClassInstanceManager.prototype.instanceManagerInterface = function(){
    var self = this;
    
    $('#WSInstance').empty();
    $('#WSInstance').append('<input type = "button" id = "btnDeleteInstance" data-toggle="modal" data-target="#deleteInstanceConfirmation" class = "btn btn-danger btn-sm" value = "Eliminar Instancia">');
    
    $('#WSInstance').append('<div class="PlaceWaiting" id = "newInstancePlaceWaiting"><img src="../img/loadinfologin.gif"></div>');
    $('#btnDeleteInstance').on("click",_ConfirmDeleteInstance);
    
    
    var instances = _getInstances();
    
    console.log(instances);
    
    _buildInstancesTableDetail(instances);
    
    _removeConsoleButtons();
    
    $('#newInstancePlaceWaiting').remove();
};


ClassInstanceManager.prototype.getInstancesXml = function(){
    
    var instances = null;
    
    $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Instance.php",
        data: {option:"getInstances"}, 
        success:  function(xml)
        {        
            if($.parseXML( xml )===null){Error(xml);  return 0;}else xml=$.parseXML( xml );         
            
            instances = xml;
            
            $(xml).find("Error").each(function()
            {
                var mensaje = $(this).find("Mensaje").text();
                Error(mensaje);
                instances = 0;
            });                    

        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){ Error(textStatus +"<br>"+ errorThrown);}
    });    
   
   return instances;
    
};



