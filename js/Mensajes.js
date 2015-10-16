/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var HideClose={show: { effect: "blind", duration: 800 },
              hide: { effect: "fade", duration: 500 }};

var ButtonsWindows={Buttons:function(){$(this).dialog('close');}};
var WindowError={width:400, height:500, minWidth:300, minHeight:400, modal:true, title:"Error en la Operación",buttons: {Aceptar: function() {$( this ).dialog( "close" );$( this ).dialog( "destroy" );}}};
var WindowAdvertencia={width:300, height:300, minWidth:300, minHeight:300, modal:true, title:"Advertencia",buttons: {Aceptar: function() {$( this ).dialog( "close" );$( this ).dialog( "destroy" );}}};
var WindowExito={width:300, height:300, minWidth:300, minHeight:300,draggable:false, modal:true, title:"Operación realizada con éxito",buttons: {Aceptar: function() {$( this ).dialog( "close" );$( this ).dialog( "destroy" );}}};
var WindowSalida={width:300, height:550, minWidth:300, minHeight:300, modal:true, title:"Registro de Resultados de Operación",show: { effect: "blind", duration: 800 },buttons: {Aceptar: function() {$( this ).dialog( "close" );$( this ).dialog( "destroy" );}}};
var WindowConfirmacion={width:300, height:300, minWidth:300, minHeight:250,draggable:false, modal:true, title:"Mensaje de Confirmación",buttons: {Aceptar: function() {$( this ).dialog( "close" );$( this ).dialog( "destroy" );}}};
var WindowLoading={width:200, height:200, minWidth:200, minHeight:200,draggable:false, modal:true,open: function(event, ui) {$(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide();}};


//Borra la brra de título de los dialogs
//open: function() { $(this).closest(".ui-dialog").find(".ui-dialog-titlebar:first").hide(); }


function Salida(mensaje)
{    
    $('#MensajeSalida').dialog(WindowSalida);
    $('#MensajeSalida').empty();
    $('#MensajeSalida').append('<center><img src="img/edit_icon.png"></center>');
    $('#MensajeSalida').append(mensaje);
}
function Error(mensaje)
{
    $('#MensajeError').dialog(WindowError);
    $('#MensajeError').empty();
    $('#MensajeError').append('<center><img src="img/fallo.png"></center>');
    $('#MensajeError').append(mensaje);
}

function errorMessage(mensaje)
{
    alert("ErrorMessage"+" "+$('#MensajeError').length);

    $('#MensajeError').dialog();
    $('#MensajeError').empty();
    $('#MensajeError').append('<center><img src="img/fallo.png"></center>');
    $('#MensajeError').append(mensaje);
}

function Advertencia(mensaje)
{
//    $('body').append('\n\
//        <div id = "warningMessage" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog">\n\
//            <div class="modal-dialog modal-sm">\n\
//                <div class="modal-content">\n\
//                    <center><img src="img/Caution.png"></center>\n\
//                    '+mensaje+'\n\
//                </div>\n\
//            </div>\n\
//        </div>\n\
//    ');
    
    $('body').append('\n\
        <div id = "warningMessage" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel">\n\
            <div class="modal-dialog modal-sm">\n\
              <div class="modal-content">\n\
                ...\n\
              </div>\n\
            </div>\n\
        </div>\n\
    ');
    
    $('#warningMessage').modal("show");
}

function Exito(mensaje)
{
    $('#MensajeExito').dialog(WindowExito);
    $('#MensajeExito').empty();
    $('#MensajeExito').append('<center><img src="img/success.png" width="80px" heigth="80px"></center>');
    $('#MensajeExito').append(mensaje);
}

function Loading()
{
    $('#Loading_').remove();
    $('#Loading').append('<div id="Loading_"\n\
><center><img src="../img/loading.gif"></center></div>');
    $('#Loading').dialog(WindowLoading);    
//    ''
}

/*
 * Error cuando la respuesta viene en formato XML
 */
function ErrorXml(xml)
{
    $('#MensajeErrorXml').dialog(WindowError);
    $('#MensajeErrorXml').empty();
    $('#MensajeErrorXml').append('<center><img src="img/fallo.png"></center>');
       
    $(xml).find("Error").each(function()
    {
        var $Error=$(this);
        var estado=$Error.find("Estado").text();
        var mensaje=$Error.find("Mensaje").text();
        $('#MensajeErrorXml').append(mensaje);
        return;
    });   
}

function ExitoXml(xml)
{
    $('#MensajeExitoXml').dialog(WindowExito);
    $('#MensajeExitoXml').empty();
    $('#MensajeExitoXml').append('<center><img src="img/success.png" width="80px" heigth="80px"></center>');
       
    $(xml).find("Exito").each(function()
    {
        var $Instancias=$(this);
        var estado=$Instancias.find("Estado").text();
        var mensaje=$Instancias.find("Mensaje").text();
        $('#MensajeExitoXml').append(mensaje);
        return;
    });   
}

