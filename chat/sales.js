try {
  window.eySession = {
    chatVersion: '1.11',
    cssVersion: '1.3',
    cssURL: 'https://css.eyelevel.ai',
    chatURL: 'https://cdn.eyelevel.ai/chat',
  };
  var localChatURL = '/chat';
  var localCssURL = '/css';
  window.eySession.isDev = (window.location.host.indexOf('localhost') > -1 || window.location.host.indexOf('127.0.0.1') > -1) ? true : false;

  function sanitizeChannelID(cid) {
    return cid.replace(':', '').replace('@', '');
  }

  function getQueryVar(vn, isIframe) {
    var qq = window.location.search.substring(1);
    if (isIframe) {
      if (document.referrer && document.referrer.indexOf('?') > -1) {
        qq = document.referrer.substring(document.referrer.indexOf('?'));
        qq = qq.substring(1);
      }
    }
    var vr = qq.split('&');
    for (var i = 0; i < vr.length; i++) {
      var pr = vr[i].split('=');
      if (decodeURIComponent(pr[0]) == vn) {
        return decodeURIComponent(pr[1]);
      }
    }
  }

  function loadEnv(eyEnv) {
    switch(eyEnv) {
      case 'local':
      case 'local-dev':
        window.eySession.cssURL = localCssURL;
        window.eySession.chatURL = localChatURL;
        break;
      case 'local-chat-dev':
        window.eySession.chatURL = localChatURL;
        break;
      case 'local-css-dev':
        window.eySession.cssURL = localCssURL;
        break;
    }
  }

  window.supportsPassive = function() {
    var cold = false,
    hike = function() {};

    try {
      var aid = Object.defineProperty({}, 'passive', {
        get: function() {
          cold = true;
        }
      });
      window.addEventListener('test', hike, aid);
      window.removeEventListener('test', hike, aid);
    } catch (e) {}
    return cold;
  };

  window.initEYScripts = function() {
    var googleScript = document.createElement('script');
    googleScript.src = "https://www.googletagmanager.com/gtag/js?id=" + window.gaid;
    googleScript.async = true;
    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(googleScript, firstScript);
    var googlePixel = document.createElement('script');
    googlePixel.text = "window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '" + window.gaid + "');"
    googlePixel.async = true;
    firstScript.parentNode.insertBefore(googlePixel, firstScript);
    var es1 = document.createElement("script");
    es1.src = window.eySession.chatURL + '/client.js?v=' + window.eySession.chatVersion;
    firstScript.parentNode.insertBefore(es1, firstScript);
    if (window.channelID) {
    var css1 = document.createElement("link");
      css1.rel = "stylesheet";
      css1.href = "https://css.eyelevel.ai/msteams/" + sanitizeChannelID(window.channelID) + "/chat.css";
      firstScript.parentNode.insertBefore(css1, firstScript);
    }
  };

  function randomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  function getWidth() {
    return Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );
  }

  if (!window.localStorage) {
    Object.defineProperty(window, "localStorage", new (function () {
      var aKeys = [], oStorage = {};
      Object.defineProperty(oStorage, "getItem", {
        value: function (sKey) { return sKey ? this[sKey] : null; },
        writable: false,
        configurable: false,
        enumerable: false
      });
      Object.defineProperty(oStorage, "key", {
        value: function (nKeyId) { return aKeys[nKeyId]; },
        writable: false,
        configurable: false,
        enumerable: false
      });
      Object.defineProperty(oStorage, "setItem", {
        value: function (sKey, sValue) {
          if(!sKey) { return; }
          document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
        },
        writable: false,
        configurable: false,
        enumerable: false
      });
      Object.defineProperty(oStorage, "length", {
        get: function () { return aKeys.length; },
        configurable: false,
        enumerable: false
      });
      Object.defineProperty(oStorage, "removeItem", {
        value: function (sKey) {
          if(!sKey) { return; }
          document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        },
        writable: false,
        configurable: false,
        enumerable: false
      });
      this.get = function () {
        var iThisIndx;
        for (var sKey in oStorage) {
          iThisIndx = aKeys.indexOf(sKey);
          if (iThisIndx === -1) { oStorage.setItem(sKey, oStorage[sKey]); }
          else { aKeys.splice(iThisIndx, 1); }
          delete oStorage[sKey];
        }
        for (aKeys; aKeys.length > 0; aKeys.splice(0, 1)) { oStorage.removeItem(aKeys[0]); }
        for (var aCouple, iKey, nIdx = 0, aCouples = document.cookie.split(/\s*;\s*/); nIdx < aCouples.length; nIdx++) {
          aCouple = aCouples[nIdx].split(/\s*=\s*/);
          if (aCouple.length > 1) {
            oStorage[iKey = unescape(aCouple[0])] = unescape(aCouple[1]);
            aKeys.push(iKey);
          }
        }
        return oStorage;
      };
      this.configurable = false;
      this.enumerable = true;
    })());
  }

  (function() {

    function initChat() {
      if (window.eyEnv) {
        loadEnv(window.eyEnv);
      }
      window.initEYScripts();
      if (!window.eySession.isDev) {
        gtag('event', window.location.hostname, { event_category: 'sales_load', version: window.eySession.chatVersion });
      }
      if (!window.WebSocket || !window.addEventListener) {
        if (!window.eySession.isDev) {
          gtag('event', window.location.hostname, { event_category: 'sales_hidden', version: window.eySession.chatVersion });
        }
        return false;
      }
      return true;
    }

    function loadChat(params) {
      window.gaid = (params && params.gaid) || "UA-173447538-1";

      window.channelID = getQueryVar("channelID", false);
      window.agentID = getQueryVar("agentID", false);
      window.origin = getQueryVar("origin", false);
      window.guid = getQueryVar("guid", false);
      var en = getQueryVar("eyenv", false);
      if (en) {
        window.eyEnv = en;
      }

      if (document && document.body) {
	      var ok = initChat();
	      if (!ok) {
          return;
	      }
      } else {
        document.addEventListener('DOMContentLoaded', function () {
          var ok = initChat();
	        if (!ok) {
            return;
	        }
        });
      }

      window.addEventListener("load", function() {
        if (window.eyc) {
          if (window.eyEnv) {
            window.eyc.env = window.eyEnv;
          }
          window.eyc.startChat();
        } else {
          console.error("failed to load EyeLevel chat client");
          if (typeof gtag !== 'undefined' && !window.eySession.isDev) {
            gtag('event', window.location.hostname, { event_category: 'sales_error', event_label: 'chat client load error', version: window.eySession.chatVersion });
          }
        }
      }, true);
    }

    loadChat({});

  })();

} catch(e) {
  console.error(e);
  if (typeof gtag !== 'undefined') {
    gtag('event', window.location.hostname, { event_category: 'sales_error', event_label: (e && e.stack) ? e.stack : e });
  }
}
