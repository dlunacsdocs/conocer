/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global BootstrapDialog */

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
    var $message = $('<div></div>');
    $message.append(mensaje);
    
    BootstrapDialog.show({
            title: '<span class = "glyphicon glyphicon-warning-sign"></span> Mensaje de Salida',
            message: $message,
            type: BootstrapDialog.TYPE_INFO,
            size: BootstrapDialog.SIZE_WIDE,
            buttons: [{
                    label:"Aceptar",
                    action:function(dialog){
                        dialog.close();
                    }
            }],
            closable: false
        });
}
function Error(mensaje)
{
    console.log(mensaje);
}

function errorMessage(mensaje)
{
    var $message = $('<div></div>');
    $message.append(mensaje);
    
    BootstrapDialog.show({
            title: '<span class = "glyphicon glyphicon-warning-sign"></span> Error',
            message: $message,
            type: BootstrapDialog.TYPE_DANGER,
            size: BootstrapDialog.SIZE_WIDE,
            buttons: [{
                    label:"Aceptar",
                    action:function(dialog){
                        dialog.close();
                    }
            }],
            closable: false
        });
}

function Advertencia(mensaje)
{

    BootstrapDialog.show({
            title: '<span class = "glyphicon glyphicon-warning-sign"></span> Advertencia',
        message: mensaje,
        type: BootstrapDialog.TYPE_WARNING,
        size: BootstrapDialog.SIZE_SMALL,
        buttons: [{
                label:"Aceptar",
                action:function(dialog){
                    dialog.close();
                }
        }]
    });

}


function Exito(mensaje)
{
    var $message = $('<div></div>');
    $message.append(mensaje);
    
    BootstrapDialog.show({
            title: '<span class = "glyphicon glyphicon-warning-sign"></span> Éxito',
            message: $message,
            type: BootstrapDialog.TYPE_SUCCESS,
            size: BootstrapDialog.SIZE_SMALL,
            buttons: [{
                    label:"Aceptar",
                    action:function(dialog){
                        dialog.close();
                    }
            }]
        });
}

function Loading()
{
    $('#Loading_').remove();
    $('#Loading').append('<div id="Loading_"\n\
><center><img src="../img/loading.gif"></center></div>');
    $('#Loading').dialog(WindowLoading);    
//    ''
}