/* global BootstrapDialog */

var TransferPermissions = function () {
    var dt;
    var DT;

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

            },
            onshown: function (dialogRef) {
                buildTableUserGroups(content);
            }
        });
    };

    var buildTableUserGroups = function(content){
        var table = '<table id="groupsTable" class="display hover"><thead><tr><th>Nombre</th></tr></thead><tbody></tbody></table>';
        content.append(table);

        setTableData();
    }

    var setTableData = function(){
        var groups = getGroups();
        DT = $('#groupsTable').dataTable({
            "sDom": 'lfTrtip',
            "bInfo": false, "autoWidth": false, "oLanguage": LanguajeDataTable,
            "tableTools": {
                "aButtons": [
                    {"sExtends": "text", "sButtonText": '<i class="fa fa-plus-circle fa-lg"></i> Agregar Responsable', "fnClick": function () {
                        _newInstanceModal();
                    }},
                    {"sExtends": "text", "sButtonText": '<i class="fa fa-trash-o"></i> Eliminar Responsable', "fnClick": function () {
                        _confirmDeleteInstance();
                    }},
                    {
                        "sExtends": "collection",
                        "sButtonText": '<i class="fa fa-floppy-o fa-lg"></i>',
                        "aButtons": ["csv", "xls", "pdf", "copy"]
                    }
                ]
            }
        });
        dt = new $.fn.dataTable.Api("#groupsTable");

        $(groups.data).each(function () {
            var idGroup = this.IdGrupo;
            var groupName = this.Nombre;
            var data = [groupName];

            var ai = dt.row.add(data).draw();
            var n = DT.fnSettings().aoData[ ai[0] ].nTr;
            n.setAttribute('id', idGroup);
        });

        $('#groupsTable tbody').on('click', 'tr', function () {
            if ($(this).hasClass('selected'))
                $(this).removeClass('selected');
            else {
                dt.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
            }
        });

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