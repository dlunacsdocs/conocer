var ModulesControlClass = function(callback){
    _archival = function(){
        var status = false;
        $.ajaxSetup({async: false});
        $.getScript( "Modules/js/Archival.js" )
            .done(function( script, textStatus ) {
              status = true;
              archival = new ArchivalClass();
              archival.buildModule();
              
              return true;
            })
            .fail(function( jqxhr, settings, exception ) {
            });
        $.ajaxSetup({async: true});
        
        return status;
    };
};

ModulesControlClass.prototype.start = function(callback){
    
    _archival();
    console.log('Preparando inicio');
    if(typeof callback === 'function')
        callback();
};
