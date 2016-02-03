/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global EnvironmentData, BotonesWindow, ConsoleSettings, LanguajeDataTable, DimensionsDialogNewRegister, DimensionsDialogMetadatas, BootstrapDialog */

$(document).ready(function () {
    $('.LinkEnterprise').click(function () {
        var Enterprise = new ClassEnterprise();
        Enterprise.BuildConsole();
    });
});
var ClassEnterprise = function ()
{
    var self = this;
    var EnterprisedT;
    var EnterpriseDT;

    this.AdminStructure = function ()
    {
        var self = this;

        $('#EnterpriseWS').empty();
        $('#EnterpriseWS').append('<div class="Loading" id = "IconWaitingEnterprise"><img src="../img/loadinfologin.gif"></div>');

        var EnterpriseDetail = GeStructure('Empresa');

        $('#EnterpriseWS').append('<table id = "TableEnterpriseDetail" class = "display hover"></table>');
        $('#TableEnterpriseDetail').append('<thead><tr><th>Campo</th><th>Tipo</th><th>Longitud</th><th>Requerido</th></tr></thead>');

        EnterprisedT = $('#TableEnterpriseDetail').dataTable(
                {
                    'bPaginate': false, 'bInfo': false, bFilter: false, "bSort": false, "autoWidth": false, "oLanguage": LanguajeDataTable, "dom": 'lfTrtip',
                    "tableTools": {
                        "aButtons": [
                            {"sExtends": "text", "sButtonText": '<i class="fa fa-plus-circle fa-lg"></i> Agregar Campo', "fnClick": function () {
                                    _DisplayWindowNewField();
                                }},
                            {"sExtends": "text", "sButtonText": '<i class="fa fa-trash fa-lg"></i> Eliminar', "fnClick": function () {
                                    _ConfirmDeleteField();
                                }},
                            {
                                "sExtends": "collection",
                                "sButtonText": '<i class="fa fa-floppy-o fa-lg"></i>',
                                "aButtons": ["csv", "xls", "pdf", "copy"]
                            }
                        ]
                    }
                });

        $('div.DTTT_container').css({"margin-top": "1em"});
        $('div.DTTT_container').css({"float": "left"});

        EnterpriseDT = new $.fn.dataTable.Api('#TableEnterpriseDetail');

        $('#TableEnterpriseDetail tbody').on('click', 'tr', function ()
        {
            EnterpriseDT.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        });

        /* Llenado de la tabla con los campos del repositorio */
        $(EnterpriseDetail).find('Campo').each(function ()
        {
            var FieldName = $(this).find('name').text();
            var FieldType = $(this).find('type').text();
            var FieldLength = $(this).find('long').text();
            var RequiredField = $(this).find('required').text();

            if (RequiredField === '' || RequiredField === 'false')
                RequiredField = "No";
            else
            if (RequiredField === 'true')
                RequiredField = "Si";

            var data = [FieldName, FieldType, FieldLength, RequiredField];

            var ai = EnterpriseDT.row.add(data).draw();
            var n = EnterprisedT.fnSettings().aoData[ ai[0] ].nTr;
            //        n.setAttribute('id',self.AutoincrementId);

        });

        EnterprisedT.$('tbody tr:first').click();

        $('#IconWaitingEnterprise').remove();

    };

    this.BuildConsole = function ()
    {
        var self = this;

        $('#DivEnterprisesManager').remove();
        $('body').append('\n\
            <div id="DivEnterprisesManager">\n\
            <div class="menu_lateral">\n\
                    <div id="AccorEnterpriseManager">\n\
                        <div>\n\
                          <h3><a href="#">Empresas</a></h3>\n\
                          <div id = "ConsoleEnterpriseManager">\n\
                              <table class="TableInsideAccordion">\n\
                                  <tr class = "tr_EnterpriseList" title="Empresas">\n\
                                      <td><img src="img/AddEnterprise.png" ></td>\n\
                                      <td>Empresas</td>\n\
                                  </tr>\n\
                                  <tr class = "tr_EnterpriseStructure" title="Administracion de Empresas">\n\
                                      <td><img src="img/enterprise.png" ></td>\n\
                                      <td>Estructura</td>\n\
                                  </tr>\n\
                              </table>\n\
                          </div>\n\
                        </div>\n\
                    </div>\n\
            </div>\n\
            <div class="work_space" id="EnterpriseWS"></div>\n\
        </div>');

        $("#AccorEnterpriseManager").accordion({header: "h3", collapsible: true, heightStyle: "content"});

        $('#DivEnterprisesManager').dialog({title: "Consola de Empresas"}, ConsoleSettings).dialogExtend(BotonesWindow);

        /********* Efectos sobre tabla dentro de acordeÃ³n ***********/
        $('#DivEnterprisesManager table').on('click', 'tr', function ()
        {
            var active = $('#DivEnterprisesManager table tr.TableInsideAccordionFocus');
            $('#DivEnterprisesManager table tr').removeClass('TableInsideAccordionFocus');
            $('#DivEnterprisesManager table tr').removeClass('TableInsideAccordionActive');
            $(active).addClass('TableInsideAccordionFocus');
            $(this).removeClass('TableInsideAccordionHoverWithoutClass');
            $(this).addClass('TableInsideAccordionActive');
        });
        $('#DivEnterprisesManager table tr').hover(function ()
        {
            if ($(this).hasClass('TableInsideAccordionActive') || $(this).hasClass('TableInsideAccordionFocus'))
                $(this).addClass('TableInsideAccordionHoverWithClass');
            else
                $(this).addClass('TableInsideAccordionHoverWithoutClass');
        });
        $('#DivEnterprisesManager table tr').mouseout(function ()
        {
            if ($(this).hasClass('TableInsideAccordionActive') || $(this).hasClass('TableInsideAccordionFocus'))
                $(this).removeClass('TableInsideAccordionHoverWithClass');
            else
                $(this).removeClass('TableInsideAccordionHoverWithoutClass');
        });

        /* Fin de Efectos  */

        $('.tr_EnterpriseStructure').click(function ()
        {
            self.AdminStructure();
        });
        $('.tr_EnterpriseList').click(function ()
        {
            DisplayEnterprises();
        });

        $('.tr_EnterpriseList').click();
    };


    var DisplayEnterprises = function ()
    {
        $('#EnterpriseWS').empty();
        $('#EnterpriseWS').append('<div class="Loading" id = "IconWaitingEnterprises"><img src="../img/loadinfologin.gif"></div>');

        var FieldsArray = new Array();

        var th = '';

        var EnterpriseStructure = GetAllStructure('Empresa');

        $(EnterpriseStructure).find("Error").each(function () {
            var message = $(this).find("Mensaje").text();
            errorMessage(message);
            $('#IconWaitingEnterprises').remove();

            return 0;
        });


        $(EnterpriseStructure).find('Campo').each(function ()
        {
            var FieldName = $(this).find('name').text();
            var FieldType = $(this).find('type').text();
            var FieldLength = $(this).find('long').text();
            var RequiredField = $(this).find('required').text();
            th += "<th>" + FieldName + "</th>";

            var index = FieldsArray.length;
            $(this).attr('index', index);

            FieldsArray[index] = FieldName;
        });

        $('#EnterpriseWS').append('<table id = "EnterprisesTable" class = "table table-striped table-bordered table-hover table-condensed display hover"><thead>' + th + '</thead></table>');

        EnterprisedT = $('#EnterprisesTable').dataTable(
                {
                    'bPaginate': false, 'bInfo': false, bFilter: false, "bSort": false, "autoWidth": false, "oLanguage": LanguajeDataTable, "dom": 'lfTrtip',
                    "tableTools": {
                        "aButtons": [
                            {"sExtends": "text", "sButtonText": '<i class="fa fa-plus-circle fa-lg"></i> Empresa', "fnClick": function () {
                                    _FormsNewEnterprise();
                                }},
                            {"sExtends": "text", "sButtonText": '<i class="fa fa-pencil fa-lg"></i> Editar', "fnClick": function () {
                                    _EditEnterprise(EnterpriseStructure);
                                }},
                            {"sExtends": "text", "sButtonText": '<i class="fa fa-trash-o fa-lg"></i> Eliminar', "fnClick": function () {
                                    _ConfirmationDeleteEnterprise();
                                }},
                            {
                                "sExtends": "collection",
                                "sButtonText": '<i class="fa fa-floppy-o fa-lg"></i>',
                                "aButtons": ["csv", "xls", "pdf", "copy"]
                            }
                        ]
                    }
                });

        $('div.DTTT_container').css({"margin-top": "1em"});
        $('div.DTTT_container').css({"float": "left"});

        EnterpriseDT = new $.fn.dataTable.Api('#EnterprisesTable');

        $('#EnterprisesTable tbody').on('click', 'tr', function ()
        {
            EnterpriseDT.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        });

        /* Se obtiene el listado de empresas y la estructura para ser agregadas a la tabla */

        var Enterprises = self.GetEnterprises();

        $(Enterprises).find('Enterprise').each(function ()
        {
            var Enterprise = $(this);

            var IdEnterprise = $(this).find('IdEmpresa').text();
            var EnterpriseKey = $(this).find('ClaveEmpresa').text();
            var EnterpriseName = $(this).find('NombreEmpresa').text();

            var data = [EnterpriseKey, EnterpriseName];

            /* Campos definidos por el usuario */
            $(EnterpriseStructure).find('Campo').each(function ()
            {
                var FieldName = $(this).find('name').text();
                var FieldType = $(this).find('type').text();
                var FieldLength = $(this).find('long').text();
                var RequiredField = $(this).find('required').text();
                var FieldValue = $(Enterprise).find(FieldName).text();

                var ColumnIndex = $(this).attr('index');

                data[ColumnIndex] = [FieldValue];
            });

            var ai = EnterpriseDT.row.add(data).draw();
            var n = EnterprisedT.fnSettings().aoData[ ai[0] ].nTr;
            n.setAttribute('id', IdEnterprise);

        });

        EnterprisedT.$('tbody tr:first').click();

        $('#IconWaitingEnterprises').remove();
    };

    this.GetEnterprises = function ()
    {
        var RepositoriesXml = 0;
        var data = {option: "GetEnterprises"};
        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "php/Enterprise.php",
            data: data,
            success: function (xml)
            {
                if ($.parseXML(xml) === null) {
                    Error(xml);
                    return 0;
                } else
                    xml = $.parseXML(xml);

                RepositoriesXml = xml;

                $(xml).find("Error").each(function ()
                {
                    var $Error = $(this);
                    var estado = $Error.find("Estado").text();
                    var mensaje = $Error.find("Mensaje").text();
                    Error(mensaje);
                });

            },
            beforeSend: function () {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                Error(textStatus + "<br>" + errorThrown);
            }
        });

        return RepositoriesXml;
    };

    _DisplayWindowNewField = function ()
    {
        var fieldsManager = new FieldsManager();
        var dialogRef = fieldsManager.windowNewField(this._ValidateNewField);
    };

    _ValidateNewField = function (dialogRef)
    {
        var fieldsManager = new FieldsManager();
        var FieldsValues = fieldsManager.GetFieldsValues(EnterprisedT, EnterpriseDT);
        if (!$.isPlainObject(FieldsValues))
            return 0;

        dialogRef.close();
        _AddNewField(FieldsValues);

    };

    _AddNewField = function (FieldsValues)
    {
        var self = this;
        var data = {option: 'NewField', DataBaseName: EnvironmentData.DataBaseName, IdUser: EnvironmentData.IdUsuario, UserName: EnvironmentData.NombreUsuario, FieldName: FieldsValues.FieldName, FieldType: FieldsValues.FieldType, FieldLength: FieldsValues.FieldLength, RequiredField: FieldsValues.RequiredField};

        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "php/Enterprise.php",
            data: data,
            success: function (xml)
            {
                if ($.parseXML(xml) === null) {
                    Error(xml);
                    return 0;
                } else
                    xml = $.parseXML(xml);

                if ($(xml).find('AddedField').length > 0)
                {
                    var Mensaje = $(xml).find('Mensaje').text();

                    $('#TableEnterpriseDetail tr').removeClass('selected');

                    var FieldProperties = [FieldsValues.FieldName, FieldsValues.FieldType, FieldsValues.FieldLength, FieldsValues.RequiredField];

                    var ai = EnterpriseDT.row.add(FieldProperties).draw();
                    var n = EnterprisedT.fnSettings().aoData[ ai[0] ].nTr;
                    n.setAttribute('class', "selected");

                }

                $(xml).find("Error").each(function ()
                {
                    var $Error = $(this);
                    var mensaje = $Error.find("Mensaje").text();
                    Error(mensaje);
                });

            },
            beforeSend: function () {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                Error(textStatus + "<br>" + errorThrown);
            }
        });

    };

    _ConfirmDeleteField = function ()
    {
        var FieldSelected = $('#TableEnterpriseDetail tr.selected');
        var FieldName, data;

        if (FieldSelected.length !== 1)
            return Advertencia("Debe seleccionar un campo");

        EnterprisedT.$('tr.selected').each(function ()
        {
            var position = EnterprisedT.fnGetPosition(this); // getting the clicked row position
            FieldName = EnterprisedT.fnGetData(position)[0];
        });

        BootstrapDialog.show({
            title: '<i class="fa fa-exclamation-triangle fa-lg"></i> Mensaje de Confirmación',
            type: BootstrapDialog.TYPE_DANGER,
            size: BootstrapDialog.SIZE_SMALL,
            message: '<p>¿Realmente desea eliminar el campo <b>' + FieldName + '</b>? esta acción no puede revertirse</p>',
            closable: true,
            closeByBackdrop: true,
            closeByKeyboard: true,
            buttons: [
                {
                    label: 'Eliminar',
                    icon: 'fa fa-trash-o fa-lg',
                    cssClass: "btn-danger",
                    action: function (dialogRef) {
                        var button = this;
                        button.spin();
                        dialogRef.enableButtons(false);
                        dialogRef.setClosable(false);

                        if (_DeleteField())
                            dialogRef.close();
                        else{
                            dialogRef.enableButtons(true);
                            dialogRef.setClosable(true);
                            button.stopSpin();
                        }
                    }
                },
                {
                    label: "Cerrar",
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                }
            ],
            onshown: function (dialogRef) {

            }
        });

    };

    _DeleteField = function ()
    {
        var status = 0;
        var FieldSelected = $('#TableEnterpriseDetail tr.selected');
        var FieldName, data;

        if (FieldSelected.length !== 1)
            return Advertencia("Debe seleccionar un campo");

        EnterprisedT.$('tr.selected').each(function () {
            var position = EnterprisedT.fnGetPosition(this); // getting the clicked row position
            FieldName = EnterprisedT.fnGetData(position)[0];
        });

        data = {option: "DeleteField", FieldName: FieldName};

        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "php/Enterprise.php",
            data: data,
            success: function (xml)
            {
                if ($.parseXML(xml) === null)
                    return errorMessage(xml);
                else
                    xml = $.parseXML(xml);

                if ($(xml).find('DeletedField').length > 0)
                {
                    status = 1;
                    var Mensaje = $(xml).find('Mensaje').text();
                    Notificacion(Mensaje);
                    EnterpriseDT.row('tr.selected').remove().draw(false);
                    EnterprisedT.$('tbody tr:first').click();
                }

                $(xml).find("Error").each(function ()
                {
                    var $Error = $(this);
                    var mensaje = $Error.find("Mensaje").text();
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

    _FormsNewEnterprise = function ()
    {
        var content = $('<div>', {id: "newEnterprise"});
        content.append('<center><i class="fa fa-spinner fa-spin fa-lg"></i></center>');

        var EnterpriseStructure;

        BootstrapDialog.show({
            title: '<i class="fa fa-building fa-lg"></i> Agregar nueva empresa',
            type: BootstrapDialog.TYPE_INFO,
            size: BootstrapDialog.SIZE_NORMAL,
            message: content,
            closable: true,
            closeByBackdrop: true,
            closeByKeyboard: true,
            buttons: [
                {
                    label: 'Agregar',
                    icon: 'fa fa-plus-circle fa-lg',
                    cssClass: "btn-primary",
                    id: 'addNewEnterprise',
                    action: function (dialogRef) {
                        var button = this;
                        button.spin();
                        dialogRef.enableButtons(false);
                        dialogRef.setClosable(false);

                        if (_AddNewEnterprise(EnterpriseStructure, content))
                            dialogRef.close();
                        else{
                            dialogRef.enableButtons(true);
                            dialogRef.setClosable(true);
                            button.stopSpin();
                        }
                    }
                },
                {
                    label: "Cerrar",
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                }
            ],
            onshown: function (dialogRef) {
                var buttonAccept = dialogRef.getButton('addNewEnterprise');

                if (typeof buttonAccept === 'object')
                    buttonAccept.disable();

                var designer = new Designer();
                EnterpriseStructure = GetAllStructure("Empresa");

                if ($.type(EnterpriseStructure) !== 'object')
                    return Advertencia("No fué posible recuperar la estructura de empresas");

                designer.buildFormsStructure(content, EnterpriseStructure);

                content.find('.fa-spinner').remove();

                var forms = $(content).find('input');

                var FieldsValidator = new ClassFieldsValidator();
                FieldsValidator.InspectCharacters(forms);

                if (typeof buttonAccept === 'object')
                    return buttonAccept.enable();
                else
                    return Advertencia("Error javascript al intentar activar nuevamente el botón agregar. ");
            }
        });

    };

    /* Agrega un nuevo registro  */
    _AddNewEnterprise = function (EnterpriseStructure, content)
    {
        var status = 0;

        var RegularExpression = /^([a-zA-Z0-9\_])+$/g;
        var Forms = $(content).find('input');
        var FieldsValidator = new ClassFieldsValidator();

        var validation = FieldsValidator.ValidateFields(Forms);

        if (validation === 0)
            return;

        var Data = [];

        var xml = "<AddNewRegister version='1.0' encoding='UTF-8'>";

        $(EnterpriseStructure).find("Campo").each(function () {
            var $Campo = $(this);
            var name = $Campo.find("name").text();
            var type = $Campo.find("type").text();
            var long = $Campo.find("long").text();
            var required = $Campo.find("required").text();
            var value = $.trim($('#newEnterprise_' + name).val());

            if (name === "ClaveEmpresa") {
                value = String(value);
                value = value.toUpperCase();
            }

            if (value !== "")
                xml += '<Campo>\n\
                    <name>' + name + '</name>\n\
                    <value>' + value + '</value>\n\
                    <type>' + type + '</type>\n\
                    <long>' + long + '</long>\n\
                    <required>' + required + '</required>\n\
                 </Campo>';

            Data[Data.length] = value;

        });

        xml += '</AddNewRegister>';

        var EnterpriseKey = $.trim($('#newEnterprise_ClaveEmpresa').val());

        if (!RegularExpression.test(EnterpriseKey)) {
            $('#newEnterprise_ClaveEmpresa').attr('title', 'El campo no debe contener espacios y únicamente letras y números');
            $('#newEnterprise_ClaveEmpresa').tooltip();
            return FieldsValidator.AddClassRequiredActive($('#newEnterprise_ClaveEmpresa'));
        }
        else
            FieldsValidator.RemoveClassRequiredActive($('#newEnterprise_ClaveEmpresa'));

        var data = {option: "AddNewRegister", xml: xml};

        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "php/Enterprise.php",
            data: data,
            success: function (xml)
            {
                if ($.parseXML(xml) === null)
                    return errorMessage(xml);
                else
                    xml = $.parseXML(xml);

                if ($(xml).find('AddedNewRecord').length > 0)
                {
                    status = 1;

                    var Mensaje = $(xml).find('Mensaje').text();
                    Notificacion(Mensaje);

                    var IdEnterprise = $(this).find('NewIdEnterprise').text();

                    var ai = EnterpriseDT.row.add(Data).draw();
                    var n = EnterprisedT.fnSettings().aoData[ ai[0] ].nTr;
                    EnterprisedT.find('tr').removeClass('selected');
                    n.setAttribute('class', "selected");
                    n.setAttribute('id', IdEnterprise);

                }

                $(xml).find("Error").each(function ()
                {
                    var $Error = $(this);
                    var mensaje = $Error.find("Mensaje").text();
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

    /**
     * @description Mensaje de confirmación para eliminar una empresa.
     * @returns {unresolved}
     */
    _ConfirmationDeleteEnterprise = function () {
        var EnterpriseSelected = $('#EnterprisesTable tr.selected');
        var IdEnterprise, EnterpriseKey, index, cont = 0;

        if (EnterpriseSelected.length !== 1)
            return Advertencia("Debe seleccionar una empresa");

        var NumColumns = EnterpriseDT.columns().header();
        $(NumColumns).each(function ()
        {
            var ColumnTitle = $(this).html();
            if (ColumnTitle === "ClaveEmpresa")
                index = cont;

            cont++;
        });

        if (index === undefined)
            return Advertencia("No existe el campo ClaveEmpresa, no es posible realizar esta acción");

        EnterprisedT.$('tr.selected').each(function ()
        {
            var position = EnterprisedT.fnGetPosition(this); // getting the clicked row position
            IdEnterprise = $(this).attr('id');
            EnterpriseKey = EnterprisedT.fnGetData(position)[index];
        });

        BootstrapDialog.show({
            title: '<i class="fa fa-exclamation-triangle fa-lg"></i>  Mensaje de Confirmación',
            type: BootstrapDialog.TYPE_DANGER,
            size: BootstrapDialog.SIZE_SMALL,
            message: '<p>¿Realmente desea eliminar la empresa <b>' + EnterpriseKey + '</b>? Esta operación eliminará los repositorios ligados a esta empresa y no puede revertirse.</p><p>¿Desea continuar?</p>',
            closable: true,
            closeByBackdrop: true,
            closeByKeyboard: true,
            buttons: [
                {
                    label: 'Eliminar',
                    icon: 'fa fa-trash-o fa-lg',
                    cssClass: "btn-danger",
                    action: function (dialogRef) {
                        var button = this;
                        button.spin();
                        dialogRef.enableButtons(false);
                        dialogRef.setClosable(false);

                        if (_DeleteEnterprise(IdEnterprise, EnterpriseKey[0]))
                            dialogRef.close();
                        else{
                            dialogRef.enableButtons(true);
                            dialogRef.setClosable(true);
                            button.stopSpin();
                        }

                    }
                },
                {
                    label: "Cerrar",
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                }
            ],
            onshown: function (dialogRef) {

            }
        });

    };

    /**
     * @description Elimina del servidor la empresa seleccionada.
     * @param {type} IdEnterprise
     * @param {type} EnterpriseKey
     * @returns {Number}
     */
    _DeleteEnterprise = function (IdEnterprise, EnterpriseKey)
    {
        var status = 0;

        var data = {option: "DeleteEnterprise", IdEnterprise: IdEnterprise, EnterpriseKey: EnterpriseKey};

        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "php/Enterprise.php",
            data: data,
            success: function (xml)
            {
                $('#IconWaitingEnterprise').remove();

                if ($.parseXML(xml) === null) {
                    Error(xml);
                    return 0;
                } else
                    xml = $.parseXML(xml);

                if ($(xml).find('DeletedEnterprise').length > 0)
                {
                    status = 1;
                    var Mensaje = $(xml).find('Mensaje').text();
                    Notificacion(Mensaje);

                    EnterpriseDT.row('tr.selected').remove().draw(false);
                    EnterprisedT.$('tbody tr:first').click();
                }

                $(xml).find("Error").each(function ()
                {
                    var $Error = $(this);
                    var mensaje = $Error.find("Mensaje").text();
                    Error(mensaje);
                });

            },
            beforeSend: function () {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                Error(textStatus + "<br>" + errorThrown);
            }
        });

        return status;
    };

    _EditEnterprise = function (EnterpriseStructure)
    {
        var content = $('<div>', {id: "editEnterprise"});
        var EnterpriseSelected = $('#EnterprisesTable tr.selected');
        var IdEnterprise, EnterpriseKey, index, RowIndexEnterpriseKey, cont = 0, Data = [];

        if (EnterpriseSelected.length !== 1)
            return Advertencia("Debe seleccionar una empresa");

        /* Índice donde se encuentra la columna ClaveEmpresa */
        var NumColumns = EnterpriseDT.columns().header();
        $(NumColumns).each(function ()
        {
            var ColumnTitle = $(this).html();
            if (ColumnTitle === "ClaveEmpresa")
                index = cont;

            cont++;
        });

        if (index === undefined)
            return Advertencia("No existe el campo ClaveEmpresa, no es posible realizar esta acción");

        EnterprisedT.$('tr.selected').each(function ()
        {
            var position = EnterprisedT.fnGetPosition(this); // getting the clicked row position
            IdEnterprise = $(this).attr('id');
            RowIndexEnterpriseKey = EnterpriseDT.row(position).index();
            EnterpriseKey = EnterprisedT.fnGetData(position)[index];
            for (var cont = 0; cont < NumColumns.length; cont++)
            {
                var FieldValue = EnterprisedT.fnGetData(position)[cont];
                Data[Data.length] = FieldValue[0];
            }
        });

        BootstrapDialog.show({
            title: '<i class="fa fa-pencil fa-lg"></i>  Editando información',
            type: BootstrapDialog.TYPE_INFO,
            size: BootstrapDialog.SIZE_NORMAL,
            message: content,
            closable: true,
            closeByBackdrop: true,
            closeByKeyboard: true,
            buttons: [
                {
                    label: 'Modificar',
                    icon: 'fa fa-pencil fa-lg',
                    cssClass: "btn-warning",
                    action: function (dialogRef) {
                        var button = this;

                        BootstrapDialog.show({
                            title: '<i class="fa fa-exclamation-triangle fa-lg"></i>  Mensaje de Confirmación',
                            type: BootstrapDialog.TYPE_WARNING,
                            size: BootstrapDialog.SIZE_SMALL,
                            message: '<p>¿Desea continuar modificando los datos de la empresa con clave <b>' + EnterpriseKey + '</b>?</p>',
                            closable: true,
                            closeByBackdrop: true,
                            closeByKeyboard: true,
                            buttons: [
                                {
                                    label: 'Modificar',
                                    icon: 'fa fa-pencil fa-lg',
                                    cssClass: "btn-warning",
                                    action: function (dialogModifier) {
                                        dialogRef.enableButtons(false);
                                        dialogRef.setClosable(false);
                                        button.spin();
                                        dialogModifier.close();

                                        if (_ModifyEnterprise(content, IdEnterprise, EnterpriseStructure, RowIndexEnterpriseKey, index, EnterpriseKey))
                                            dialogRef.close();
                                        else{
                                            dialogRef.enableButtons(true);
                                            dialogRef.setClosable(true);
                                            button.stopSpin();
                                        }

                                    }
                                },
                                {
                                    label: "Cerrar",
                                    action: function (dialogRef) {
                                        dialogRef.close();
                                    }
                                }
                            ],
                            onshown: function (dialogRef) {

                            }
                        });

                    }
                },
                {
                    label: "Cerrar",
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                }
            ],
            onshown: function (dialogRef) {
                var designer = new Designer();
                designer.buildFormsStructure(content, EnterpriseStructure);

                var aux = 0;
                $(EnterpriseStructure).find("Campo").each(function ()
                {
                    var $Campo = $(this);
                    var name = $Campo.find("name").text();
                    var type = $Campo.find("type").text();
                    var long = $Campo.find("long").text();
                    var required = $Campo.find("required").text();

                    var FieldValue = Data[aux];
                    $('#editEnterprise_' + name).val(FieldValue);
                    aux++;
                });

                var validation = new ClassFieldsValidator();
                var forms = $(content).find('input');
                validation.InspectCharacters(forms);
            }
        });
    };

    /* 
     * @ColumnIndexEnterpriseKey: Índice de la columna donde se encuentra el campo EnterpriseKey
     * @RowIndexEnterpriseKey: Índice de la fila donde se ubica el campo EnterpriseKey
     * @EnterpriseKey: Representa el inidice de la columna donde se encuentra este campo */

    _ModifyEnterprise = function (content, IdEnterprise, EnterpriseStructure, RowIndexEnterpriseKey, ColumnIndexEnterpriseKey, OriginalEnterpriseKey)
    {
        var status = 0;
        var newData = [];    /* Continue los nuevos datos  modificados por el usuario*/
        var RegularExpresion = /^([a-zA-Z0-9\_])+$/g;

        OriginalEnterpriseKey = String(OriginalEnterpriseKey);
        OriginalEnterpriseKey = OriginalEnterpriseKey.toUpperCase();

        var forms = $(content).find('find');

        var validation = new ClassFieldsValidator();
        var validationResult = validation.ValidateFields(forms);

        if (validationResult === 0)
            return;

        /* Se comprueba que no se duplique la clave de empresa */
        var ColumnValues = EnterpriseDT.column(ColumnIndexEnterpriseKey).data();

        var NewEnterpriseKey = $('#editEnterprise_ClaveEmpresa').val();
        NewEnterpriseKey = String(NewEnterpriseKey);
        NewEnterpriseKey = NewEnterpriseKey.toUpperCase();

        if (!RegularExpresion.test(NewEnterpriseKey))
        {
            validation.AddClassRequiredActive($('#editEnterprise_ClaveEmpresa'));
            $('#editEnterprise_ClaveEmpresa').attr('title', 'Nombre de campo inválido');
            return 0;
        }

        var IfRepeatedEnterpriseKey = strcmp(NewEnterpriseKey, OriginalEnterpriseKey);
        var FlagRepeatedEnterpriseKey = 0;
        if (IfRepeatedEnterpriseKey !== 0)
            $(ColumnValues).each(function ()
            {
                var ExistedEnterpriseKey = $(this)[0];
                ExistedEnterpriseKey = String(ExistedEnterpriseKey);
                ExistedEnterpriseKey = ExistedEnterpriseKey.toLowerCase();

                if (ExistedEnterpriseKey === NewEnterpriseKey)
                    FlagRepeatedEnterpriseKey = 1;

            });

        if (FlagRepeatedEnterpriseKey)
            return Advertencia("La clave de empresa seleccionada ya existe.");

        /* Construcción de XML para enviar al servidor */
        var xml =
                "<ModifyEnterprise version='1.0' encoding='UTF-8'>";

        $(EnterpriseStructure).find("Campo").each(function () {
            var $Campo = $(this);
            var name = $Campo.find("name").text();
            var type = $Campo.find("type").text();
            var long = $Campo.find("long").text();
            var required = $Campo.find("required").text();

            var FieldValue = $('#editEnterprise_' + name).val();

            xml += "\n\
            <Field>\n\
                <FieldName>" + name + "</FieldName> \n\
                <FieldValue>" + FieldValue + "</FieldValue> \n\
                <FieldType>" + type + " </FieldType>\n\
                <RequiredField>" + required + "</RequiredField>  \n\
            </Field>";

            newData[newData.length] = FieldValue;
        });

        xml += "<OldEnterpriseKey>" + OriginalEnterpriseKey + " </OldEnterpriseKey>";
        xml += "<NewEnterpriseKey>" + NewEnterpriseKey + " </NewEnterpriseKey>";


        xml += "</ModifyEnterprise>";

        var data = {option: "ModifyEnterprise", IdEnterprise: IdEnterprise, EnterpriseKey: NewEnterpriseKey, Xml: xml};

        $.ajax({
            async: false,
            cache: false,
            dataType: "html",
            type: 'POST',
            url: "php/Enterprise.php",
            data: data,
            success: function (xml)
            {
                if ($.parseXML(xml) === null)
                    return errorMessage(xml);
                else
                    xml = $.parseXML(xml);

                if ($(xml).find('ModifiedEnterprise').length > 0) {
                    status = 1;
                    var Mensaje = $(xml).find('Mensaje').text();
                    Notificacion(Mensaje);
                    EnterpriseDT.row(RowIndexEnterpriseKey).data(newData).draw();
                }

                $(xml).find("Error").each(function () {
                    var $Error = $(this);
                    var mensaje = $Error.find("Mensaje").text();
                    Error(mensaje);
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

};
