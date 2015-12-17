var ModulesControlClass = function(){
    _archival = function(){
        var status = false;
        $.getScript( "Modules/js/Archival.js" )
            .done(function( script, textStatus ) {
              status = true;
              archival = new ArchivalClass();
              archival.buildModule();
            })
            .fail(function( jqxhr, settings, exception ) {
            });
        
        return status;
    };
};

ModulesControlClass.prototype.start = function(){
    var archivalStatus = _archival();
};
