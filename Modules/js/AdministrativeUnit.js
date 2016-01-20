/* global BootstrapDialog */

var AdministrativeUnit = function(){
    /**
     * @description Agrega la acción de respuesta al dar click sobre la opción de menú de "Unidad Administrativa".
     * @returns {undefined}
     */
    this.setActionToLink = function(){
        $('.LinkAdministrativeUnit').click(function(){
            buildConsole();
        });   
    };
    
    var buildConsole = function(){
        var content = $('<div>');
        var navTabBar = $('<nav>',{class:"navbar navbar-default"});
        var container = $('<div>',{ class: "container-fluid"});
        var navHeader = $('<div>', {class: "navbar-header"}).append('<a class="navbar-brand" href="#"></a>');
        container.append(navHeader);
        container.append('<div class = "btn-group-sm" role="group">\n\
                            <button class = "btn btn-success navbar-btn newAdminUnit"><span class = "glyphicon glyphicon-plus"></span></button>\n\
                            <button class = "btn btn-warning navbar-btn editAdminUnit"><span class = "glyphicon glyphicon-edit"></span></button>\n\
                            <button class = "btn btn-danger navbar-btn removeAdminUnit"><span class = "glyphicon glyphicon-remove"></span></button>\n\
                         </div>');        
        navTabBar.append(container);
        
        content.append(navTabBar);
        
        var adminUnit = $('<div>',{id:"adminUnitTree"});
        
        content.append(adminUnit);
        
        var dialog = BootstrapDialog.show({
            title: 'Unidad Administrativa',
            size: BootstrapDialog.SIZE_NORMAL,
            type:BootstrapDialog.TYPE_PRIMARY,
            message: content,
            closable: true,
            buttons: [
                
            ],
            onshown: function(dialogRef){
                adminUnit.dynatree();
                var root = $('#adminUnitTree').dynatree('getRoot');
                if(typeof root === 'object'){
                    var child = root.addChild({
                        title:"Unidades Administrativas",
                        key:0,
                        isFolder:true,
                        expand: true,
                        icon: "/img/archival/department.png"
                    });
                    child.activate(true);
                }
                
                $('.newAdminUnit').click(newAdminUnit);
                $('.editAdminUnit').click(editAdminUnit);
                $('.removeAdminUnit').click(removeAdminUnit);
                
            },
            onclose: function(dialogRef){
                
            }
        });
    };
    
    var newAdminUnit = function(){
        
    };
    
    var editAdminUnit = function(){
        
    };
    
    var removeAdminUnit = function(){
        
    };
    
};