/* global BootstrapDialog */

var TransferPermissions = function () {
    var dt;
    var DT;
    var usersDT;
    var usersdt;

    this.setActionToLink = function(){
        $('.LinkTransferPermissions').click(open);
    };
    /**
     * Open the interface of transfer permissions
     */
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
            n.setAttribute('groupName', groupName);
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

    /**
     * settings of DataTable
     * @type {{sDom: string, bInfo: boolean, autoWidth: boolean, oLanguage, tableTools: {aButtons: [null,null,null]}}}
     */
    var tableSettings = {
        "sDom": 'lfTrtip',
        "bInfo": false, "autoWidth": false, "oLanguage": LanguajeDataTable,
        "tableTools": {
            "aButtons": [
                {"sExtends": "text", "sButtonText": '<i class="fa fa-plus-circle fa-lg"></i> Agregar Responsable', "fnClick": function () {
                    addManagerInterface();
                }},
                {"sExtends": "text", "sButtonText": '<i class="fa fa-trash-o"></i> Eliminar Responsable', "fnClick": function () {
                    deleteManagerConfirmation();
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

    /**
     * Interface for adding a manager in a selected group
     * @returns {*}
     */
    var addManagerInterface = function(){
        var idGroup = $('#groupsTable tr.selected').attr('id');
        var groupName = $('#groupsTable tr.selected').attr('groupName');

        idGroup = parseInt(idGroup);

        if(!idGroup > 0)
            return Advertencia("Debe seleccionar un grupo.");

        var content = $('<div>');

        BootstrapDialog.show({
            title: '<i class="fa fa-exchange fa-lg"></i> '+groupName,
            size: BootstrapDialog.SIZE_NORMAL,
            type: BootstrapDialog.TYPE_PRIMARY,
            message: content,
            closable: true,
            closeByBackdrop: false,
            closeByKeyboard: true,
            buttons: [
                {
                    label: "Cancelar",
                    cssClass: "btn btn-default",
                    action: function(dialog){
                        dialog.close();
                    }
                },
                {
                    label: "Asociar",
                    cssClass: "btn btn-primary",
                    action: function (dialog) {
                        var idUser = $('#usersTable tr.selected').attr('id');

                        if(parseInt(idUser) > 0){
                            if(associateUserToGroup(idGroup, idUser)){
                                dialog.close();
                                addAssociatedUserToTable(idGroup, idUser);
                            }
                        }
                        else
                            Advertencia("Debe seleccionar un usuario");
                    }
                }
            ],
            onshow: function (dialogRef) {

            },
            onshown: function (dialogRef) {
                groupsersTable(content, idGroup);
            }
        });

    }


    var groupsersTable = function(content, idGroup){
        var table = '<table id = "usersTable" class = "table display hover">' +
            '<thead><tr><th>Usuario</th></tr></thead>' +
            '</table>';

        content.append(table);

        usersDT = $('#usersTable').dataTable(DataTable);
        usersdt = new $.fn.dataTable.Api("#usersTable");

        var users = getGroupUsers(idGroup);

        $(users).each(function(){
            var data = [this.Login];

            var ai = usersdt.row.add(data).draw();
            var n = usersDT.fnSettings().aoData[ ai[0] ].nTr;

            n.setAttribute('id', this.IdUsuario);
            n.setAttribute('login', this.Login);
        });

        $('#usersTable tbody').on('click', 'tr', function () {
            if ($(this).hasClass('selected'))
                $(this).removeClass('selected');
            else {
                usersdt.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
            }
        });
    }

    /**
     * return users of group
     * @param idGroup
     * @returns {*}
     */
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
                    return errorMessage("Error al obtener usuarios del grupo seleccionado");
                }
                users = response.data;
            },
            beforeSend: function () {
            },
            error: function (objXMLHttpRequest) {
                errorMessage(objXMLHttpRequest.responseText);
            }
        });
        return users;
    }
    /**
     * Associate a user in an specific group
     * @param idGroup
     * @param idUser
     */
    var associateUserToGroup = function(idGroup, idUser){
        var status = false;

        $.ajax({
            async: false,
            cache: false,
            dataType: "json",
            method: 'POST',
            url: "Modules/php/TransferPermissions.php",
            data: {option: "associateUserToGroup", idGroup: idGroup, idUser: idUser},
            success: function (response) {
                if(!response.status){
                    return errorMessage("Error al asociar un usuario al grupo seleccionado");
                }
                status = true;
            },
            beforeSend: function () {
            },
            error: function (objXMLHttpRequest) {
                console.log(objXMLHttpRequest);
                errorMessage(objXMLHttpRequest.responseText);
            }
        });
        return status;
    }

    var addAssociatedUserToTable = function(idGroup, idUser){
        var groupName = $('#groupsTable tr.selected').attr('groupName');
        var userName = $('#usersTable tr.selected').attr('login');

        var data = dt.row('tr[id=' + idGroup + ']').data();
        data[1] = userName;
        dt.row($('#groupsTable tr.selected')).data(data).draw()
    }

    /**
     * remove a manager from a group
     */
    var deleteManagerConfirmation = function(){
        var idGroup = $('#groupsTable tr.selected').attr('id');
        var groupName = $('#groupsTable tr.selected').attr('groupName');

        idGroup = parseInt(idGroup);

        if(!idGroup > 0)
            return Advertencia("Debe seleccionar un grupo.");

        var content = $('<div>').append("¿Realmente desea eliminar al encargado de transferencia de archivo?");

        BootstrapDialog.show({
            title: '<i class="fa fa-exchange fa-lg"></i> '+groupName,
            size: BootstrapDialog.SIZE_SMALL,
            type: BootstrapDialog.TYPE_WARNING,
            message: content,
            closable: true,
            closeByBackdrop: false,
            closeByKeyboard: true,
            buttons: [
                {
                    label: "Cancelar",
                    cssClass: "btn btn-default",
                    action: function(dialog){
                        dialog.close();
                    }
                },
                {
                    label: "Eliminar",
                    cssClass: "btn btn-warning",
                    action: function (dialog) {
                        if(deleteManager(idGroup, groupName)){
                            var button = this;
                            button.spin();
                            removeUserFromGroup(idGroup, groupName);
                        }
                        dialog.close();
                    }
                }
            ],
            onshow: function (dialogRef) {

            },
            onshown: function (dialogRef) {
            }
        });
    }

    /**
     * remove a user from a group of transfer permissions
     * @param idGroup
     * @param groupName
     * @returns {boolean}
     */
    var deleteManager = function(idGroup, groupName){
        var status = false;

        $.ajax({
            async: false,
            cache: false,
            dataType: "json",
            method: 'POST',
            url: "Modules/php/TransferPermissions.php",
            data: {option: "deleteManagerFromGroup", idGroup: idGroup},
            success: function (response) {
                if(!response.status){
                    return errorMessage("Error al asociar un usuario al grupo seleccionado");
                }
                status = true;
            },
            beforeSend: function () {
            },
            error: function (objXMLHttpRequest) {
                console.log(objXMLHttpRequest);
                errorMessage(objXMLHttpRequest.responseText);
            }
        });
        return status;
    }

    /**
     * remove a user from a table user group
     * @param idGroup
     * @param groupName
     */
    var removeUserFromGroup = function(idGroup, groupName){
        var data = dt.row('tr[id=' + idGroup + ']').data();
        data[1] = "";
        dt.row($('#groupsTable tr.selected')).data(data).draw()
    }

};