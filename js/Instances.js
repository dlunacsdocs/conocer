/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var EnvironmentData = new ClassEnvironmentData();
var Repository = new ClassRepository();
var Enterprise = new ClassEnterprise();
var Tree = new ClassTree();
var UsersGroups = new ClassUsersGroups();
var Users = new ClassUsers();
var FollowUp = new ClassFollowUp();
var Permissions = new ClassPermissions();
var Notes;    
var DocumentEnvironment;    /* Guarda el entorno donde fué consultado un documento p.e. IdRepository, RepositoryName, IdEnterprise, EnterpriseName */
var CatalogAdmin = new ClassCatalogAdministrator();  /* Instancia utilizada para la administración de los catálogos (CatalogAdministrator.js) */
var CatalogContent = new ClassCatalogAdministrator();  /* Clase utilizada para operaciones del Content p.e. Visualizar metadatos de un documento */
