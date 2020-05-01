(function() {
  function openChat() {
    var cw = document.getElementById("eySection");
    cw.style.display = "block";
    var cb = document.getElementById("eyBubble");
    cb.style.display = "none";
    setTimeout(function() {
      var is = document.getElementById("eyFrame");
      is = is.contentWindow || ( is.contentDocument.document || is.contentDocument);
      is.postMessage("toggle", "*");
    }, 200);
  }

  function closeChat() {
    var cw = document.getElementById("eySection");
    cw.style.display = "none";
    var cb = document.getElementById("eyBubble");
    cb.style.display = "block";
  }

  function loadDeferredStyles() {
    var n=document.createElement("div");
    n.innerHTML= "<link href='https://fonts.googleapis.com/css?family=Roboto:400,300&subset=latin,cyrillic' rel='stylesheet' type='text/css'><link href='chat/chat.css' rel='stylesheet' type='text/css'>";
    document.body.appendChild(n);
  }

  var eyelevel = {
    init: function(username) {
      if (!window.WebSocket || !window.addEventListener) {
        return;
      }
      var eb = document.createElement("section");
      eb.id = "eyBubble";
      eb.classList.add("ey-app");
      eb.innerHTML = `<iframe id="eyAppFrame" class="ey-app-container ey-iframe"></iframe>`;
      document.body.appendChild(eb);
      var isn = document.getElementById("eyAppFrame");
      isn = isn.contentWindow || ( isn.contentDocument.document || isn.contentDocument);
      isn.document.open();
      isn.document.write(`<html><head><base target="_parent"></base><style>body{overflow:hidden;}.ey-app-active{opacity:1;transform:rotate(0) scale(1)}.ey-app-inactive{opacity:0;transform:rotate(-30deg) scale(0)}</style></head><body><div class="ey-app-icon ey-app-active"><svg width="90px" height="90px" viewBox="0 0 70 70" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><rect id="path-1" x="0" y="0" width="52" height="52" rx="8"></rect><filter x="-27.9%" y="-24.0%" width="155.8%" height="155.8%" filterUnits="objectBoundingBox" id="filter-2"><feMorphology radius="1" operator="dilate" in="SourceAlpha" result="shadowSpreadOuter1"></feMorphology><feOffset dx="0" dy="2" in="shadowSpreadOuter1" result="shadowOffsetOuter1"></feOffset><feGaussianBlur stdDeviation="3.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur><feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.354102928 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix></filter></defs><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="Group-5" transform="translate(9.000000, 7.000000)"><g id="Rectangle"><use fill="black" fill-opacity="1" filter="url(#filter-2)" xlink:href="#path-1"></use><use fill="#FFFFFF" fill-rule="evenodd" xlink:href="#path-1"></use></g><path d="M39.0239411,10.4 L12.9760589,10.4 C10.5914328,10.4 8.66666667,12.3002964 8.66666667,14.6546066 L8.66666667,31.6730331 C8.66666667,34.0271542 10.5914328,35.9276397 12.9760589,35.9276397 L14.412523,35.9276397 L14.412523,40.1822464 C14.412523,41.2068502 15.4870939,41.9488536 16.5384899,41.4302643 C16.5672192,41.4019003 16.6247735,41.4019003 16.6535028,41.3734417 C24.5555875,36.1416937 22.7846188,37.3082123 24.5540552,36.1544575 C24.7837937,36.0126373 25.0423573,35.9276397 25.3296501,35.9276397 L39.0239411,35.9276397 C41.4085672,35.9276397 43.3333333,34.0271542 43.3333333,31.6730331 L43.3333333,14.6546066 C43.3333333,12.3002964 41.4085672,10.4 39.0239411,10.4 Z M35.4423573,27.4184265 L23.759116,27.4184265 C21.8655691,27.4184265 21.8578122,24.5820221 23.759116,24.5820221 L35.4423573,24.5820221 C37.3359042,24.5820221 37.3436611,27.4184265 35.4423573,27.4184265 Z M36.1510129,21.7456177 L15.8489871,21.7456177 C13.9554401,21.7456177 13.9476832,18.9092132 15.8489871,18.9092132 L36.1510129,18.9092132 C38.0445599,18.9092132 38.0523168,21.7456177 36.1510129,21.7456177 Z" id="Shape" fill="#6897CD" fill-rule="nonzero" transform="translate(26.000000, 26.000000) scale(-1, 1) translate(-26.000000, -26.000000) "></path></g></g></svg></div></body></html>`);
      isn.document.close();
      isn.addEventListener("click", openChat);
      var ebn = document.getElementById("eyBubble");
      ebn.addEventListener("click", openChat);

			var es = document.createElement("style");
      es.innerHTML = `
@keyframes ey-app-container{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}.ey-app-container{position:absolute;width:100%;height:100%;z-index:2147483002;cursor:pointer;animation:ey-app-container 250ms ease}.ey-app-container:focus{outline:0}
.ey-app{position:fixed;z-index:2147483000;bottom:20px;right:20px;width:100px;height:100px;font-family:Roboto,"Helvetica Neue","Apple Color Emoji",Helvetica,Arial,sans-serif}
.ey-iframe{font-size:100%;font-style:normal;letter-spacing:normal;font-stretch:normal;font-weight:400;text-align-last:initial;text-indent:0;text-shadow:none;text-transform:none;alignment-baseline:baseline;animation-play-state:running;backface-visibility:visible;background-color:transparent;background-image:none;baseline-shift:baseline;bottom:auto;-webkit-box-decoration-break:slice;box-shadow:none;box-sizing:content-box;caption-side:top;clear:none;clip:auto;color:inherit;column-count:auto;column-fill:balance;column-gap:normal;column-width:auto;content:normal;counter-increment:none;counter-reset:none;cursor:auto;direction:ltr;display:inline;dominant-baseline:auto;empty-cells:show;float:none;-webkit-hyphenate-character:auto;hyphens:manual;image-rendering:auto;left:auto;line-height:inherit;max-height:none;max-width:none;min-height:0;min-width:0;opacity:1;orphans:2;outline-offset:0;page:auto;perspective:none;perspective-origin:50% 50%;pointer-events:auto;position:static;quotes:none;resize:none;right:auto;size:auto;table-layout:auto;top:auto;transform:none;transform-origin:50% 50% 0;transform-style:flat;unicode-bidi:normal;vertical-align:baseline;white-space:normal;widows:2;word-break:normal;word-spacing:normal;overflow-wrap:normal;text-align:start;-webkit-font-smoothing:antialiased;font-variant:normal;text-decoration:none;border-width:0;border-style:none;border-color:transparent;border-image:initial;border-radius:0;list-style:outside none disc;margin:0;overflow:hidden;padding:0;page-break-after:auto;page-break-before:auto;page-break-inside:auto}
.ey-container{height:100%;width:100%;}
.ey-section{display:block;width:100%;height:100%;position:fixed;top:0;left:0;right:0;bottom:0;z-index:2000000000}
@media(min-width: 451px){
.ey-section{width:376px;min-height:250px;max-height:704px;bottom:25px;top:auto;left:auto;right:25px;box-shadow:rgba(0, 0, 0, 0.35) 0px 5px 40px;opacity:1;height:calc(100% - 120px);border-radius: 8px;overflow: hidden;}
}
`;
      document.body.appendChild(es);

      var sn = document.createElement("section");
      sn.classList.add("ey-section");
      sn.id = "eySection";
      sn.style.display = "none";
      sn.innerHTML = `<iframe id="eyFrame" class="ey-container ey-iframe"></iframe>`;
      document.body.appendChild(sn);
      var is = document.getElementById("eyFrame");
      is = is.contentWindow || ( is.contentDocument.document || is.contentDocument);
      is.document.open();
      is.document.write(`<html><head><base target="_parent"></base><script>window.username = "${username}";</script><script src="chat/3rdparty.js"></script><link href="https://fonts.googleapis.com/css?family=Roboto:400,300&subset=latin,cyrillic" rel="stylesheet" type="text/css"><link href="chat/chat.css" rel="stylesheet" type="text/css"></head><body><div class="ey-chat" id="eyChat"><div class="ey-chat-nav"><div id="eyChatClose" class="ey-close-btn">&#10006;</div></div><div class="ey_result" id="resultWrapper"><table class="ey_result-table"><tr><td id="result"></td></tr></table></div><div class="clearfix"></div><div class="ey_input"><form class="menu" id="agentDemoForm"><div class="menu-icon" id="menuBtn"><img src="chat/menu.png" alt="Menu"></div><div class="main-menu" id="mainMenu"><div class="close-icon"></div><ul class="menu-list" id="menuList"></ul></div><div class="menu-input"><input type="text" name="q" id="query" placeholder="Send a message..."><div class="ey_input-send icon-send" id="ey-send"></div></div></form></div><script>window.onload = function() { var as = document.createElement("script"); as.src = "chat/agent.js"; document.body.appendChild(as); }</script></body></html>`);
      is.document.close();
      window.addEventListener("message", function(e) {
        if (e.data && e.data === 'toggle') {
          closeChat();
        }
			}, true);
//      var close = document.getElementById("eyChatClose");
//      close.addEventListener("click", closeChat);
    },
  };
  var execute = function() {
    var command = window.eyelevel.shift();
    var func = command[0];
    var parameters = command[1];
    if (typeof eyelevel[func] === 'function') {
      eyelevel[func].call(window, parameters);
    } else {
      console.error("Invalid function specified: " + func);
    }
  };
  execute();
})();
