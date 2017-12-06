/* global BootstrapDialog */

var TransferPermissions = function () {
    this.setActionToLink = function(){
        console.log("setActionToLink");
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
                {
                    icon: 'fa fa-plus-circle fa-lg',
                    label: 'Agregar',
                    cssClass: "btn-primary",
                    hotkey: 13,
                    action: function (dialogRef) {
                        var button = this;
                        dialogRef.enableButtons(false);
                        dialogRef.setClosable(false);
//                        if (_mergeFrontPageWithLegajo(templateForm))
//                            dialogRef.close();
//                        else {
//                            dialogRef.setClosable(true);
//                            dialogRef.enableButtons(true);
//                        }
                    }
                },
                {
                    label: 'Cerrar',
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                }
            ],
            onshow: function (dialogRef) {
                buildTable(content);
            },
            onshown: function (dialogRef) {

            }
        });
    };

    var buildTable = function(content){
        var table = $('<table>');
        content.append(table);
    }

};