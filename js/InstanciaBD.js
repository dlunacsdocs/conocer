///* 
// *  Variable Global:  @BotonesWindow        Declarada en 
// */
///* global EnvironmentData, visor_Width, visor_Height, BotonesWindow */
//
//$(document).ready(function()
//{
//    
//    $('#img_ejemplo_xsd').click(function()
//    {
//        $('#vista_previa_xsd').dialog({width:visor_Width, height:visor_Height, 
//            minHeight:500, minWidth:500, title:"XSD Default"}).dialogExtend(BotonesWindow);
//    });
//});
//

//
//var Instances = function()
//{
//
//    
//};
//
//
//Instances.prototype.GetInstances = function()
//{
//    var xml = 0;
//    $.ajax({
//    async:false, 
//    cache:false,
//    dataType:"html", 
//    type: 'POST',   
//    url: "php/Instance.php",
//    data: 'option=getInstances&IdUser='+EnvironmentData.IdUsuario+'&UserName='+EnvironmentData.NombreUsuario, 
//    success:  function(response)
//    {     
//        if($.parseXML( response )===null){Salida(response); return 0;}else xml=$.parseXML( response );         
//
//        $(xml).find("Error").each(function()
//        {
//            var $Error=$(this);
//            var estado=$Error.find("Estado").text();
//            var mensaje=$Error.find("Mensaje").text();
//            Error(mensaje);
//            return 0;
//        });        
//        
//        return xml;
//
//    },
//    beforeSend:function(){},
//    error: function(jqXHR, textStatus, errorThrown){Error(textStatus +"<br>"+ errorThrown);}
//    });    
//    
//    return xml;
//};
