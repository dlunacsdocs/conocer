/* global TableEnginedT, TableContentdT, DownloadTabledT */

/*******************************************************************************
 * 
 * Obtiene las propiedades de un documento de acuerdo al origen de donde esta siendo 
 * consultado p.e. desde el content, resultado de una búsqueda, etc. :
 * 
 *  Propiedades devueltas
 *  
 *      Nombre
 *      IdFile
 *      IdRepository
 *      IdEmpresa
 *      Tipo
 *      
 * @Souder: Origen de donde serán tomados los valores
 * @IdGlobal:   Tabla Global
 * @IdFile:     Id del documento en su repositorio
 */
var ClassDocumentEnvironment = function(Source, IdGlobal, IdFile)
{
    var self = this;
    this.Source = Source;
    this.IdGlobal = IdGlobal;
    this.IdFile = IdFile;
    this.IdRepository = 0;
    this.RepositoryName = undefined;
    this.IdEnterprise = 0;
    this.EnterpriseKey = null;
    this.EnterpriseName = undefined;
    this.FileName = undefined;
    this.FileRoute = undefined;
    this.FileType = undefined;
    
    this.GetProperties = function()
    {
        switch (self.Source)
        {
            case 'Content':
                self.GetPropertiesFromContent();                   
            break;
        }
    };
    
    this.GetPropertiesFromContent = function()
    {        
        console.log('GetPropertiesFromContent');
       var active = $("#tabsContent li").index($("#tabsContent li.active"));

       switch(active)
       {
            case 0:
               $('#table_DetailResult tr[id='+ IdFile +']').each(function()
               {                
                   var position = TableContentdT.fnGetPosition(this); // getting the clicked row position  
                   var _IdFile = $('#table_DetailResult tr.selected').attr('id');
                   self.FileName = TableContentdT.fnGetData(position)[0];        
                   self.FileType = TableContentdT.fnGetData(position)[2];
                   self.FileRoute = TableContentdT.fnGetData(position)[6];
                   self.IdRepository = $('#CM_select_repositorios option:selected').attr('idrepository');
                   self.RepositoryName = $('#CM_select_repositorios option:selected').attr('repositoryname');  
                   self.EnterpriseKey = $('#CM_select_empresas option:selected').attr('value');
                   self.IdEnterprise = $('#CM_select_empresas option:selected').attr('id');
//                   console.log(self.FileRoute+" "+self.FileName+" "+self.RepositoryName+' '+self.IdRepository);
               }); 
                break;

            case 1:        
               $('#table_EngineResult tr[id='+ this.IdGlobal +']').each(function()
               {
                    var position = TableEnginedT.fnGetPosition(this); // getting the clicked row position  
                   var _IdFile = TableEnginedT.fnGetData(position)[9];
                   self.FileName = TableEnginedT.fnGetData(position)[2];
                   self.RepositoryName = TableEnginedT.fnGetData(position)[1];
                   self.IdRepository = TableEnginedT.fnGetData(position)[11];
                   self.FileRoute = TableEnginedT.fnGetData(position)[8];
               }); 
                break;
                
            default: return 0;
       }
//       console.dialog(self.FileRoute+" "+self.FileName+" "+self.RepositoryName+' '+self.IdRepository);
    
    };        
};

