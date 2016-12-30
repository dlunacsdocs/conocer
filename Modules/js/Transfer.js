/* global BootstrapDialog */

var Transfer = function () {
    this.buildLinkInContentInterface = function () {
        $('.expedientModuleLink .dropdown-menu').append('\n\
                <li class = "contentTransferLink"><a href="#"><i class="fa fa-exchange fa-lg"></i> Transferencia </span> </a></li>\n\
            ');

        $('.contentTransferLink').unbind('click').on('click', open);
    };

    var open = function () {
        var content = $('<div>', {class: "row transfer"});

        BootstrapDialog.show({
            title: '<i class="fa fa-exchange fa-lg"></i> Transferencia',
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

            },
            onshown: function (dialogRef) {
                buildTemplate(content);
            }
        });
    }

    /**
     * 
     Clave Serie	Descripción	A	L	F	I	T	E	AT
     * @returns {undefined}
     */
    var buildTemplate = function (content) {
        var header = getHeader();
        var body = getBody();
        content.append(header)
                .append(body);
    };

    var getHeader = function () {
        return $('<div>', {class: "header-tranfer col-md-12"})
                .append(getLogo())
                .append(getTitle());
    };

    var getLogo = function () {
        return $('<div>', {class: "col-sm-8 col-md-8"}).append($('<div>', {class: "logo-transfer"}));
    };

    var getTitle = function () {
        return $('<div>', {class: "col-sm-4 col-md-4"})
                .append(
                        $('<div>', {class: "transfer-title"}).append('<p>Transferencia Primaria</p>')
                        );
    };

    var getBody = function () {
        var content = $('<div>', {class: "row body-transfer"});
        content.append(setDatesContent)
                .append(getTable());
        return content;
    };

    var setDatesContent = function () {
        var content = $('<div>', {class: "col-md-12"});
        return content.append(dateTransfer())
                .append(dateReception());
    };

    var dateTransfer = function () {
        var form = $('<div>', {class: "form-group"});
        var content = $('<div>', {class: "col-md-6 form-inline"}).append(form);

        form.append($('<label>', {}).append("Fecha Transferencia"))
                .append($('<input>', {type: "text", class: "form-control", placeholder: "Fecha Transferencia"}));

        return content;
    };

    var dateReception = function () {
        var form = $('<div>', {class: "form-group"});
        var content = $('<div>', {class: "col-md-6 form-inline"}).append(form);

        form.append($('<label>', {}).append("Fecha Recepción"))
                .append($('<input>', {type: "text", class: "form-control", placeholder: "Fecha Recepción"}));

        return content;
    };
    
    var getTable = function(){
        var table = $('<table>', {id:"tableTransfer", class: "table table-condensed"}).append(thead()).append(tbody());
        return $('<div>', {class: "col-md-12"}).append(table);
    };
    
    var thead = function(){
        return $('<thead>').append(
                $('<tr>').append($('<th>').append('No. Expediente'))
                            .append($('<th>').append('No. Fojas'))
                            .append($('<th>').append('Trámite'))
                            .append($('<th>').append('Años Concentración'))
                            .append($('<th>').append('Fundamento Legal'))
                            .append($('<th>').append('Descripción'))
            );
    };
    
    var tbody = function(){
        var tb = $('<tbody>').append(
                
            );
        return tb;
    };
};