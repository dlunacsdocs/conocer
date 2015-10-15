/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global DimensionsDialogMetadatas, ConsoleSettings, EnvironmentData */

$(document).ready(function(){
    $('.LinkInstancesManager').click(function(){
        InstanceManager.buildManager();
    });
});

var ClassInstanceManager = function(){
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
        
    $('#linkNewInstance').click(function(){
        _newInstanceInterface();
    });
    
    /* Se abre la consola */
    $('#divInstanceManager').dialog(ConsoleSettings, {title: "Administración de instancias"}).dialogExtend(BotonesWindow);

    
    $('#linkNewInstance').click();
    
    
};


