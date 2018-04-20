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
        content.append(buildTable());

        setTableData();
    }

    var buildTable = function(){
        return '' +
            '<table id="groupsTable" class="display hover">' +
            '<thead><tr><th>Nombre</th><th>Responsable</th></tr></thead>' +
            '<tbody></tbody>' +
            '</table>';
    }

    var setTableData = function(){
        var groups = getGroups();
        DT = $('#groupsTable').dataTable(tableSettings);
        dt = new $.fn.dataTable.Api("#groupsTable");

        $(groups.data).each(function () {
            var idGroup = this.IdGrupo;
            var groupName = this.Nombre;
            var userName = this.Login != null ? this.Login : "";
            var data = [groupName, userName];

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

    var tableSettings = {
        "sDom": 'lfTrtip',
        "bInfo": false, "autoWidth": false, "oLanguage": LanguajeDataTable,
        "tableTools": {
            "aButtons": [
                {"sExtends": "text", "sButtonText": '<i class="fa fa-plus-circle fa-lg"></i> Agregar Responsable', "fnClick": function () {
                    addManager();
                }},
                {"sExtends": "text", "sButtonText": '<i class="fa fa-trash-o"></i> Eliminar Responsable', "fnClick": function () {
                    deleteManager();
                }},
                {
                    "sExtends": "collection",
                    "sButtonText": '<i class="fa fa-floppy-o fa-lg"></i>',
                    "aButtons": ["csv", "xls", "pdf", "copy"]
                }
            ]
        }
    };

    var getGroups = function(){
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

    var addManager = function(){
        var idGroup = $('#groupsTable tr.selected').attr('id');
        idGroup = parseInt(idGroup);

        if(!idGroup > 0)
            return Advertencia("Debe seleccionar un grupo.");

        var users = getGroupUsers(idGroup);
        console.log(users);
        return 0;

        $.ajax({
            async: false,
            cache: false,
            dataType: "json",
            method: 'POST',
            url: "Modules/php/TransferPermissions.php",
            data: {option: "addManagerToGroup", idGroup: idGroup},
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
    }

    var getGroupUsers = function(idGroup){
        var users = null;
        $.ajax({
            async: false,
            cache: false,
            dataType: "json",
            method: 'POST',
            url: "Modules/php/TransferPermissions.php",
            data: {option: "getGroupUsers", idGroup: idGroup},
            success: function (response) {
                if(!response.status){
                    console.log(response);
                    return errorMessage("Error al obtener grupos de usuario");
                }
                users = response.data;
            },
            beforeSend: function () {
            },
            error: function (objXMLHttpRequest) {
                errorMessage(objXMLHttpRequest);
            }
        });
        return users;
    }

    var deleteManager = function(){

    }

};