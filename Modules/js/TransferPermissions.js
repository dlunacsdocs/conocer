/* global BootstrapDialog */

var TransferPermissions = function () {
    this.setActionToLink = function(){
        $('.LinkTransferPermissions').click(open);
    };

    var open = function () {
        var content = $('<div>', {class: ""});

        BootstrapDialog.show({
            title: '<i class="fa fa-exchange fa-lg"></i> Permisos de Transferencia',
            size: BootstrapDialog.SIZE_WIDE,
            type: BootstrapDialog.TYPE_PRIMARY,
            message: content,
            closable: true,
            closeByBackdrop: false,
            closeByKeyboard: true,
            buttons: [

            ],
            onshow: function (dialogRef) {
                buildTableUserGroups(content);
            },
            onshown: function (dialogRef) {

            }
        });
    };

    var buildTableUserGroups = function(content){
        var table = $('<table>');
        content.append(table);

        setTableData();
    }

    var setTableData = function(){
        var groups = getGroups();

    }

    var getGroups = function(){
        console.log("getGroups");
        var groups = null;
        $.ajax({
            async: false,
            cache: false,
            dataType: "json",
            method: 'POST',
            url: "Modules/php/TransferPermissions.php",
            data: {option: "getUserGroups"},
            success: function (response) {
                if(!response.status){
                    console.log(response);
                    return errorMessage("Error al obtener grupos de usuario");
                }
                groups = response;
            },
            beforeSend: function () {
            },
            error: function (objXMLHttpRequest) {
                errorMessage(objXMLHttpRequest);
            }
        });

        return groups;
    }

};