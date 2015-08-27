/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global Permissions, BotonesWindow, EnvironmentData, dHeight, dWidth, Enterprise, Repository */

var WindowContentManagement={width:dWidth, height:dHeight, title:"CSDocs", minWidth:800, minHeight:800,closeOnEscape:false};

$(document).ready(function()
{                 
   $('.LinkContainer').click(function()
   {        
        CleaningContent();
                        
       $('#content_management').dialog(WindowContentManagement).dialogExtend(BotonesWindow);
       $( "#tabs" ).tabs();
       $( "#tabs li" ).removeClass( "ui-corner-top" );       
       
       var enterprises = Enterprise.GetEnterprises();
       $("#CM_select_empresas option").remove();
       $("#CM_select_empresas").append("<option value='0'>Seleccione una Empresa</option>");
       $(enterprises).find('Enterprise').each(function()
        {
            var IdEnterprise = $(this).find('IdEmpresa').text();
            var EnterpriseKey = $(this).find('ClaveEmpresa').text();
            var EnterpriseName = $(this).find('NombreEmpresa').text();
           $("#CM_select_empresas").append("<option value=\""+EnterpriseKey+"\" id = \""+IdEnterprise+"\">"+EnterpriseName+"</option>");
        });
       
   }) ;
   
   $('#CM_select_empresas').change(function()
       {
            CleaningContent();
           var EnterpriseKey = $('#CM_select_empresas').val();
           if(EnterpriseKey!=="0")
           {           
               $("#CM_select_repositorios option").remove();
               $("#CM_select_repositorios").append("<option value='0'>Seleccione un Repositorio</option>");
               var repositories = Repository.GetRepositories(EnterpriseKey);
               
                $(repositories).find('Repository').each(function()
                {
                    var IdRepository = $(this).find('IdRepositorio').text();
                    var RepositoryName = $(this).find('NombreRepositorio').text();
                    $('#CM_select_repositorios').append('<option value = "'+IdRepository+'">'+RepositoryName+'</option>');
                });
           }
           else
           {
               $('#CM_select_repositorios').empty().append("<option value=\""+0+"\">Seleccione una Empresa</option>");
               
                CleaningContent();      
           }           
       });
       
       $('#CM_select_repositorios').change(function()
       {
           var IdRepositorio = $('#CM_select_repositorios').val();
           if(IdRepositorio>0)
           {
               Permissions.ApplyUserPermissions(IdRepositorio);
               CM_getTree();             
           }                
           else
               CleaningContent();
       });
           
});

function CleaningContent()
{
    /* Se limpia árbol y contenedor de archivos */
    var emptyTest = $('#contentTree').is(':empty');
    if(!emptyTest)
    {
        var node = $("#contentTree").dynatree("getActiveNode");
        if(node)
            $('#contentTree').dynatree("destroy");

        $('#contentTree').empty(); 
    }
    
    $('.contentDetail').empty();
}


