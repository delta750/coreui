/*! Core UI
 *  @description  Core UI Frontend Framework
 *  @version      0.0.1.REL20150213
 *  @copyright    2015 New York State Finance, Regulation & Gaming Cluster
 */

define(["jquery"],function(){var cui={};return cui.namespace=function(namespace,parent){var i,parts=namespace.split(".");for(parent=parent||cui,"cui"===parts[0]&&(parts=parts.slice(1)),i=0;i<parts.length;i+=1)"undefined"==typeof parent[parts[i]]&&(parent[parts[i]]={}),parent=parent[parts[i]];return parent},cui.init=function(){console.log("Loaded cui namespace")},cui});
//# sourceMappingURL=cui.js.map