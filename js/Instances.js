/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var userPermissions = [];
var modulesControl = new ModulesControlClass();
var EnvironmentData = new ClassEnvironmentData();
var Repository = new ClassRepository();
var Enterprise = new ClassEnterprise();
var Tree = new ClassTree();
var Notes;    
var DocumentEnvironment;    /* Guarda el entorno donde fué consultado un documento p.e. IdRepository, RepositoryName, IdEnterprise, EnterpriseName */

/* Modulos */
var archival;
var documentaryDisposition;
var documentaryValidity;
var legalFoundation;
var administrativeUnit;
var Expedient;
