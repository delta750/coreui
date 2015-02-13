/*! Core UI
 *  @description  Core UI Frontend Framework
 *  @version      0.0.1.REL20150213
 *  @copyright    2015 New York State Finance, Regulation & Gaming Cluster
 */

cui.namespace("environment"),cui.environment=function(){var IMAGE_PATHS={core:"../images/core/",components:"../../../../images/dist/components/",skin:"../images/skin/",template:"../images/template/"},SPACE=" ",_decodeURL=function(string){return decodeURIComponent(string.replace(/\+/g,SPACE))},_encodeURL=function(string){return encodeURIComponent(string).replace(/%20/g,"+")},_getQueryStringParameter=function(parameterName,url){var index=0,queryString="",parameters=[],i=0,tokens=[];if(url=url||self.location.href,index=url.indexOf("?"),index>-1)for(queryString=url.substring(index+1),index=queryString.indexOf("#"),index>-1&&(queryString=url.substring(0,index)),parameters=queryString.split("&"),i=parameters.length;(i-=1)>=0;)if(tokens=parameters[i].split("="),tokens.length>=2&&tokens[0]===parameterName)return _decodeURL(tokens[1]);return null},_getImagesPath=function(category){return IMAGE_PATHS[category]};return{decodeURL:_decodeURL,encodeURL:_encodeURL,getImagesPath:_getImagesPath,getQueryStringParameter:_getQueryStringParameter}}();
//# sourceMappingURL=environment.js.map