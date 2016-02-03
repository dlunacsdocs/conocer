/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global DimensionsDialogMetadatas, ConsoleSettings, EnvironmentData, InstanceManager, LanguajeDataTable, BootstrapDialog, BotonesWindow */
var instancesTableDetaildT, instancesTableDetailDT;
$(document).ready(function () {
    $('.LinkInstancesManager').click(function () {
        InstanceManager.buildManager();
    });

});

var ClassInstanceManager = function () {
    var self = this;
    /* Genera interfaz para agregar una nueva instancia en el espacio de trabajo WS */


    _checkNewInstanceName = function () {
        var validator = new ClassFieldsValidator();
        var instanceName = $('#newInstanceName').val();
        instanceName = $.trim(instanceName);
        var find = ' ';
        var re = new RegExp(find, 'g');
        instanceName = instanceName.replace(re, '_');
        var regularExpression = /^([A-Za-z0-9 _]+$)/g;       /* Comprueba validez del nombre de la intancia */
        var patt = RegExp(regularExpression);
        var testResult = null;

        if (instanceName.length < 4) {
            $('#newInstanceName').attr("title", "El nombre de la instancia debe ser amyor a 4 caracteres.");
            validator.AddClassRequiredActive($('#newInstanceName'));
            return false;
        } else
        {
            $('#newInstanceName').attr("title", "");
            validator.RemoveClassRequiredActive($('#newInstanceName'));
        }

        testResult = patt.test(instanceName);

        console.log("resultado de test:: " + testResult + " " + instanceName);

        if (testResult === false) {
            $('#newInstanceName').attr("title", "El nombre no es válido. Únicamente se aceptan caracteres alfanuméricos. Evitar '´`}$%&#@!?¿¡.. etc");
            validator.AddClassRequiredActive($('#newInstanceName'));
            return false;
        } else {
            $('#newInstanceName').attr("title", "");
            validator.RemoveClassRequiredActive($('#newInstanceName'));
            return true;
        }
    };






    /* Construye tabla con detalle de instancias */
    _buildInstancesTableDetail = function (instances) {
        $('#instancesTableDetail').remove();
        $('#WSInstance').append('\
            <table id = "instancesTableDetail" class = "table table-striped table-bordered table-hover table-condensed display hover">\n\
                <thead>\n\
                    <th>Nombre Instancia</th>\n\
                    <th>Fecha Creación</th>\n\
                    <th>Usuario Creador</th>\n\
                </thead>\n\
            </table>');

        $('body').append('<div id = "instancesTableDetailToolBar"></div>');

        instancesTableDetaildT = $('#instancesTableDetail').dataTable(
                {
                    "sDom": 'lfTrtip',
                    "bInfo": false, "autoWidth": false, "oLanguage": LanguajeDataTable,
                    "tableTools": {
                        "aButtons": [
                            {"sExtends": "text", "sButtonText": '<i class="fa fa-plus-circle fa-lg"></i> Nueva Instancia', "fnClick": function () {
                                    _newInstanceModal();
                                }},
                            {"sExtends": "text", "sButtonText": '<i class="fa fa-trash-o"></i> Eliminar', "fnClick": function () {
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


        instancesTableDetailDT = new $.fn.dataTable.Api('#instancesTableDetail');

        $('#instancesTableDetail tbody').on('click', 'tr', function ()
        {
            instancesTableDetailDT.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        });


        $(instances).find("Instance").each(function () {

            var instanceName = $(this).find("NombreInstancia").text();
            var IdInstance = $(this).find("IdInstancia").text();
            var creationDate = $(this).find("fechaCreacion").text();
            var creatorUser = $(this).find("usuarioCreador").text();
            var data = [instanceName, creationDate, creatorUser];

            var ai = instancesTableDetailDT.row.add(data).draw();
            var n = instancesTableDetaildT.fnSettings().aoData[ ai[0] ].nTr;
            n.setAttribute('id', IdInstance);

        });

        $('#instancesTableDetail tbody tr:eq(0)').click();

    };

    /* Modal que se abre para ingresar una nueva instancia */
    _newInstanceModal = function () {
        var $text = $('<div></div>');
        $text.append('<p>Agregar instancia vacia</p>');
        $text.append('  <div class = "form-inline text-muted">\n\
                            <div class = "form-group has-feedback text-muted">\n\
                                 Nombre \n\
                                <input type = "text" class = "form-control" id = "newInstanceName" placeholder = "Nombre instancia">\n\
                            </div>\n\
                        </div>');
        $text.append('<br>');
        $text.append('<p>Construir instancia desde un XML (Se genera automáticamente al seleccionar XML)</p>');
        $text.append('<div class = "form-inline">\n\
                    <div class = "form-group has-feedback text-muted">\n\
                        <input type="file" class = "" id="xml_nueva_instancia" accept="text/xml">\n\
                    </div>\n\
                </div>');
        $text.append('<br>');
        $text.append('<p class = "well">Una instancia es un ambiente reservado y aislado dentro de su equipo NAS el cual podrá administrar \n\
            con nuevas empresas y repositorios para el almacenamiento y distribución de sus documentos.</p>');

        var dialog = BootstrapDialog.show({
            title: 'Nueva instancia',
            message: $text,
            closable: true,
            closeByBackdrop: false,
            closeByKeyboard: false,
            buttons: [
                {
                    label: 'Construir',
                    icon: 'fa fa-cogs fa-lg',
                    cssClass: "btn-primary",
                    id: 'btnNewInstance',
                    action: function (dialogRef) {
                        var button = this;
                        button.spin();
                        dialogRef.enableButtons(false);
                        dialogRef.setClosable(false);

                        if (_buildNewInstance()) 
                            dialogRef.close();
                        else {
                            dialogRef.enableButtons(true);
                            dialogRef.setClosable(true);
                            button.stopSpin();
                        }
                    }
                },
                {
                    label: 'Cancelar',
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                }
            ],
            onshown: function (dialogRef) {
                $('#newInstanceName').focus();
                $('#xml_nueva_instancia').on('change', function () {
                    buildInstanceFromXML(dialog);
                });
            }
        });


    };

    /* Se recoge el XML introducido por el Usuario y se envia al servidor para su lectura*/
    buildInstanceFromXML = function (dialogRef)
    {
        var xml_usuario = document.getElementById("xml_nueva_instancia");
        var archivo = xml_usuario.files;
        var data = new FormData();

        if (!(archivo.length > 0)) {
            Advertencia('Debe seleccionar un XMl con la estructura de una nueva Instancia');
            return;
        }

        dialogRef.enableButtons(false);
        var buttonNewInstance = dialogRef.getButton('btnNewInstance');
        buttonNewInstance.disable();
        buttonNewInstance.spin();
        dialogRef.setClosable(false);

        for (i = 0; i < archivo.length; i++)
        {
            data.append('archivo', archivo[i]);
            data.append('opcion', 'ReadXML');
            data.append('id_usuario', EnvironmentData.IdUsuario);
            data.append('nombre_usuario', EnvironmentData.NombreUsuario);
        }

        ajax = objetoAjax();
        ajax.open("POST", 'php/XML.php', true);
        ajax.send(data);
        ajax.onreadystatechange = function ()
        {
            if (ajax.readyState === 4 && ajax.status === 200)
            {
                dialogRef.close();
                Salida(ajax.responseText);
            }
        };

    };

    _buildNewInstance = function () {
        var status = 0;
        var instanceName = $('#newInstanceName').val();
        instanceName = $.trim(instanceName);
        var find = ' ';
        var re = new RegExp(find, 'g');
        instanceName = instanceName.replace(re, '_');

        if (!_checkNewInstanceName())
            return 0;

        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "php/Instance.php",
            data: {option: "buildNewInstance", instanceName: instanceName, userName: EnvironmentData.NombreUsuario},
            success: function (xml)
            {

                if ($.parseXML(xml) === null)
                    return errorMessage(xml);
                else
                    xml = $.parseXML(xml);

                $(xml).find('newInstanceBuilded').each(function () {
                    instancesTableDetailDT.$('tr.selected').removeClass('selected');

                    var mensaje = $(this).find("Mensaje").text();
                    var idInstance = $(this).find("idInstance").text();

                    Notificacion(mensaje);

                    var d = new Date();
                    var now = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();

                    var data = [instanceName, now, EnvironmentData.NombreUsuario];
                    var ai = instancesTableDetailDT.row.add(data).draw();
                    var n = instancesTableDetaildT.fnSettings().aoData[ ai[0] ].nTr;

                    n.setAttribute("id", idInstance);
                    n.setAttribute('class', "selected");
                    status = 1;
                });

                $(xml).find("Error").each(function ()
                {
                    var mensaje = $(this).find("Mensaje").text();
                    errorMessage(mensaje);
                });

            },
            beforeSend: function () {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                errorMessage(textStatus + "<br>" + errorThrown);
            }
        });

        return status;
    };

    _confirmDeleteInstance = function ()
    {
        var instanceName;
        var idInstance = $('#instancesTableDetail tr.selected').attr('id');

        $('#instancesTableDetail tr.selected').each(function ()
        {
            var position = instancesTableDetaildT.fnGetPosition(this); // getting the clicked row position
            instanceName = instancesTableDetaildT.fnGetData(position)[0];
        });

        if (!(idInstance > 0))
            return Advertencia("Debe seleccionar una instancia");

        console.log("ConfirmDeleteInstance:::Modifed");

        BootstrapDialog.confirm({
            title: 'Peligro',
            message: '¿Esta acción no puede revertirse, realmente desea continuar y eliminar la instancia <b>' + instanceName + '?',
            type: BootstrapDialog.TYPE_DANGER, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
            size: BootstrapDialog.SIZE_SMALL,
            closable: true, // <-- Default value is false
            draggable: false, // <-- Default value is false
            btnCancelLabel: 'Cancelar', // <-- Default value is 'Cancel',
            btnOKLabel: 'Deseo continuar', // <-- Default value is 'OK',
            btnOKClass: 'btn-danger', // <-- If you didn't specify it, dialog type will be used,
            callback: function (result) {
                // result will be true if button was click, while it will be false if users close the dialog directly.
                if (result) {
                    _deleteInstance(idInstance, instanceName);
                } else {

                }
            }
        });

    };

    _deleteInstance = function (IdInstance, InstanceName)
    {

        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "php/Instance.php",
            data: 'option=DeleteInstance&IdUser=' + EnvironmentData.IdUsuario + '&UserName=' + EnvironmentData.NombreUsuario + '&IdInstance=' + IdInstance + '&InstanceName=' + InstanceName,
            success: function (xml)
            {
                if ($.parseXML(xml) === null)
                    return Salida(xml);
                else
                    xml = $.parseXML(xml);

                $(xml).find('DeleteInstance').each(function ()
                {
                    var Mensaje = $(this).find('Mensaje').text();
                    Notificacion(Mensaje);
                    instancesTableDetailDT.row('tr[id=' + IdInstance + ']').remove().draw(false);
                });

                $(xml).find("Error").each(function ()
                {
                    var mensaje = $(this).find("Mensaje").text();
                    errorMessage(mensaje);
                });

            },
            beforeSend: function () {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                errorMessage(textStatus + "<br>" + errorThrown);
            }
        });
    };


    _getInstances = function () {
        return self.getInstancesXml();
    };

};

ClassInstanceManager.prototype.buildManager = function () {
    $('#divInstanceManager').remove();
    $('body').append('<div id = "divInstanceManager"></div>');
    $('#divInstanceManager').append('\
        <div class="menu_lateral"> \n\
            <div id="instanceAccordion">\n\
                <div>\n\
                    <h3><a href="#">Instancias</a></h3>\n\
                    <div>\n\
                        <table id = "instanceManagerTable" class="TableInsideAccordion">\n\
                            <tr id = "linkInstanceManager">\n\
                                <td><img src="img/Storage.png"></td>\n\
                                <td>Administrar</td>\n\
                            </tr>\n\
                        </table>\n\
                    </div>\n\
                </div>\n\
            </div>\n\
        </div>\n\
        <div class="work_space" id="WSInstance"></div>\n\
    ');

    /********* Efectos sobre tabla dentro de acordeón ***********/
    $('#instanceManagerTable').on('click', 'tr', function ()
    {
        var active = $('#instanceManagerTable tr.TableInsideAccordionFocus');
        $('#instanceManagerTable tr').removeClass('TableInsideAccordionFocus');
        $('#instanceManagerTable tr').removeClass('TableInsideAccordionActive');
        $(active).addClass('TableInsideAccordionFocus');
        $(this).removeClass('TableInsideAccordionHoverWithoutClass');
        $(this).addClass('TableInsideAccordionActive');
    });
    $('#instanceManagerTable tr').hover(function ()
    {
        if ($(this).hasClass('TableInsideAccordionActive') || $(this).hasClass('TableInsideAccordionFocus'))
            $(this).addClass('TableInsideAccordionHoverWithClass');
        else
            $(this).addClass('TableInsideAccordionHoverWithoutClass');
    });
    $('#instanceManagerTable tr').mouseout(function ()
    {
        if ($(this).hasClass('TableInsideAccordionActive') || $(this).hasClass('TableInsideAccordionFocus'))
            $(this).removeClass('TableInsideAccordionHoverWithClass');
        else
            $(this).removeClass('TableInsideAccordionHoverWithoutClass');
    });

    /* Generación del acordeón (Panel izquierdo de la consola) */
    $("#instanceAccordion").accordion({header: "h3", collapsible: true, heightStyle: "content"});


    $('#linkInstanceManager').on("click", InstanceManager.instanceManagerInterface);

    /* Se abre la consola */
    $('#divInstanceManager').dialog(ConsoleSettings, {title: "Administración de instancias"}).dialogExtend(BotonesWindow);


    $('#linkInstanceManager').click();


};


/* Construye la interfaz de administración de instancias */
ClassInstanceManager.prototype.instanceManagerInterface = function () {
    var self = this;

    $('#WSInstance').empty();

    $('#WSInstance').append('<div class="PlaceWaiting" id = "newInstancePlaceWaiting"><img src="../img/loadinfologin.gif"></div>');

    var instances = _getInstances();

    _buildInstancesTableDetail(instances);

    $('#newInstancePlaceWaiting').remove();
};


ClassInstanceManager.prototype.getInstancesXml = function () {

    var instances = null;

    $.ajax({
        async: false,
        cache: false,
        dataType: "html",
        type: 'POST',
        url: "php/Instance.php",
        data: {option: "getInstances"},
        success: function (xml)
        {
            if ($.parseXML(xml) === null)
                return errorMessage(xml);
            else
                xml = $.parseXML(xml);

            instances = xml;

            $(xml).find("Error").each(function ()
            {
                var mensaje = $(this).find("Mensaje").text();
                errorMessage(mensaje);
                instances = 0;
            });

        },
        beforeSend: function () {
        },
        error: function (jqXHR, textStatus, errorThrown) {
            errorMessage(textStatus + "<br>" + errorThrown);
        }
    });

    return instances;

};




