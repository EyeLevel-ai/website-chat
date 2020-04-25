(function() {
  function openChat() {
    var cw = document.getElementById("eyChat");
    cw.style.display = "block";
    var cb = document.getElementById("eyBubble");
    cb.style.display = "none";
    setTimeout(function() {
      var openE = new Event('toggle', { state: 'open' });
      cw.dispatchEvent(openE);
    }, 200);
  }

  function closeChat() {
    var cw = document.getElementById("eyChat");
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
      var firstScript = document.getElementsByTagName('script')[0];
      var jqs = document.createElement('script');
      jqs.src = 'chat/3rdparty.js';
      firstScript.parentNode.insertBefore(jqs, firstScript);
/*
      var e = document.querySelector('meta[name="referrer"]'),
      t = e ? '<meta name="referrer" content="' + e.content + '">' : "",
      n = document.createElement("iframe");
      n.id = "ey-frame", n.setAttribute("style", "position: absolute !important; opacity: 0 !important; width: 1px !important; height: 1px !important; top: 0 !important; left: 0 !important; border: none !important; display: block !important; z-index: -1 !important;"), n.setAttribute("aria-hidden", "true"), n.setAttribute("tabIndex", "-1"), n.setAttribute("title", "EyeLevel.ai"), document.body.appendChild(n)
*/
      var eb = document.createElement("div");
      eb.id = "eyBubble";
      eb.classList.add("ey-app");
      eb.innerHTML = `<div class="ey-app-container"><div class="ey-app-icon ey-app-active"><svg xmlns="http://www.w3.org/2000/svg" focusable="false" viewBox="0 0 28 32"><path d="M28,32 C28,32 23.2863266,30.1450667 19.4727818,28.6592 L3.43749107,28.6592 C1.53921989,28.6592 0,27.0272 0,25.0144 L0,3.6448 C0,1.632 1.53921989,0 3.43749107,0 L24.5615088,0 C26.45978,0 27.9989999,1.632 27.9989999,3.6448 L27.9989999,22.0490667 L28,22.0490667 L28,32 Z M23.8614088,20.0181333 C23.5309223,19.6105242 22.9540812,19.5633836 22.5692242,19.9125333 C22.5392199,19.9392 19.5537934,22.5941333 13.9989999,22.5941333 C8.51321617,22.5941333 5.48178311,19.9584 5.4277754,19.9104 C5.04295119,19.5629428 4.46760991,19.6105095 4.13759108,20.0170667 C3.97913051,20.2124916 3.9004494,20.4673395 3.91904357,20.7249415 C3.93763774,20.9825435 4.05196575,21.2215447 4.23660523,21.3888 C4.37862552,21.5168 7.77411059,24.5386667 13.9989999,24.5386667 C20.2248893,24.5386667 23.6203743,21.5168 23.7623946,21.3888 C23.9467342,21.2215726 24.0608642,20.9827905 24.0794539,20.7254507 C24.0980436,20.4681109 24.0195551,20.2135019 23.8614088,20.0181333 Z"></path></svg></div></div>`;
      eb.addEventListener("click", openChat);
      document.body.appendChild(eb);
      var es = document.createElement("style");
      es.innerHTML = `
  @keyframes ey-app-container {
    from {
      opacity: 0;
      transform: scale(0.5);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  .ey-app {
    position: fixed;
    z-index: 2147483000;
    width: 0;
    height: 0;
    font-family: "Roboto", "Helvetica Neue", "Apple Color Emoji", Helvetica, Arial, sans-serif;
  }
  .ey-app-container {
    position: fixed;
    z-index: 2147483002;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #3047EC;
    cursor: pointer;
    box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.06), 0 2px 32px 0 rgba(0, 0, 0, 0.16);
    animation: ey-app-container 250ms ease;
  }
  .ey-app-container:focus {
    outline: none;
  }
  .ey-app-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    width: 60px;
    height: 60px;
    transition: transform 100ms linear, opacity 80ms linear;
  }
  .ey-app-active {
        opacity: 1;
        transform: rotate(0deg) scale(1);
  }
  .ey-app-active svg {
    width: 28px;
    height: 32px;
  }
  .ey-app-active svg path {
    fill: rgb(255, 255, 255);
  }
  .ey-app-inactive {
        opacity: 0;
        transform: rotate(-30deg) scale(0);
  }
  .ey-app-inactive svg {
    width: 14px;
    height: 14px;
  }
  .ey-app-inactive svg path {
    fill: rgb(255, 255, 255);
  }`;
      document.body.appendChild(es);

      var n=document.createElement("section");
      n.classList.add("ey-section");
      n.classList.add("ey-chat");
      n.id = "eyChat"
      n.style.display = "none";
      n.innerHTML= `<div class="ey-chat-nav"><div id="eyChatClose" class="ey-close-btn">&#10006;</div></div><div class="ey_result" id="resultWrapper"><table class="ey_result-table"><tr><td id="result"></td></tr></table></div><div class="clearfix"></div><div class="ey_input"><form class="menu" id="agentDemoForm"><div class="menu-icon" id="menuBtn"><img src="chat/menu.png" alt="Menu"></div><div class="main-menu" id="mainMenu"><div class="close-icon"></div><ul class="menu-list" id="menuList"></ul></div><div class="menu-input"><input type="text" name="q" id="query" placeholder="Send a message..."><div class="ey_input-send icon-send" id="ey-send"></div></div></form></div>`;
      document.body.appendChild(n);
      var close = document.getElementById("eyChatClose");
      close.addEventListener("click", closeChat);
      var as = document.createElement('script');
      as.src = 'chat/agent.js';
      firstScript.parentNode.insertBefore(as, firstScript);
      var raf=window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
      raf ? raf(function() {
        window.setTimeout(loadDeferredStyles,0)
      }) : window.addEventListener("load", loadDeferredStyles);

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
