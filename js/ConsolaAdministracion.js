/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var AdminConfigWindow={minHeight:500,minWidth:800,width:800, height:500};

$(document).ready(function()
{
   $('#li_consola_admin').click(function()
   {       
      $('#div_consola_admin').dialog(AdminConfigWindow,{ title:"Consola de Administración",}).dialogExtend(BotonesWindow);
        $("#accordion_admin > div").accordion({ header: "h3", collapsible: true });
        
        /* Opciones del menú lateral */
        $('#tr_nueva_instancia').click(function()
        {
            admin_nueva_instancia();
        });
        $('#tr_lista_instancias').click(function(){admin_lista_instancias();});
   });
});
/*******************************************************************************
 * 
 *          OPCIONES DEL MENÚ LATERAL DE LA CONSLA DE ADMINISTRACIÓN
 * 
 *******************************************************************************/

function admin_nueva_instancia()
{
    $('#work_space_admin').empty();
    
    $('#work_space_admin').append('<div class="titulo_ventana">Agregar Nueva Instancia</div>');
    $('#work_space_admin').append('<p>Seleccione el nombre de la instancia a configurar en el Sistema.</p>');
    $('#work_space_admin').append('<p><input type="text" placeholder="Nombre Instancia" id="form_nuevo_nombre_instancia"></p>');
    
}

function admin_lista_instancias()
{
    $('#work_space_admin').empty();
    
    $('#work_space_admin').append('<div class="titulo_ventana">Lista de Instancias</div>');
    $('#work_space_admin').append('<p>Detalle de instancias configuradas en el sistema.</p>');
    $('#work_space_admin').append('<p>\n\
    <table id="admin_tabla_instancias"><thead><th>Nombre</th><th>Acciones</th></thead></table>\n\
    </p>');
}