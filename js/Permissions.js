var ClassPermissions = function()
{
    this.ApplyUserPermissions = function(IdRepositorio)
    {
        var Permissions = _GetUserPermissions(IdRepositorio);
        if($.type(Permissions)!=='object')
            return 0;
        
        var HtmlNamePermission = new Array();
        var AccessPermissions = new Array();
        var DeniedPermissions = new Array();
        
        $(Permissions).find('DeniedPermissions').each(function()
        {
            DeniedPermissions[DeniedPermissions.length] = [$(this).find('IdMenu').text(), $(this).find('Nombre').text()];
        });
        
        $(Permissions).find('AccessPermissions').each(function()
        {
            AccessPermissions[AccessPermissions.length] = [$(this).find('IdMenu').text(), $(this).find('Nombre').text()];
        });
        
        $(Permissions).find('HtmlPermissionsName').each(function()
        {
            HtmlNamePermission[$(this).find('Nombre').text()] = $(this).find('HtmlPermissionName').text();
        });
        
//        console.log(HtmlNamePermission);
        
        for(var cont = 0; cont < DeniedPermissions.length; cont++)
        {
            var IdMenu = DeniedPermissions[cont][0];     var NombreMenu = DeniedPermissions[cont][1];
            
            if(HtmlNamePermission[NombreMenu]!== undefined)
            {
                var HtmlPermissionName = "."+HtmlNamePermission[NombreMenu];
                $(HtmlPermissionName).hide();
//                console.log(HtmlPermissionName+" Denegado...");
            }   
            else
                console.log("No se encontró en el diccionario de menús a "+NombreMenu);
        }
        
        for(var cont = 0; cont < AccessPermissions.length; cont++)
        {
            var IdMenu = AccessPermissions[cont][0];    var NombreMenu = AccessPermissions[cont][1];
            if(HtmlNamePermission[NombreMenu]!== undefined)
            {
                var HtmlPermissionName = "."+HtmlNamePermission[NombreMenu];
                $(HtmlPermissionName).show();
//                console.log(HtmlPermissionName+" Permitido...");
            }   
            else
                console.log("No se encontró en el diccionario de menús a "+NombreMenu);
        }
        
        
        return 1;        
    };
    

    
    _GetUserPermissions = function(IdRepositorio)
    {        
        var Permissions = new Array();
        
        $.ajax({
        async:false, 
        cache:false,
        dataType:"html", 
        type: 'POST',   
        url: "php/Permissions.php",
        data: "opcion=GetUserPermissions&DataBaseName="+EnvironmentData.DataBaseName+'&IdUsuario='+EnvironmentData.IdUsuario+'&NombreUsuario='+EnvironmentData.NombreUsuario+'&IdGrupo='+EnvironmentData.IdGrupo+'&NombreGrupo='+EnvironmentData.NombreGrupo+'&IdRepositorio='+IdRepositorio, 
        success:  function(xml)
        {           
            if($.parseXML( xml )===null){console.log(xml); return 0;}else xml=$.parseXML( xml );              
            
            if($(xml).find("Error").length>0)
            {
                $(xml).find("Error").each(function()
                {
                    var $Error=$(this);
                    var estado=$Error.find("Estado").text();
                    var mensaje=$Error.find("Mensaje").text();
                    Error(mensaje);
                });    
            }
            else
                Permissions = xml;
        },
        beforeSend:function(){},
        error: function(jqXHR, textStatus, errorThrown){Error(textStatus +"<br>"+ errorThrown);}
        });    
        
        return Permissions;
   };         
};

