
$(document).ready(function(){
   $('.LinkSystemManager').click(function()
   {       
       
       if($('#divSystemManager').length === 0)
           $('#page').append('<div id = "divSystemManager"></div>');
       
      $('#divSystemManager').dialog(AdminConfigWindow,{ title:"Consola de Administración",}).dialogExtend(BotonesWindow);
        $("#systemManagerAccordion > div").accordion({ header: "h3", collapsible: true });
        
        /* Opciones del menú lateral */
        $('#tr_nueva_instancia').click(function()
        {
            admin_nueva_instancia();
        });
        $('#tr_lista_instancias').click(function(){admin_lista_instancias();});
   });
});

var ClassSystemManager = function(){
    var self = this;
};

ClassSystemManager.prototype.closeSession = function(){
    
};

/* Crea la ventana de consola de administración del sistema */
ClassSystemManager.prototype.createSystemManager = function(){
    
};


