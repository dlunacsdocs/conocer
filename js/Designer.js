/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global GlobalDatePicker */

/*******************************************************************************
 * 
 * @returns {undefined}
 * Se obtiene la estructura de generada por el usuario
 * 
 * 
 *******************************************************************************/
function GeStructure(TypeStructure)
{
    var DataBaseName=$('#database_name').val();
    var xml = undefined;
        $.ajax({
          async:false, 
          cache:false,
          dataType:"html", 
          type: 'POST',   
          url: "php/DesignerForms.php",
          data: "opcion=GetStructure&DataBaseName="+DataBaseName+"&TypeStructure="+TypeStructure, 
          success:  function(respuesta){
              if($.parseXML( respuesta )===null){Error(respuesta); return 0;}else xml=$.parseXML( respuesta );  
              
              $(xml).find('Error').each(function()
              {
                  var Mensaje = $(this).find('Mensaje').text();
                  Error(Mensaje);
                  xml = undefined;
              });
          },
          beforeSend:function(){},
          error:function(objXMLHttpRequest){Error(objXMLHttpRequest);}
        });
    return xml;
}

function GetAllStructure(TypeStructure)
{
    var DataBaseName=$('#database_name').val();
    var xml;
        $.ajax({
          async:false, 
          cache:false,
          dataType:"html", 
          type: 'POST',   
          url: "php/DesignerForms.php",
          data: "opcion=GetAllStructure&DataBaseName="+DataBaseName+"&TypeStructure="+TypeStructure, 
          success:  function(respuesta){
              if($.parseXML( respuesta )===null){Error(respuesta); return 0;}else xml=$.parseXML( respuesta );                         
          },
          beforeSend:function(){},
          error:function(objXMLHttpRequest){Error(objXMLHttpRequest);}
        });
    return xml;
}


/*
 * /********************************************************************************
 * Obtiene la estructura de la tabla del repositorio seleccionado
 * @param {type} NombreRepositorio,Detalle
 * Detalle= (1/0) 1= dibuja en la tabla de presentacion de datos al usuario el detalle de cada campo 
 *              (Log, type, required). 0=muestra solo el nombre del campo y los forms para el llenado de datos
 *              
 * @param {type} NombreRepositorio
 * @param {type} tabla
 * @param {type} Detalle
 * @returns {Estructuraxmlseleccionada|undefined|XMLDocument}
 */
function SetTableStructura(NombreRepositorio,tabla,Detalle)
{
    var xml=GeStructure(NombreRepositorio);
    if(xml==0 || xml==null || xml=='undefined'){return;}    
    $(xml).find("Campo").each(function()
        {               
           var $Campo=$(this);
           var tipo=$Campo.find("tipo").text();
           if(tipo.length>0){$('.P_TipoCatalogo').remove();$('#'+tabla).append('<td class="P_TipoCatalogo">Tipo de Catálogo </td><td><b>'+tipo+'</b></td>'); return;}/* Cuando es un catálogo */
           var name=$Campo.find("name").text();
           var type=$Campo.find("type").text();
           var length=$Campo.find("long").text();
           var required=$Campo.find("required").text();           
           
           var Required='';
           if(required === "true" || required === true)
               Required=" Si";
           else
               Required=" No";
           
           var id='_'+name;   /* Id que contendrá cada elemento recuperado */
           if(Detalle==1)
           {
               $('#'+tabla).append('<tr><td>'+name+'</td>\n\
                <td>'+type+'</td>\n\
                <td>'+length+'</td>\n\
                <td>'+Required+'</td>\n\
                </tr>');
                if(type==='DATE'){$('#'+id).datepicker(GlobalDatePicker);}
                if(type==='date'){$('#'+id).datepicker(GlobalDatePicker);}
           }
           else
           {
               $('#'+tabla).append('<tr><td>'+name+'</td><td><input type="text" id="'+id+'" class = "FormStandart" FieldType = "'+ type +'" FieldLength = "'+length+'"></td></tr>');  
               if(type==='DATE'){$('#'+id).datepicker(GlobalDatePicker);}
               if(type==='date'){$('#'+id).datepicker(GlobalDatePicker);}
               
               if(required === "true" || required === true)
               {
                   $('#'+id).addClass('required');
               }           
//               console.log($('#'+id));
           }
                      
        });                
       
   $(xml).find("Error").each(function()
    {
        var $Instancias=$(this);
        var estado=$Instancias.find("Estado").text();
        var mensaje=$Instancias.find("Mensaje").text();
        Error(mensaje);
    });
    
    return xml;
}

function BuildFullStructureTable(NombreRepositorio,tabla,Detalle)
{
    var xml=GetAllStructure(NombreRepositorio);
    if(xml==0 || xml==null || xml=='undefined'){return;}    
    $(xml).find("Campo").each(function()
        {               
           var $Campo=$(this);
           var tipo=$Campo.find("tipo").text();
           if(tipo.length>0){$('.P_TipoCatalogo').remove();$('#'+tabla).append('<td class="P_TipoCatalogo">Tipo de Catálogo </td><td><b>'+tipo+'</b></td>'); return;}/* Cuando es un catálogo */
           var name=$Campo.find("name").text();
           var type=$Campo.find("type").text();
           var length=$Campo.find("long").text();
           var required=$Campo.find("required").text();           
           
           var Required='';
           if(required === "true" || required === true)
               Required=" Si";
           else
               Required=" No";
           
           var id=tabla+'_'+name;   /* Id que contendrá cada elemento recuperado */
           if(Detalle==1)
           {
               $('#'+tabla).append('<tr><td>'+name+'</td>\n\
                <td>'+type+'</td>\n\
                <td>'+length+'</td>\n\
                <td>'+Required+'</td>\n\
                </tr>');
                if(type==='DATE'){$('#'+id).datepicker(GlobalDatePicker);}
                if(type==='date'){$('#'+id).datepicker(GlobalDatePicker);}
           }
           else
           {
               $('#'+tabla).append('<tr><td>'+name+'</td><td><input type="text" id="'+id+'" name = "'+ name +'" class = "FormStandart" FieldType = "'+ type +'" FieldLength = "'+length+'"></td></tr>');  
               if(type==='DATE'){$('#'+id).datepicker(GlobalDatePicker);}
               if(type==='date'){$('#'+id).datepicker(GlobalDatePicker);}
               
               if(required === "true" || required === true)
               {
                   $('#'+id).addClass('required');
               }           
//               console.log($('#'+id));
           }
                      
        });                
       
   $(xml).find("Error").each(function()
    {
        var $Instancias=$(this);
        var estado=$Instancias.find("Estado").text();
        var mensaje=$Instancias.find("Mensaje").text();
        Error(mensaje);
    });
    
    return xml;
}

