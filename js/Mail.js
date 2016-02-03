/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global EnvironmentData */

$(document).ready(function()
{
    $('.LinkMail').click(function(){
        ShowMailAccounts();
    });
});
/*
 * Muestra el contenedor con el listado de cuentas de correo dadas de alta 
 */
function ShowMailAccounts()
{
    $('#div_mail').remove();
    $('body').append('<div id = "div_mail"></div>');
    $('#div_mail').append('<div class="titulo_ventana">Correos Registrados</div>');
    $('#div_mail').append('<div id= "ListAccounts"></div>');
    $('#div_mail').append('<div class="loading"><img src="../img/loadinfologin.gif"></div>');
    $('#div_mail').append('<table id="TableListMailAccounts" class="display hover"><thead><tr><th>Cuenta</th><th>Eliminar</th><th>Modificar</th></tr></thead><tbody></tbody></table>');
    var VentanaMail= {
        title: "Listado de Correos",
        width: "600",
        height: "500",
        minWidth:"600",
        minHeight:"500",
        position: "right-10 top+20",
        buttons:
                {
                    "Agregar Nueva Cuenta":
                    {
                        text:"Agregar Nueva Cuenta",
                        click: function(){ FormsAddNewAccount(); },
                        class:'ReadWrite'
                    },
                    "Descarga de Documentos":
                    {
                        text:"Descarga de Documentos",
                        click: function(){ DownloadFromAccount(); },
                        class:'ReadWrite'
                    }
                }
    };
    $('#div_mail').dialog(VentanaMail);            
    $('.loading').remove();        
    var Tabla = $('#TableListMailAccounts').dataTable(DataTable);
    
    $('#TableListMailAccounts tbody').on( 'click', 'tr', function ()
       {
            if ( $(this).hasClass('selected') ) 
            {
                    $(this).removeClass('selected');
            }
            else 
            {
                Tabla.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');                               
            }
        } );
        
   var ListAccount = ListAccounts();
}

function ListAccounts()
{
 
    var Tabla=$('#TableListMailAccounts').DataTable();
    var TablaInsert=$('#TableListMailAccounts').dataTable();
    
    $.ajax({
      async:false, 
      cache:false,
      dataType:"html", 
      type: 'POST',   
      url: "php/Mail.php",
      data: "opcion=ListAccounts"+"&IdUsuario="+EnvironmentData.IdUsuario+"&DataBaseName="+EnvironmentData.DataBaseName+'&nombre_usuario='+EnvironmentData.NombreUsuario, 
      success:  function(xml){       
           ($.parseXML( xml )===null)?Salida(xml) : xml=$.parseXML( xml );
           $(xml).find("Mail").each(function()
            {
               var $Mail=$(this);
               var IdCorreo=$Mail.find("IdCorreo").text();            
               var IdUserPropietario=$Mail.find("IdUsuario").text();
               var NombreCuenta=$Mail.find("NombreCuenta").text();
               var IdCorreo=$Mail.find("IdCorreo").text();
               var mail=new Object();
               
               var data=
               [
                    NombreCuenta,
                    '<img src = "img/ArchivoEliminar.png" title = "Eliminar a '+NombreCuenta+'">',
                    '<img src = "img/ArchivoEditar.png" title = "Editar a '+NombreCuenta+'">'
                ];   
         
                 var ai = Tabla.row.add(data);
                 var n = TablaInsert.fnSettings().aoData[ ai[0] ].nTr;
                 n.setAttribute('id',IdCorreo);
                 Tabla.draw();            
            });
            
            $(xml).find("Error").each(function()
            {
                var $Instancias=$(this);
                var estado=$Instancias.find("Estado").text();
                var mensaje=$Instancias.find("Mensaje").text();
                errorMessage(mensaje);
            });
      },
      beforeSend:function(){},
      error:function(objXMLHttpRequest){errorMessage(objXMLHttpRequest);}
    });        
    return ListAccounts;
}

function FormsAddNewAccount()
{    
    
    $('#FormsAddAccount').remove();
    $('#div_mail').append('<div id="FormsAddAccount"></div>');
    $('#FormsAddAccount').append('<div class="titulo_ventana"></div>');
    $('#FormsAddAccount').append('<br>');
    $('#FormsAddAccount').append('<table id = "TableFormsAddNewAccount"></table>');
    $('#TableFormsAddNewAccount').append('<tr><td>Nombre de la Cuenta</td><td><input type = "text" name="NombreCuenta" class="FormsAddNewAccount"></td></tr>');
    $('#TableFormsAddNewAccount').append('<tr><td>Contraseña</td><td><input type = "password" name="Password" class="FormsAddNewAccount"></td></tr>');
    $('#TableFormsAddNewAccount').append('<tr><td>Nombre a mostrar</td><td><input type = "text" name="NombreMostrar" class="FormsAddNewAccount"></td></tr>');
    $('#FormsAddAccount').dialog(
            {
                title:"Registrar cuenta de correo",
                width: 500,
                height: 300,
                minHeight:300,
                minWidth:400,
                modal:true,
                buttons:
                        {
                            "Agregar":
                            {
                                click: function(){ AddNewAccount(); },
                                text:"Agregar"
                            },
                            "Cancelar":
                            {
                                click: function(){ $(this).dialog('close'); },
                                text: "Cancelar"
                            }
                        }
            });
}

function AddNewAccount()
{        
      
    var CadenaValores='';
    var Forms=$('.FormsAddNewAccount');
    
    for(var cont = 0; cont < Forms.length; cont++)
    {
        var name=$(Forms[cont]).attr('name');
        var value=$(Forms[cont]).val();
        CadenaValores+='&'+name+'='+value;
    }   
    
    $.ajax({
      async:false, 
      cache:false,
      dataType:"html", 
      type: 'POST',   
      url: "php/Mail.php",
      data: 'opcion=AddNewAccount&IdUsuario='+EnvironmentData.IdUsuario+'&DataBaseName='+EnvironmentData.DataBaseName+CadenaValores, 
      success:  function(xml){           
          
           ($.parseXML( xml )===null)?Salida(xml) : xml=$.parseXML( xml );
           
           $(xml).find("AddNewAccount").each(function()
            {
               var $AddNewAccount=$(this);
               var Mensaje=$AddNewAccount.find("Mensaje").text();            
               Exito(Mensaje);
            });
            $(xml).find("Error").each(function()
            {
                var $Instancias=$(this);
                var estado=$Instancias.find("Estado").text();
                var mensaje=$Instancias.find("Mensaje").text();
                errorMessage(mensaje);
            });
      },
      beforeSend:function(){},
      error:function(objXMLHttpRequest){errorMessage(objXMLHttpRequest);}
    });        
}


function DownloadFromAccount()
{ 
    var IdAccount=$('#TableListMailAccounts tr.selected').attr('id');
    
    if(!IdAccount>0){Advertencia("Seleccione una cuenta de correo");return;}
    
    $.ajax({
      async:false, 
      cache:false,
      dataType:"html", 
      type: 'POST',   
      url: "php/Mail.php",
      data: 'opcion=DownloadFromAccount&IdUsuario='+EnvironmentData.IdUsuario+'&DataBaseName='+EnvironmentData.DataBaseName+'&IdAccount='+IdAccount, 
      success:  function(xml){           
          
           ($.parseXML( xml )===null)?Salida(xml) : xml=$.parseXML( xml );
           
           $(xml).find("DownloadFromAccount").each(function()
            {
               var $AddNewAccount=$(this);
               var Mensaje=$AddNewAccount.find("Mensaje").text();            
               Exito(Mensaje);
            });
            $(xml).find("Error").each(function()
            {
                var $Instancias=$(this);
                var estado=$Instancias.find("Estado").text();
                var mensaje=$Instancias.find("Mensaje").text();
                errorMessage(mensaje);
            });
      },
      beforeSend:function(){},
      error:function(objXMLHttpRequest){errorMessage(objXMLHttpRequest); $('.loading').remove();}
    });        
}
/*
 * Muestra un listado de documentos descargados de una cuenta de correo
 */
function ShowResultOfDownloadFromAccount(xml)
{
    $('#div_mail').empty();
    $('#div_mail').append('<div class="titulo_ventana">Correos Registrados</div>');
    $('#div_mail').append('<div id= "ResultOfDownloadFromAccount"></div>');
    $('#div_mail').append('<div class="loading"><img src="../img/loadinfologin.gif"></div>');
}