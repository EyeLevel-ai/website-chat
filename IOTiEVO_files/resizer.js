/*===============================================*\
|| ############################################# ||
|| # JAKWEB.CH / Version 3.1                   # ||
|| # ----------------------------------------- # ||
|| # Copyright 2018 JAKWEB All Rights Reserved # ||
|| ############################################# ||
\*===============================================*/

var btncont=document.getElementById('lcjframesize');btncont.style.visibility="hidden";var show_content=function(e){if(getHostName(e.origin)!==getHostName(cross_url)){console.log(e.origin);console.log(base_url);return}message=e.data.split("::");if(message[0]=="pageloaded"){if(apply_animation.length!=0)btncont.className+=' '+apply_animation;btncont.style.visibility="visible"}};if(window.addEventListener){window.addEventListener("message",show_content,false)}else if(window.attachEvent){window.attachEvent("onmessage",show_content)}function getHostName(url){var match=url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);if(match!=null&&match.length>2&&typeof match[2]==='string'&&match[2].length>0){return match[2]}else{return null}}function iframe_resize(width,height,position,origurl){if(parent.postMessage){message='iframe_size::'+position+'width:'+width+'px;height:'+height+'px;';parent.postMessage(message,origurl)}}