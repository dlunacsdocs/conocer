/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global DimensionsDialogMetadatas, ConsoleSettings */

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
                    <div class = "form-group has-feedback">\n\
                        <label> Nombre </label>\n\
                        <input type = "text" class = "form-control" id = "newInstanceName" placeholder = "Nombre instancia">\n\
                    </div>\n\
                </div>\n\
                <br><br>\n\
            <p class = "bg-info infoTextBox">Una instancia es un ambiente reservado y aislado dentro de su equipo NAS la cuál podrá administrar \n\
            con nuevas empresas y repositorios para el almacenamiento y distribución de sus documentos.</p>\n\
        ');
        _addNewInstanceButtons();
    };
    
    _buildNewInstance = function(){
        
        var instanceName = $('#newInstanceName').val();
        
        _removeConsoleButtons();
        
        $('#WSInstance').append('<div class="PlaceWaiting" id = "newInstancePlaceWaiting"><img src="../img/loadinfologin.gif"></div>');
        
        $.ajax({
        async:true, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Instance.php",
        data: {option:"buildNewInstance", instanceName:instanceName}, 
        success:  function(xml)
        {        
            $('#newInstancePlaceWaiting').remove();
            if($.parseXML( xml )===null){Error(xml); return 0;}else xml=$.parseXML( xml );         

            $(xml).find('newInstanceBuilded').each(function(){
                var mensaje = $(this).find("Mensaje").text();
                Notificacion(mensaje);
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
        var buttons = {"Crear":{click:function(){_buildNewInstance();}, text: "Crear"}};
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
                                <td><img src="img/users.png"></td>\n\
                                <td>Usuarios</td>\n\
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


