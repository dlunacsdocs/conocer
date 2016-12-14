var Transfer = function(){
     this.buildLinkInContentInterface = function(){
        $('.expedientModuleLink .dropdown-menu').append('\n\
                <li class = "contentTransferLink"><a href="#"><i class="fa fa-exchange fa-lg"></i> Transferencia </span> </a></li>\n\
            ');

        $('.contentTransferLink').unbind('click').on('click',open);
    };
     
     var open = function(){
         
     }
};