function randomString(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
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
//window.localStorage.removeItem('eyelevel.conversation.history');
window.getUser = function() {
  var userId = window.localStorage.getItem('eyelevel.user.userId');
  var newUser = false;
  if (!userId) {
    newUser = true;
    userId = randomString(32);
    window.localStorage.setItem('eyelevel.user.userId', userId);
  }
  return { userId: userId, newUser: newUser };
}

saveInteraction = function(interaction) {
return;
  var h = window.localStorage.getItem('eyelevel.conversation.history');
	var history = JSON.parse(h);
  if (history) {
    history.push(interaction)
  } else {
    history = [interaction];
  }
  window.localStorage.setItem('eyelevel.conversation.history', JSON.stringify(history));
}

retrieveInteractions = function() {
  return JSON.parse(window.localStorage.getItem('eyelevel.conversation.history'));
}

var user = window.getUser();
window.isChatting = false;
window.menu = null;

!function(e) {
    function n(r) {
        if (t[r]) return t[r].exports;
        var o = t[r] = {
            i: r,
            l: !1,
            exports: {}
        };
        return e[r].call(o.exports, o, o.exports, n), o.l = !0, o.exports
    }
    var t = {};
    n.m = e, n.c = t, n.i = function(e) {
        return e
    }, n.d = function(e, t, r) {
        n.o(e, t) || Object.defineProperty(e, t, {
            configurable: !1,
            enumerable: !0,
            get: r
        })
    }, n.n = function(e) {
        var t = e && e.__esModule ? function() {
            return e.default
        } : function() {
            return e
        };
        return n.d(t, "a", t), t
    }, n.o = function(e, n) {
        return Object.prototype.hasOwnProperty.call(e, n)
    }, n.p = "/api-client/js/bundles", n(n.s = 79)
}([function(e, n, t) {
    var r = t(30)("wks"),
        o = t(33),
        i = t(1).Symbol,
        a = "function" == typeof i;
    (e.exports = function(e) {
        return r[e] || (r[e] = a && i[e] || (a ? i : o)("Symbol." + e))
    }).store = r
}, function(e, n) {
    var t = e.exports = "undefined" != typeof window && window.Math == Math ? window : "undefined" != typeof self && self.Math == Math ? self : Function("return this")();
    "number" == typeof __g && (__g = t)
}, function(e, n) {
    var t = e.exports = {
        version: "2.4.0"
    };
    "number" == typeof __e && (__e = t)
}, function(e, n, t) {
    var r = t(11);
    e.exports = function(e) {
        if (!r(e)) throw TypeError(e + " is not an object!");
        return e
    }
}, function(e, n, t) {
    e.exports = !t(25)(function() {
        return 7 != Object.defineProperty({}, "a", {
            get: function() {
                return 7
            }
        }).a
    })
}, function(e, n, t) {
    var r = t(7),
        o = t(29);
    e.exports = t(4) ? function(e, n, t) {
        return r.f(e, n, o(1, t))
    } : function(e, n, t) {
        return e[n] = t, e
    }
}, function(e, n) {
    e.exports = {}
}, function(e, n, t) {
    var r = t(3),
        o = t(47),
        i = t(68),
        a = Object.defineProperty;
    n.f = t(4) ? Object.defineProperty : function(e, n, t) {
        if (r(e), n = i(n, !0), r(t), o) try {
            return a(e, n, t)
        } catch (e) {}
        if ("get" in t || "set" in t) throw TypeError("Accessors not supported!");
        return "value" in t && (e[n] = t.value), e
    }
}, function(e, n) {
    var t = {}.toString;
    e.exports = function(e) {
        return t.call(e).slice(8, -1)
    }
}, function(e, n, t) {
    var r = t(14);
    e.exports = function(e, n, t) {
        if (r(e), void 0 === n) return e;
        switch (t) {
            case 1:
                return function(t) {
                    return e.call(n, t)
                };
            case 2:
                return function(t, r) {
                    return e.call(n, t, r)
                };
            case 3:
                return function(t, r, o) {
                    return e.call(n, t, r, o)
                }
        }
        return function() {
            return e.apply(n, arguments)
        }
    }
}, function(e, n) {
    var t = {}.hasOwnProperty;
    e.exports = function(e, n) {
        return t.call(e, n)
    }
}, function(e, n) {
    e.exports = function(e) {
        return "object" == typeof e ? null !== e : "function" == typeof e
    }
}, function(e, n, t) {
    "use strict";
    n.__esModule = !0, n.default = function(e, n) {
        if (!(e instanceof n)) throw new TypeError("Cannot call a class as a function")
    }
}, function(e, n, t) {
    "use strict";
    n.__esModule = !0;
    var r = t(38),
        o = function(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }(r);
    n.default = function() {
        function e(e, n) {
            for (var t = 0; t < n.length; t++) {
                var r = n[t];
                r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), (0, o.default)(e, r.key, r)
            }
        }
        return function(n, t, r) {
            return t && e(n.prototype, t), r && e(n, r), n
        }
    }()
}, function(e, n) {
    e.exports = function(e) {
        if ("function" != typeof e) throw TypeError(e + " is not a function!");
        return e
    }
}, function(e, n) {
    e.exports = function(e) {
        if (void 0 == e) throw TypeError("Can't call method on  " + e);
        return e
    }
}, function(e, n, t) {
    var r = t(11),
        o = t(1).document,
        i = r(o) && r(o.createElement);
    e.exports = function(e) {
        return i ? o.createElement(e) : {}
    }
}, function(e, n, t) {
    var r = t(1),
        o = t(2),
        i = t(9),
        a = t(5),
        u = function(e, n, t) {
            var s, c, l, f = e & u.F,
                p = e & u.G,
                d = e & u.S,
                h = e & u.P,
                v = e & u.B,
                g = e & u.W,
                m = p ? o : o[n] || (o[n] = {}),
                y = m.prototype,
                b = p ? r : d ? r[n] : (r[n] || {}).prototype;
            p && (t = n);
            for (s in t)(c = !f && b && void 0 !== b[s]) && s in m || (l = c ? b[s] : t[s], m[s] = p && "function" != typeof b[s] ? t[s] : v && c ? i(l, r) : g && b[s] == l ? function(e) {
                var n = function(n, t, r) {
                    if (this instanceof e) {
                        switch (arguments.length) {
                            case 0:
                                return new e;
                            case 1:
                                return new e(n);
                            case 2:
                                return new e(n, t)
                        }
                        return new e(n, t, r)
                    }
                    return e.apply(this, arguments)
                };
                return n.prototype = e.prototype, n
            }(l) : h && "function" == typeof l ? i(Function.call, l) : l, h && ((m.virtual || (m.virtual = {}))[s] = l, e & u.R && y && !y[s] && a(y, s, l)))
        };
    u.F = 1, u.G = 2, u.S = 4, u.P = 8, u.B = 16, u.W = 32, u.U = 64, u.R = 128, e.exports = u
}, function(e, n, t) {
    var r = t(7).f,
        o = t(10),
        i = t(0)("toStringTag");
    e.exports = function(e, n, t) {
        e && !o(e = t ? e : e.prototype, i) && r(e, i, {
            configurable: !0,
            value: n
        })
    }
}, function(e, n, t) {
    var r = t(30)("keys"),
        o = t(33);
    e.exports = function(e) {
        return r[e] || (r[e] = o(e))
    }
}, function(e, n) {
    var t = Math.ceil,
        r = Math.floor;
    e.exports = function(e) {
        return isNaN(e = +e) ? 0 : (e > 0 ? r : t)(e)
    }
}, function(e, n, t) {
    var r = t(49),
        o = t(15);
    e.exports = function(e) {
        return r(o(e))
    }
}, function(e, n, t) {
    "use strict";
    var r = t(12),
        o = t.n(r),
        i = t(13),
        a = t.n(i),
        u = function() {
            function e() {
                o()(this, e), this.workplace = document, this.body = document.body, this.queryInput = this.workplace.getElementById(e.QUERY_INPUT_ID), this.chatWindow = this.workplace.getElementById(e.CHAT_WINDOW_ID), this.closeWindow = this.workplace.getElementById(e.CLOSE_WINDOW_ID), this.queryResult = this.workplace.getElementById(e.QUERY_RESULT_ID), this.queryResultWrapper = this.workplace.getElementById(e.QUERY_RESULT_WRAPPER_ID), this.sendBtn = this.workplace.getElementById(e.QUERY_SEND_ID), this.chatForm = this.workplace.getElementById(e.CHAT_FORM_ID), this.menuList = this.workplace.getElementById(e.MENU_LIST_ID), this.menuButton = this.workplace.getElementById(e.MENU_BUTTON_ID), this.mainMenu = this.workplace.getElementById(e.MAIN_MENU_ID), this.menuHeight = void 0
            }
            return a()(e, [{
                key: "startWelcome",
                value: function(ben) {
                  setTimeout(function() {
                    ben.handleEvent('startWelcome', 'startWelcome');
                    return
                  }, 0);
                }
            }, {
                key: "getSendInput",
                value: function() {
                    return this.sendBtn
                }
            }, {
                key: "getQueryResultWrapper",
                value: function() {
                    return this.queryResultWrapper
                }
            }, {
                key: "getBody",
                value: function() {
                    return this.body
                }
            }, {
                key: "setMenuHeight",
                value: function() {
                    this.mainMenu.style.height = 'auto';
                    this.menuHeight = this.mainMenu.offsetHeight;
                    this.mainMenu.removeAttribute('style');
                }
            }, {
                key: "getChatForm",
                value: function() {
                    return this.chatForm
                }
            }, {
                key: "getMainMenu",
                value: function() {
                    return this.mainMenu
                }
            }, {
                key: "getMenuHeight",
                value: function() {
                    return this.menuHeight + 2
                }
            }, {
                key: "getMenuList",
                value: function() {
                    return this.menuList
                }
            }, {
                key: "getMenuButton",
                value: function() {
                    return this.menuButton
                }
            }, {
                key: "getQueryInput",
                value: function() {
                    return this.queryInput
                }
            }, {
                key: "getWorkplace",
                value: function() {
                    return this.workplace
                }
            }, {
                key: "getCloseWindow",
                value: function() {
                    return this.closeWindow
                }
            }, {
                key: "getChatWindow",
                value: function() {
                    return this.chatWindow
                }
            }, {
                key: "getInputValue",
                value: function() {
                    return this.queryInput.value
                }
            }, {
                key: "setInputValue",
                value: function(e) {
                    return this.queryInput.value = e, this
                }
            }, {
                key: "addUserRequestNode",
                value: function(n) {
                    var t = this.workplace.createElement("div");
                    return t.className = e.CLASS_USER_REQUEST, t.innerHTML = n, this.queryResult.appendChild(t), this
                }
            }, {
                key: "setErrorOnNode",
                value: function(n, t) {
                    return t.innerHTML = n, t.className += " " + e.CLASS_SERVER_RESPONSE_ERROR, t
                }
            }, {
                key: "handleStartSend",
                value: function() {
                    return this.sendBtn.className += " " + e.CLASS_SEND_ACTIVE, this
                }
            }, {
                key: "handleStopSend",
                value: function() {
                    var n = new RegExp("(?:^|\\s)" + e.CLASS_SEND_ACTIVE + "(?!\\S)", "gi");
                    return this.sendBtn.className = this.sendBtn.className.replace(n, ""), this
                }
            }, {
                key: "markBodyAsMobile",
                value: function() {
                    this.body.className += "mobile"
                }
            }], [{
                key: "showNode",
                value: function(e) {
                    e.style.display = "block"
                }
            }]), e
        }();
    n.a = u, u.QUERY_INPUT_ID = "query", u.QUERY_RESULT_ID = "result", u.QUERY_RESULT_WRAPPER_ID = "resultWrapper", u.MENU_LIST_ID = "menuList", u.CHAT_WINDOW_ID = "eyChat", u.CLOSE_WINDOW_ID = "eyChatClose", u.MENU_BUTTON_ID = "menuBtn", u.MAIN_MENU_ID = "mainMenu", u.CHAT_FORM_ID = "agentDemoForm", u.QUERY_SEND_ID = "ey-send", u.CLASS_SEND_ACTIVE = "active", u.CLASS_USER_REQUEST = "user-request", u.CLASS_SERVER_RESPONSE_ERROR = "server-response-error"
}, function(e, n, t) {
    var r = t(8),
        o = t(0)("toStringTag"),
        i = "Arguments" == r(function() {
            return arguments
        }()),
        a = function(e, n) {
            try {
                return e[n]
            } catch (e) {}
        };
    e.exports = function(e) {
        var n, t, u;
        return void 0 === e ? "Undefined" : null === e ? "Null" : "string" == typeof(t = a(n = Object(e), o)) ? t : i ? r(n) : "Object" == (u = r(n)) && "function" == typeof n.callee ? "Arguments" : u
    }
}, function(e, n) {
    e.exports = "constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")
}, function(e, n) {
    e.exports = function(e) {
        try {
            return !!e()
        } catch (e) {
            return !0
        }
    }
}, function(e, n, t) {
    e.exports = t(1).document && document.documentElement
}, function(e, n, t) {
    "use strict";
    var r = t(28),
        o = t(17),
        i = t(62),
        a = t(5),
        u = t(10),
        s = t(6),
        c = t(52),
        l = t(18),
        f = t(58),
        p = t(0)("iterator"),
        d = !([].keys && "next" in [].keys()),
        h = function() {
            return this
        };
    e.exports = function(e, n, t, v, g, m, y) {
        c(t, n, v);
        var b, _, x, E = function(e) {
                if (!d && e in T) return T[e];
                switch (e) {
                    case "keys":
                    case "values":
                        return function() {
                            return new t(this, e)
                        }
                }
                return function() {
                    return new t(this, e)
                }
            },
            w = n + " Iterator",
            R = "values" == g,
            S = !1,
            T = e.prototype,
            k = T[p] || T["@@iterator"] || g && T[g],
            A = k || E(g),
            O = g ? R ? E("entries") : A : void 0,
            M = "Array" == n ? T.entries || k : k;
        if (M && (x = f(M.call(new e))) !== Object.prototype && (l(x, w, !0), r || u(x, p) || a(x, p, h)), R && k && "values" !== k.name && (S = !0, A = function() {
                return k.call(this)
            }), r && !y || !d && !S && T[p] || a(T, p, A), s[n] = A, s[w] = h, g)
            if (b = {
                    values: R ? A : E("values"),
                    keys: m ? A : E("keys"),
                    entries: O
                }, y)
                for (_ in b) _ in T || i(T, _, b[_]);
            else o(o.P + o.F * (d || S), n, b);
        return b
    }
}, function(e, n) {
    e.exports = !0
}, function(e, n) {
    e.exports = function(e, n) {
        return {
            enumerable: !(1 & e),
            configurable: !(2 & e),
            writable: !(4 & e),
            value: n
        }
    }
}, function(e, n, t) {
    var r = t(1),
        o = r["__core-js_shared__"] || (r["__core-js_shared__"] = {});
    e.exports = function(e) {
        return o[e] || (o[e] = {})
    }
}, function(e, n, t) {
    var r, o, i, a = t(9),
        u = t(48),
        s = t(26),
        c = t(16),
        l = t(1),
        f = l.process,
        p = l.setImmediate,
        d = l.clearImmediate,
        h = l.MessageChannel,
        v = 0,
        g = {},
        m = function() {
            var e = +this;
            if (g.hasOwnProperty(e)) {
                var n = g[e];
                delete g[e], n()
            }
        },
        y = function(e) {
            m.call(e.data)
        };
    p && d || (p = function(e) {
        for (var n = [], t = 1; arguments.length > t;) n.push(arguments[t++]);
        return g[++v] = function() {
            u("function" == typeof e ? e : Function(e), n)
        }, r(v), v
    }, d = function(e) {
        delete g[e]
    }, "process" == t(8)(f) ? r = function(e) {
        f.nextTick(a(m, e, 1))
    } : h ? (o = new h, i = o.port2, o.port1.onmessage = y, r = a(i.postMessage, i, 1)) : l.addEventListener && "function" == typeof postMessage && !l.importScripts ? (r = function(e) {
        l.postMessage(e + "", "*")
    }, l.addEventListener("message", y, !1)) : r = "onreadystatechange" in c("script") ? function(e) {
        s.appendChild(c("script")).onreadystatechange = function() {
            s.removeChild(this), m.call(e)
        }
    } : function(e) {
        setTimeout(a(m, e, 1), 0)
    }), e.exports = {
        set: p,
        clear: d
    }
}, function(e, n, t) {
    var r = t(20),
        o = Math.min;
    e.exports = function(e) {
        return e > 0 ? o(r(e), 9007199254740991) : 0
    }
}, function(e, n) {
    var t = 0,
        r = Math.random();
    e.exports = function(e) {
        return "Symbol(".concat(void 0 === e ? "" : e, ")_", (++t + r).toString(36))
    }
}, function(e, n, t) {
    "use strict";
    var r = t(12),
        o = t.n(r),
        i = t(13),
        a = t.n(i),
        u = t(22),
        s = t(36),
        c = function() {
            function e(n) {
                var t = this;
                o()(this, e), this.domHelper = n, this.handleSend = function(n) {
                    n.preventDefault(), n.stopPropagation(), t.checkWS()
                }, this.handleInputKeyDown = function(n) {
                    n.keyCode === e.KEY_CODES.ENTER && (n.preventDefault(), n.stopPropagation(), t.checkWS())
                }, this.handleInputChange = function(n) {
                    if (n.target.value && n.target.value.length) {
                      t.domHelper.handleStartSend();
                    } else {
                      t.domHelper.handleStopSend();
                    }
                }, this.initializeWS = function(isRestart) {
                  window.eySocket = new WebSocket(`wss://ws.eyelevel.ai?uid=${user.userId}&username=${window.username}`);
                  window.eySocket.connectTime = Date.now();
                  if (isRestart) {
                    window.eySocket.isStarted = true;
                  } else {
                    window.eySocket.isStarted = false;
                  }
                  if (window.eySocket.connectAttempts) {
                    window.eySocket.connectAttempts += 1;
                  } else {
                    window.eySocket.connectAttempts += 1;
                  }
                  window.eySocket.onerror = t.handleWSError;
                  window.eySocket.onopen = t.handleWSOpen;
                  window.eySocket.onmessage = t.handleWSMessage;
                  window.eySocket.onclose = t.handleWSClose;
                }, this.handleWSClose = function(n) {
                  var now = Date.now();
                  console.log('ws closed');
                  if (window.eySocket && window.eySocket.connectTime && (window.eySocket.connectTime + 5000 > now || window.eySocket.connectAttempts < 4)) {
                    console.log('reconnecting');
                    setTimeout(function() {
                      t.initializeWS(true);
                    }, 1000);
									}
                }, this.handleWSError = function(n) {
                  console.error('WS error', window.eySocket);
                }, this.handleWSOpen = function(n) {
                  window.eySocket.connectAttempts = 0;
                  if (!window.eySocket.isStarted) {
                    var inter = retrieveInteractions();
                    if (inter && inter.length) {
                      for (var ji = 0; ji < inter.length; ji++) {
											  var int1 = inter[ji];
											  var pay = JSON.parse(int1.payload);
											  if (int1.sender === 'user') {
                          t.domHelper.addUserRequestNode(pay.text);
											  } else {
                          t.createMessage(int1);
											  }
                      }
										} else {
                      t.domHelper.startWelcome(t);
                    }
                    window.eySocket.isStarted = true;
                  } else {
                    t.handleInput();
                  }
                }, this.handleWSMessage = function(n) {
                  window.isChatting = false;
                  if (n && n.data) {
                    try {
                      var wsRes = JSON.parse(n.data)
                      if (wsRes) {
                        if (window.eySocket.typingElement) {
											    t.createMessage(wsRes, window.eySocket.typingElement);
											  } else {
											    t.createMessage(wsRes);
											  }
											  wsRes.sender = "server";
											  saveInteraction(wsRes);
                      } else {
//TODO alert
                      console.error("Invalid WS response payload");
                      }
										} catch(err) {
//TODO alert
                      console.error(err);
                    }
                  } else {
//TODO alert
                      console.error("Invalid WS response");
                  }
                }, this.checkWS = function() {
                  if (!window.eySocket || window.eySocket.readyState !== 1) {
                    t.initializeWS(window.eySocket ? true : false);
                  } else {
                    t.handleInput();
									}
                }, this.handleSendClick = function(n) {
                    n.preventDefault(), n.stopPropagation(), t.checkWS()
                }, this.handleCloseWindow = function(n) {
                  n.preventDefault();
                  n.stopPropagation();
                  window.parent.postMessage("toggle", "*");
                }, this.handleChatWindow = function(n) {
                    if (!window.eySocket) {
                      t.initializeWS();
                    }
                    t.scrollToBottom();
                }, this.scrollToBottom = function() {
                    var q = t.domHelper.getQueryResultWrapper();
                    return q.scrollTop = q.scrollHeight, this
                }, this.escapeString = function(txt) {
                    return txt && txt.toString() ? txt.toString().replace(/&/g, "&amp").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;") : txt
                }, this.empty = function() {
                    var na = t.domHelper.workplace.createElement('div');
                    var aa = t.domHelper.workplace.getElementById('result');
                    return na.className = 'server-response', na.innerHTML = '...', aa.appendChild(na), na;
                }, this.setText = function(ee, nn) {
                    return nn.innerHTML = ee, this
                }, this.setObject = function(ee, nn) {
                    while (nn.firstChild) {
                        nn.removeChild(nn.firstChild);
                    }
                    for (var i in ee) {
                        nn.appendChild(ee[i]);
                    }
                    return nn, this
                }, this.handleInput = function(type) {
                    var n = t.domHelper.getInputValue();
                    if ("" !== n.replace(/\s/g, "") && !window.isChatting) {
                        t.domHelper.addUserRequestNode(t.escapeString(n));
                        window.isChatting = true;
                        var txt = t.domHelper.getInputValue();
                        if (txt !== 'startWelcome') {
                          saveInteraction({ action: "message", payload: JSON.stringify({ text: txt }), typing: false, sender: "user" });
                        }
                        window.eySocket.send(JSON.stringify(t.buildPayLoad(t.domHelper.getInputValue())));
                        t.domHelper.setInputValue("");
                        t.domHelper.handleStopSend();
                        window.isChatting = false;
                        t.scrollToBottom();
                    }
                }, this.sessionId = this.guid(), this.stage = 'welcome', this.nextStage = 'welcome', this.confirmationValue = null, this.menu = null, this.handleMenuButtonClick = function(ben) {
                    if (!t.domHelper.getMainMenu().style.height) {
                        ben.stopPropagation();
                        t.domHelper.getChatForm().classList.add('menu-open');
                        t.domHelper.getMainMenu().style.height = t.domHelper.getMenuHeight() + 'px';
                    }
                }, this.handleBodyClick = function(ben) {
                    if (t.domHelper.getMainMenu().style.height) {
                        ben.stopPropagation();
                        t.domHelper.getChatForm().classList.remove('menu-open');
                        t.domHelper.getMainMenu().removeAttribute('style');
                    }
                }, this.loadMenu = function(menu) {
                    t.domHelper.getMenuButton().style.display = 'block';
                    var futureSteps = false;
                    var mm = t.domHelper.getMenuList();
                    while (mm.firstChild) {
                      mm.removeChild(mm.firstChild);
                    }
                    for (var i in menu) {
                        if (menu[i].title) {
                            var li = t.domHelper.workplace.createElement('li');
                            if (futureSteps) {
                                li.classList.add('inactive-link');
                            }
                            if (i === t.stage) {
                                li.classList.add('current-link');
                            }
                            li.onclick = t.handleMenuItemClick.bind(t);
                            li.setAttribute('id', i);
                            li.innerHTML = menu[i].title;
                            mm.appendChild(li);
                        }
                        if (i === t.stage) {
                            futureSteps = true;
                        }
                    }
                    t.domHelper.setMenuHeight();
                    t.menu = menu;
                }, this.makeCopy = function(rr) {
                    return JSON.parse(JSON.stringify(rr));
                }, this.getSpeech = function(n) {
                    return (n.length ? n : [ { speech: e.DEFAULT_NO_ANSWER } ]);
                }, this.chat = {
                    text: function(data) {
                        return t.escapeString(data);
                    }, button: function(data) {
                        var button = t.domHelper.workplace.createElement('button');
                        button.classList.add('chat-button');
                        if (data.type === 'phone_number') {
                          button.classList.add('click-to-call');
                        } else if (data.type === 'web_url') {
                          button.classList.add('web-url');
                          button.value = data.url;
                        }
                        button.setAttribute('id', data.payload);
                        button.innerHTML = data.title;
                        button.onclick = t.sendButton.bind(t);
                        return button;
                    }, button_facebook: function(data) {
                        var button = t.domHelper.workplace.createElement('button');
                        button.classList.add('chat-button');
                        button.setAttribute('id', data.intent);
                        button.innerHTML = data.label;
                        button.onclick = t.sendButton.bind(t);
                        return button;
                    }, buttons: function(data) {
                        var html = [];
                        for (var i in data) {
                          html.push(t.chat.button(data[i]));
                        }
                        return html;
                    }, quick_reply: function(data) {
											var button = t.domHelper.workplace.createElement('button');
											button.classList.add('chat-button');
											button.setAttribute('id', data.payload);
											button.innerHTML = data.payload;
											button.onclick = t.sendButton.bind(t);
											return button;
                    }, quick_replies: function(data) {
                        var html = [];
                        for (var i in data) {
													if (data[i].content_type && data[i].content_type === 'text') {
														html.push(t.chat.quick_reply(data[i]));
													}
                        }
                        return html;
                    }
                }, this.createMessage = function(msg, obj) {
                    return new Promise(function(resolve, reject) {
                        var ttt;
                        if (obj) {
                            ttt = obj;
                        } else {
                            ttt = t.empty();
                        }
                        var data = JSON.parse(msg.payload);
console.log(data);
                        var html = '';
                        var needsReset = false;
												if (data.text) {
												  html = t.chat.text(data.text);
												  t.setText(html, ttt);
												  needsReset = true;
												}
												if (data.attachment && data.attachment.payload) {
                          if (data.attachment.payload.text) {
                            if (needsReset) {
                              ttt = t.empty();
                            }
                            t.setText(t.chat.text(data.attachment.payload.text), ttt);
												    needsReset = true;
												  }
												  if (data.attachment.type && data.attachment.type === 'video' && data.attachment.payload.url) {
                            if (needsReset) {
                              ttt = t.empty();
                            }
                            html = t.chat.text(data.attachment.payload.url);
                            t.setText(html, ttt);
												    needsReset = true;
												  }
                          if (data.attachment.payload.buttons) {
                            if (needsReset) {
                              ttt = t.empty();
                            }
                            html = t.chat.buttons(data.attachment.payload.buttons);
													  ttt.className += ' chat-buttons';
													  t.setObject(html, ttt);
                          }
                        }
                        if (data.quick_replies) {
                          if (needsReset) {
                            ttt = t.empty();
                          }
                          html = t.chat.quick_replies(data.quick_replies);
													ttt.className += ' chat-buttons';
													t.setObject(html, ttt);
                        }
                        t.scrollToBottom();
                        if (msg.typing) {
                          setTimeout(function() {
                            window.eySocket.typingElement = t.empty();
                            resolve();
                          }, Math.floor(Math.random()*(600-400+1)+400));
                        } else {
                          window.eySocket.typingElement = null;
                          resolve();
                        }
                    });
                }
            }
            return a()(e, [{
                key: "bindEventHandlers",
                value: function() {
                    this.domHelper.getQueryInput().addEventListener("keydown", this.handleInputKeyDown, !1),
                    window.addEventListener("message", this.handleChatWindow),
                    this.domHelper.getCloseWindow().addEventListener("click", this.handleCloseWindow, !1),
                    this.domHelper.getCloseWindow().addEventListener("touchstart", this.handleCloseWindow, !1),
                    this.domHelper.getQueryInput().addEventListener("input", this.handleInputChange, !1),
                    this.domHelper.getSendInput().addEventListener("click", this.handleSendClick, !1),
                    this.domHelper.getSendInput().addEventListener("touchstart", this.handleSendClick, !1)
                }
            }, {
                key: "handleMenuItemClick",
                value: function(ben) {
                    ben.stopPropagation();
                    if (ben.target.className !== 'current-link'
                        && ben.target.className !== 'inactive-link') {
                        var i = this.getSpeech(this.menu[ben.target.id].result);
                        this.stage = ben.target.id;
                        this.nextStage = this.menu[ben.target.id].nextStage;
                        if (this.menu) {
                            this.loadMenu(this.menu);
                        }
                        this.printMessage(i);
                    }
                }
            }, {
                key: "initRecognition",
                value: function() {
                    var e = this,
                        n = new webkitSpeechRecognition;
                    n.onstart = function() {
                        e.isRecognizing = !0, e.domHelper.handleStartRecognition()
                    }, n.onerror = function() {}, n.onend = function() {
                        e.domHelper.handleStopRecognition(), e.isRecognizing = !1
                    }, n.onresult = function(n) {
                        for (var t = "", r = n.resultIndex; r < n.results.length; ++r) n.results[r].isFinal && (t += n.results[r][0].transcript);
                        e.domHelper.setInputValue(t), e.checkWS()
                    }, n.lang = window.AGENT_LANGUAGE || "en-US", this.recognition = n
                }
            }, {
                key: "sendButton",
                value: function(ee) {
//                  ee.target.parentElement.parentElement.removeChild(ee.target.parentElement);
									if (ee.target.classList.contains('click-to-call')) {
                    var aa = document.createElement('a');
                    aa.href = `tel:${ee.target.id}`;
                    aa.click();
                    this.handleEvent(`tel:${ee.target.id}`);
									  t.scrollToBottom();
                  } else if (ee.target.classList.contains('web-url')) {
                    var aa = document.createElement('a');
                    aa.href = ee.target.value;
                    aa.target = '_blank';
                    aa.click();
                    this.handleEvent(`web}${ee.target.value}`);
									  t.scrollToBottom();
									} else {
                    this.handleEvent(ee.target.id);
                  }
                }
            }, {
                key: "facebookButton",
                value: function(ee) {
                    var t = this;
                    ee.target.parentElement.parentElement.removeChild(ee.target.parentElement);
                    window.isChatting = true;
                    FB.login(function(res) {
                        if (res.authResponse && res.status && res.status === 'connected') {
                            t.handleEvent(ee.target.id, 'switch', res.authResponse);
                        } else {
                            var r = t.empty();
                            t.domHelper.setErrorOnNode('You will have to login and grant authorization to continue.', r);
                            var rr = t.makeCopy(t.menu[t.stage].repeat.result);
                            var i = t.getSpeech(rr);
                            t.printMessage(i);
                        }
                    }, {scope: 'email,public_profile,pages_show_list', auth_type: 'rerequest'});
                }
            }, {
                key: "handleEvent",
                value: function(evt, type, dt) {
                  var t = this;
                  window.isChatting = true;
                  var txt = evt || t.domHelper.getInputValue();
                  var shouldSend = true;
                  if (txt !== 'startWelcome') {
                    if (txt.indexOf('tel:') < 0) {
                      if (txt.indexOf('web}') < 0) {
                        t.domHelper.addUserRequestNode(txt);
                      } else {
                        shouldSend = false;
												txt = txt.replace('web}', '');
                        t.domHelper.addUserRequestNode(txt);
                      }
                    } else {
                      shouldSend = false;
                      txt = txt.replace('tel:', 'Our number is ') + '.';
                      t.domHelper.addUserRequestNode(txt);
                    }
                    saveInteraction({ action: "message", payload: JSON.stringify({ text: txt }), typing: false, sender: "user" });
                  }
                  if (shouldSend) {
                    window.eySocket.typingElement = t.empty();
                    window.eySocket.send(JSON.stringify(t.buildPayLoad(evt || t.domHelper.getInputValue(), type || 'event', dt)));
                  }
									window.isChatting = false;
                  t.scrollToBottom();
                }
            }, {
                key: "buildPayLoad",
                value: function(e, ty, dt) {
                    var ben = {
                        type: ty || 'text',
                        data: e,
                        username: window.username,
                        path: window.location.pathname,
                        uid: user.userId
                    };
                    if (this.confirmationValue) {
                        ben.value.passthrough.confirmationValue = this.confirmationValue;
                    }
                    if (dt) {
                        ben.value.passthrough.request = dt;
                    }
                    return ben;
                }
            }, {
                key: "generateCallbacksForNode",
                value: function(e) {
                    var n = this;
                    return {
                        success: function(t) {
                            n.handleResponse(t, e)
                        },
                        error: function(t) {
                            n.handleResponse(t, e)
                        }
                    }
                }
            }, {
                key: "handleError",
                value: function(n, t) {
                    var r = null;
                    r = n && n.status && n.status.errorDetails ? n.status.errorDetails : e.DEFAULT_ERROR, this.domHelper.setErrorOnNode(r, t)
                }
            }, {
                key: "guid",
                value: function() {
                    var e = function() {
                        return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1)
                    };
                    return e() + e() + "-" + e() + "-" + e() + "-" + e() + "-" + e() + e() + e()
                }
            }]), e
        }();
    n.a = c, c.DEFAULT_ERROR = "Sorry, it seems like there was an error during the request.", c.DEFAULT_NO_ANSWER = "[empty response]", c.HTTP_STATUS = {
        OK: 200
    }, c.KEY_CODES = {
        ENTER: 13
    }
}, function(e, n, t) {
    var r = t(76);
    "string" == typeof r && (r = [
        [e.i, r, ""]
    ]);
    t(78)(r, {});
    r.locals && (e.exports = r.locals)
}, function(e, n, t) {
    "use strict";
    var r = t(37),
        o = t.n(r),
        i = t(39),
        a = t.n(i),
        u = t(12),
        s = t.n(u),
        c = t(13),
        l = t.n(c),
        f = function() {
            function e() {
                s()(this, e)
            }
            return l()(e, null, [{
                key: "ajax",
                value: function(n, t) {
                    var r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null,
                        i = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : null;
                    return new a.a(function(a, u) {
                        var s = e.createXMLHTTPObject(),
                            c = t,
                            l = null;
                        if (r && n === e.Method.GET) {
                            c += "?";
                            var f = 0;
                            for (var p in r) r.hasOwnProperty(p) && (f++ && (c += "&"), c += encodeURIComponent(p) + "=" + encodeURIComponent(r[p]))
                        } else r && (i || (i = {}), i["Content-Type"] = "application/json", l = o()(r));
                        if (s.open(n, c), i)
                            for (var d in i) i.hasOwnProperty(d) && s.setRequestHeader(d, i[d]);
                        l ? s.send(l) : s.send(), s.onload = function() {
                            s.status >= 200 && s.status < 300 ? a(s) : u(s)
                        }, s.onerror = function() {
                            u(s)
                        }
                    })
                }
            }, {
                key: "get",
                value: function(n) {
                    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null,
                        r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null;
                    return e.ajax(e.Method.GET, n, t, r)
                }
            }, {
                key: "post",
                value: function(n) {
                    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null,
                        r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null;
                    return e.ajax(e.Method.POST, n, t, r)
                }
            }, {
                key: "put",
                value: function(n) {
                    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null,
                        r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null;
                    return e.ajax(e.Method.PUT, n, t, r)
                }
            }, {
                key: "delete",
                value: function(n) {
                    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null,
                        r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null;
                    return e.ajax(e.Method.DELETE, n, t, r)
                }
            }, {
                key: "createXMLHTTPObject",
                value: function() {
                    for (var n = null, t = 0; t < e.XMLHttpFactories.length; t++)
                        if (e.XMLHttpFactories.hasOwnProperty(t)) {
                            try {
                                n = e.XMLHttpFactories[t]()
                            } catch (e) {
                                continue
                            }
                            break
                        }
                    return n
                }
            }]), e
        }();
    f.XMLHttpFactories = [function() {
            return new XMLHttpRequest
        }, function() {
            return new ActiveXObject("Msxml2.XMLHTTP")
        }, function() {
            return new ActiveXObject("Msxml3.XMLHTTP")
        }, function() {
            return new ActiveXObject("Microsoft.XMLHTTP")
        }],
        function(e) {
            ! function(e) {
                e[e.GET = "GET"] = "GET", e[e.POST = "POST"] = "POST", e[e.PUT = "PUT"] = "PUT", e[e.DELETE = "DELETE"] = "DELETE"
            }(e.Method || (e.Method = {}))
        }(f || (f = {})), n.a = f
}, function(e, n, t) {
    e.exports = {
        default: t(40),
        __esModule: !0
    }
}, function(e, n, t) {
    e.exports = {
        default: t(41),
        __esModule: !0
    }
}, function(e, n, t) {
    e.exports = {
        default: t(42),
        __esModule: !0
    }
}, function(e, n, t) {
    var r = t(2),
        o = r.JSON || (r.JSON = {
            stringify: JSON.stringify
        });
    e.exports = function(e) {
        return o.stringify.apply(o, arguments)
    }
}, function(e, n, t) {
    t(71);
    var r = t(2).Object;
    e.exports = function(e, n, t) {
        return r.defineProperty(e, n, t)
    }
}, function(e, n, t) {
    t(72), t(74), t(75), t(73), e.exports = t(2).Promise
}, function(e, n) {
    e.exports = function() {}
}, function(e, n) {
    e.exports = function(e, n, t, r) {
        if (!(e instanceof n) || void 0 !== r && r in e) throw TypeError(t + ": incorrect invocation!");
        return e
    }
}, function(e, n, t) {
    var r = t(21),
        o = t(32),
        i = t(66);
    e.exports = function(e) {
        return function(n, t, a) {
            var u, s = r(n),
                c = o(s.length),
                l = i(a, c);
            if (e && t != t) {
                for (; c > l;)
                    if ((u = s[l++]) != u) return !0
            } else
                for (; c > l; l++)
                    if ((e || l in s) && s[l] === t) return e || l || 0; return !e && -1
        }
    }
}, function(e, n, t) {
    var r = t(9),
        o = t(51),
        i = t(50),
        a = t(3),
        u = t(32),
        s = t(69),
        c = {},
        l = {},
        n = e.exports = function(e, n, t, f, p) {
            var d, h, v, g, m = p ? function() {
                    return e
                } : s(e),
                y = r(t, f, n ? 2 : 1),
                b = 0;
            if ("function" != typeof m) throw TypeError(e + " is not iterable!");
            if (i(m)) {
                for (d = u(e.length); d > b; b++)
                    if ((g = n ? y(a(h = e[b])[0], h[1]) : y(e[b])) === c || g === l) return g
            } else
                for (v = m.call(e); !(h = v.next()).done;)
                    if ((g = o(v, y, h.value, n)) === c || g === l) return g
        };
    n.BREAK = c, n.RETURN = l
}, function(e, n, t) {
    e.exports = !t(4) && !t(25)(function() {
        return 7 != Object.defineProperty(t(16)("div"), "a", {
            get: function() {
                return 7
            }
        }).a
    })
}, function(e, n) {
    e.exports = function(e, n, t) {
        var r = void 0 === t;
        switch (n.length) {
            case 0:
                return r ? e() : e.call(t);
            case 1:
                return r ? e(n[0]) : e.call(t, n[0]);
            case 2:
                return r ? e(n[0], n[1]) : e.call(t, n[0], n[1]);
            case 3:
                return r ? e(n[0], n[1], n[2]) : e.call(t, n[0], n[1], n[2]);
            case 4:
                return r ? e(n[0], n[1], n[2], n[3]) : e.call(t, n[0], n[1], n[2], n[3])
        }
        return e.apply(t, n)
    }
}, function(e, n, t) {
    var r = t(8);
    e.exports = Object("z").propertyIsEnumerable(0) ? Object : function(e) {
        return "String" == r(e) ? e.split("") : Object(e)
    }
}, function(e, n, t) {
    var r = t(6),
        o = t(0)("iterator"),
        i = Array.prototype;
    e.exports = function(e) {
        return void 0 !== e && (r.Array === e || i[o] === e)
    }
}, function(e, n, t) {
    var r = t(3);
    e.exports = function(e, n, t, o) {
        try {
            return o ? n(r(t)[0], t[1]) : n(t)
        } catch (n) {
            var i = e.return;
            throw void 0 !== i && r(i.call(e)), n
        }
    }
}, function(e, n, t) {
    "use strict";
    var r = t(56),
        o = t(29),
        i = t(18),
        a = {};
    t(5)(a, t(0)("iterator"), function() {
        return this
    }), e.exports = function(e, n, t) {
        e.prototype = r(a, {
            next: o(1, t)
        }), i(e, n + " Iterator")
    }
}, function(e, n, t) {
    var r = t(0)("iterator"),
        o = !1;
    try {
        var i = [7][r]();
        i.return = function() {
            o = !0
        }, Array.from(i, function() {
            throw 2
        })
    } catch (e) {}
    e.exports = function(e, n) {
        if (!n && !o) return !1;
        var t = !1;
        try {
            var i = [7],
                a = i[r]();
            a.next = function() {
                return {
                    done: t = !0
                }
            }, i[r] = function() {
                return a
            }, e(i)
        } catch (e) {}
        return t
    }
}, function(e, n) {
    e.exports = function(e, n) {
        return {
            value: n,
            done: !!e
        }
    }
}, function(e, n, t) {
    var r = t(1),
        o = t(31).set,
        i = r.MutationObserver || r.WebKitMutationObserver,
        a = r.process,
        u = r.Promise,
        s = "process" == t(8)(a);
    e.exports = function() {
        var e, n, t, c = function() {
            var r, o;
            for (s && (r = a.domain) && r.exit(); e;) {
                o = e.fn, e = e.next;
                try {
                    o()
                } catch (r) {
                    throw e ? t() : n = void 0, r
                }
            }
            n = void 0, r && r.enter()
        };
        if (s) t = function() {
            a.nextTick(c)
        };
        else if (i) {
            var l = !0,
                f = document.createTextNode("");
            new i(c).observe(f, {
                characterData: !0
            }), t = function() {
                f.data = l = !l
            }
        } else if (u && u.resolve) {
            var p = u.resolve();
            t = function() {
                p.then(c)
            }
        } else t = function() {
            o.call(r, c)
        };
        return function(r) {
            var o = {
                fn: r,
                next: void 0
            };
            n && (n.next = o), e || (e = o, t()), n = o
        }
    }
}, function(e, n, t) {
    var r = t(3),
        o = t(57),
        i = t(24),
        a = t(19)("IE_PROTO"),
        u = function() {},
        s = function() {
            var e, n = t(16)("iframe"),
                r = i.length;
            for (n.style.display = "none", t(26).appendChild(n), n.src = "javascript:", e = n.contentWindow.document, e.open(), e.write("<script>document.F=Object<\/script>"), e.close(), s = e.F; r--;) delete s.prototype[i[r]];
            return s()
        };
    e.exports = Object.create || function(e, n) {
        var t;
        return null !== e ? (u.prototype = r(e), t = new u, u.prototype = null, t[a] = e) : t = s(), void 0 === n ? t : o(t, n)
    }
}, function(e, n, t) {
    var r = t(7),
        o = t(3),
        i = t(60);
    e.exports = t(4) ? Object.defineProperties : function(e, n) {
        o(e);
        for (var t, a = i(n), u = a.length, s = 0; u > s;) r.f(e, t = a[s++], n[t]);
        return e
    }
}, function(e, n, t) {
    var r = t(10),
        o = t(67),
        i = t(19)("IE_PROTO"),
        a = Object.prototype;
    e.exports = Object.getPrototypeOf || function(e) {
        return e = o(e), r(e, i) ? e[i] : "function" == typeof e.constructor && e instanceof e.constructor ? e.constructor.prototype : e instanceof Object ? a : null
    }
}, function(e, n, t) {
    var r = t(10),
        o = t(21),
        i = t(45)(!1),
        a = t(19)("IE_PROTO");
    e.exports = function(e, n) {
        var t, u = o(e),
            s = 0,
            c = [];
        for (t in u) t != a && r(u, t) && c.push(t);
        for (; n.length > s;) r(u, t = n[s++]) && (~i(c, t) || c.push(t));
        return c
    }
}, function(e, n, t) {
    var r = t(59),
        o = t(24);
    e.exports = Object.keys || function(e) {
        return r(e, o)
    }
}, function(e, n, t) {
    var r = t(5);
    e.exports = function(e, n, t) {
        for (var o in n) t && e[o] ? e[o] = n[o] : r(e, o, n[o]);
        return e
    }
}, function(e, n, t) {
    e.exports = t(5)
}, function(e, n, t) {
    "use strict";
    var r = t(1),
        o = t(2),
        i = t(7),
        a = t(4),
        u = t(0)("species");
    e.exports = function(e) {
        var n = "function" == typeof o[e] ? o[e] : r[e];
        a && n && !n[u] && i.f(n, u, {
            configurable: !0,
            get: function() {
                return this
            }
        })
    }
}, function(e, n, t) {
    var r = t(3),
        o = t(14),
        i = t(0)("species");
    e.exports = function(e, n) {
        var t, a = r(e).constructor;
        return void 0 === a || void 0 == (t = r(a)[i]) ? n : o(t)
    }
}, function(e, n, t) {
    var r = t(20),
        o = t(15);
    e.exports = function(e) {
        return function(n, t) {
            var i, a, u = String(o(n)),
                s = r(t),
                c = u.length;
            return s < 0 || s >= c ? e ? "" : void 0 : (i = u.charCodeAt(s), i < 55296 || i > 56319 || s + 1 === c || (a = u.charCodeAt(s + 1)) < 56320 || a > 57343 ? e ? u.charAt(s) : i : e ? u.slice(s, s + 2) : a - 56320 + (i - 55296 << 10) + 65536)
        }
    }
}, function(e, n, t) {
    var r = t(20),
        o = Math.max,
        i = Math.min;
    e.exports = function(e, n) {
        return e = r(e), e < 0 ? o(e + n, 0) : i(e, n)
    }
}, function(e, n, t) {
    var r = t(15);
    e.exports = function(e) {
        return Object(r(e))
    }
}, function(e, n, t) {
    var r = t(11);
    e.exports = function(e, n) {
        if (!r(e)) return e;
        var t, o;
        if (n && "function" == typeof(t = e.toString) && !r(o = t.call(e))) return o;
        if ("function" == typeof(t = e.valueOf) && !r(o = t.call(e))) return o;
        if (!n && "function" == typeof(t = e.toString) && !r(o = t.call(e))) return o;
        throw TypeError("Can't convert object to primitive value")
    }
}, function(e, n, t) {
    var r = t(23),
        o = t(0)("iterator"),
        i = t(6);
    e.exports = t(2).getIteratorMethod = function(e) {
        if (void 0 != e) return e[o] || e["@@iterator"] || i[r(e)]
    }
}, function(e, n, t) {
    "use strict";
    var r = t(43),
        o = t(54),
        i = t(6),
        a = t(21);
    e.exports = t(27)(Array, "Array", function(e, n) {
        this._t = a(e), this._i = 0, this._k = n
    }, function() {
        var e = this._t,
            n = this._k,
            t = this._i++;
        return !e || t >= e.length ? (this._t = void 0, o(1)) : "keys" == n ? o(0, t) : "values" == n ? o(0, e[t]) : o(0, [t, e[t]])
    }, "values"), i.Arguments = i.Array, r("keys"), r("values"), r("entries")
}, function(e, n, t) {
    var r = t(17);
    r(r.S + r.F * !t(4), "Object", {
        defineProperty: t(7).f
    })
}, function(e, n) {}, function(e, n, t) {
    "use strict";
    var r, o, i, a = t(28),
        u = t(1),
        s = t(9),
        c = t(23),
        l = t(17),
        f = t(11),
        p = t(14),
        d = t(44),
        h = t(46),
        v = t(64),
        g = t(31).set,
        m = t(55)(),
        y = u.TypeError,
        b = u.process,
        _ = u.Promise,
        b = u.process,
        x = "process" == c(b),
        E = function() {},
        w = !! function() {
            try {
                var e = _.resolve(1),
                    n = (e.constructor = {})[t(0)("species")] = function(e) {
                        e(E, E)
                    };
                return (x || "function" == typeof PromiseRejectionEvent) && e.then(E) instanceof n
            } catch (e) {}
        }(),
        R = function(e, n) {
            return e === n || e === _ && n === i
        },
        S = function(e) {
            var n;
            return !(!f(e) || "function" != typeof(n = e.then)) && n
        },
        T = function(e) {
            return R(_, e) ? new k(e) : new o(e)
        },
        k = o = function(e) {
            var n, t;
            this.promise = new e(function(e, r) {
                if (void 0 !== n || void 0 !== t) throw y("Bad Promise constructor");
                n = e, t = r
            }), this.resolve = p(n), this.reject = p(t)
        },
        A = function(e) {
            try {
                e()
            } catch (e) {
                return {
                    error: e
                }
            }
        },
        O = function(e, n) {
            if (!e._n) {
                e._n = !0;
                var t = e._c;
                m(function() {
                    for (var r = e._v, o = 1 == e._s, i = 0; t.length > i;) ! function(n) {
                        var t, i, a = o ? n.ok : n.fail,
                            u = n.resolve,
                            s = n.reject,
                            c = n.domain;
                        try {
                            a ? (o || (2 == e._h && I(e), e._h = 1), !0 === a ? t = r : (c && c.enter(), t = a(r), c && c.exit()), t === n.promise ? s(y("Promise-chain cycle")) : (i = S(t)) ? i.call(t, u, s) : u(t)) : s(r)
                        } catch (e) {
                            s(e)
                        }
                    }(t[i++]);
                    e._c = [], e._n = !1, n && !e._h && M(e)
                })
            }
        },
        M = function(e) {
            g.call(u, function() {
                var n, t, r, o = e._v;
                if (P(e) && (n = A(function() {
                        x ? b.emit("unhandledRejection", o, e) : (t = u.onunhandledrejection) ? t({
                            promise: e,
                            reason: o
                        }) : (r = u.console) && r.error && r.error("Unhandled promise rejection", o)
                    }), e._h = x || P(e) ? 2 : 1), e._a = void 0, n) throw n.error
            })
        },
        P = function(e) {
            if (1 == e._h) return !1;
            for (var n, t = e._a || e._c, r = 0; t.length > r;)
                if (n = t[r++], n.fail || !P(n.promise)) return !1;
            return !0
        },
        I = function(e) {
            g.call(u, function() {
                var n;
                x ? b.emit("rejectionHandled", e) : (n = u.onrejectionhandled) && n({
                    promise: e,
                    reason: e._v
                })
            })
        },
        L = function(e) {
            var n = this;
            n._d || (n._d = !0, n = n._w || n, n._v = e, n._s = 2, n._a || (n._a = n._c.slice()), O(n, !0))
        },
        N = function(e) {
            var n, t = this;
            if (!t._d) {
                t._d = !0, t = t._w || t;
                try {
                    if (t === e) throw y("Promise can't be resolved itself");
                    (n = S(e)) ? m(function() {
                        var r = {
                            _w: t,
                            _d: !1
                        };
                        try {
                            n.call(e, s(N, r, 1), s(L, r, 1))
                        } catch (e) {
                            L.call(r, e)
                        }
                    }): (t._v = e, t._s = 1, O(t, !1))
                } catch (e) {
                    L.call({
                        _w: t,
                        _d: !1
                    }, e)
                }
            }
        };
    w || (_ = function(e) {
        d(this, _, "Promise", "_h"), p(e), r.call(this);
        try {
            e(s(N, this, 1), s(L, this, 1))
        } catch (e) {
            L.call(this, e)
        }
    }, r = function(e) {
        this._c = [], this._a = void 0, this._s = 0, this._d = !1, this._v = void 0, this._h = 0, this._n = !1
    }, r.prototype = t(61)(_.prototype, {
        then: function(e, n) {
            var t = T(v(this, _));
            return t.ok = "function" != typeof e || e, t.fail = "function" == typeof n && n, t.domain = x ? b.domain : void 0, this._c.push(t), this._a && this._a.push(t), this._s && O(this, !1), t.promise
        },
        catch: function(e) {
            return this.then(void 0, e)
        }
    }), k = function() {
        var e = new r;
        this.promise = e, this.resolve = s(N, e, 1), this.reject = s(L, e, 1)
    }), l(l.G + l.W + l.F * !w, {
        Promise: _
    }), t(18)(_, "Promise"), t(63)("Promise"), i = t(2).Promise, l(l.S + l.F * !w, "Promise", {
        reject: function(e) {
            var n = T(this);
            return (0, n.reject)(e), n.promise
        }
    }), l(l.S + l.F * (a || !w), "Promise", {
        resolve: function(e) {
            if (e instanceof _ && R(e.constructor, this)) return e;
            var n = T(this);
            return (0, n.resolve)(e), n.promise
        }
    }), l(l.S + l.F * !(w && t(53)(function(e) {
        _.all(e).catch(E)
    })), "Promise", {
        all: function(e) {
            var n = this,
                t = T(n),
                r = t.resolve,
                o = t.reject,
                i = A(function() {
                    var t = [],
                        i = 0,
                        a = 1;
                    h(e, !1, function(e) {
                        var u = i++,
                            s = !1;
                        t.push(void 0), a++, n.resolve(e).then(function(e) {
                            s || (s = !0, t[u] = e, --a || r(t))
                        }, o)
                    }), --a || r(t)
                });
            return i && o(i.error), t.promise
        },
        race: function(e) {
            var n = this,
                t = T(n),
                r = t.reject,
                o = A(function() {
                    h(e, !1, function(e) {
                        n.resolve(e).then(t.resolve, r)
                    })
                });
            return o && r(o.error), t.promise
        }
    })
}, function(e, n, t) {
    "use strict";
    var r = t(65)(!0);
    t(27)(String, "String", function(e) {
        this._t = String(e), this._i = 0
    }, function() {
        var e, n = this._t,
            t = this._i;
        return t >= n.length ? {
            value: void 0,
            done: !0
        } : (e = r(n, t), this._i += e.length, {
            value: e,
            done: !1
        })
    })
}, function(e, n, t) {
    t(70);
    for (var r = t(1), o = t(5), i = t(6), a = t(0)("toStringTag"), u = ["NodeList", "DOMTokenList", "MediaList", "StyleSheetList", "CSSRuleList"], s = 0; s < 5; s++) {
        var c = u[s],
            l = r[c],
            f = l && l.prototype;
        f && !f[a] && o(f, a, c), i[c] = i.Array
    }
}, function(e, n, t) {
    n = e.exports = t(77)()
}, function(e, n) {
    e.exports = function() {
        var e = [];
        return e.toString = function() {
            for (var e = [], n = 0; n < this.length; n++) {
                var t = this[n];
                t[2] ? e.push("@media " + t[2] + "{" + t[1] + "}") : e.push(t[1])
            }
            return e.join("")
        }, e.i = function(n, t) {
            "string" == typeof n && (n = [
                [null, n, ""]
            ]);
            for (var r = {}, o = 0; o < this.length; o++) {
                var i = this[o][0];
                "number" == typeof i && (r[i] = !0)
            }
            for (o = 0; o < n.length; o++) {
                var a = n[o];
                "number" == typeof a[0] && r[a[0]] || (t && !a[2] ? a[2] = t : t && (a[2] = "(" + a[2] + ") and (" + t + ")"), e.push(a))
            }
        }, e
    }
}, function(e, n) {
    function t(e, n) {
        for (var t = 0; t < e.length; t++) {
            var r = e[t],
                o = p[r.id];
            if (o) {
                o.refs++;
                for (var i = 0; i < o.parts.length; i++) o.parts[i](r.parts[i]);
                for (; i < r.parts.length; i++) o.parts.push(s(r.parts[i], n))
            } else {
                for (var a = [], i = 0; i < r.parts.length; i++) a.push(s(r.parts[i], n));
                p[r.id] = {
                    id: r.id,
                    refs: 1,
                    parts: a
                }
            }
        }
    }

    function r(e) {
        for (var n = [], t = {}, r = 0; r < e.length; r++) {
            var o = e[r],
                i = o[0],
                a = o[1],
                u = o[2],
                s = o[3],
                c = {
                    css: a,
                    media: u,
                    sourceMap: s
                };
            t[i] ? t[i].parts.push(c) : n.push(t[i] = {
                id: i,
                parts: [c]
            })
        }
        return n
    }

    function o(e, n) {
        var t = v(),
            r = y[y.length - 1];
        if ("top" === e.insertAt) r ? r.nextSibling ? t.insertBefore(n, r.nextSibling) : t.appendChild(n) : t.insertBefore(n, t.firstChild), y.push(n);
        else {
            if ("bottom" !== e.insertAt) throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
            t.appendChild(n)
        }
    }

    function i(e) {
        e.parentNode.removeChild(e);
        var n = y.indexOf(e);
        n >= 0 && y.splice(n, 1)
    }

    function a(e) {
        var n = document.createElement("style");
        return n.type = "text/css", o(e, n), n
    }

    function u(e) {
        var n = document.createElement("link");
        return n.rel = "stylesheet", o(e, n), n
    }

    function s(e, n) {
        var t, r, o;
        if (n.singleton) {
            var s = m++;
            t = g || (g = a(n)), r = c.bind(null, t, s, !1), o = c.bind(null, t, s, !0)
        } else e.sourceMap && "function" == typeof URL && "function" == typeof URL.createObjectURL && "function" == typeof URL.revokeObjectURL && "function" == typeof Blob && "function" == typeof btoa ? (t = u(n), r = f.bind(null, t), o = function() {
            i(t), t.href && URL.revokeObjectURL(t.href)
        }) : (t = a(n), r = l.bind(null, t), o = function() {
            i(t)
        });
        return r(e),
            function(n) {
                if (n) {
                    if (n.css === e.css && n.media === e.media && n.sourceMap === e.sourceMap) return;
                    r(e = n)
                } else o()
            }
    }

    function c(e, n, t, r) {
        var o = t ? "" : r.css;
        if (e.styleSheet) e.styleSheet.cssText = b(n, o);
        else {
            var i = document.createTextNode(o),
                a = e.childNodes;
            a[n] && e.removeChild(a[n]), a.length ? e.insertBefore(i, a[n]) : e.appendChild(i)
        }
    }

    function l(e, n) {
        var t = n.css,
            r = n.media;
        if (r && e.setAttribute("media", r), e.styleSheet) e.styleSheet.cssText = t;
        else {
            for (; e.firstChild;) e.removeChild(e.firstChild);
            e.appendChild(document.createTextNode(t))
        }
    }

    function f(e, n) {
        var t = n.css,
            r = n.sourceMap;
        r && (t += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(r)))) + " */");
        var o = new Blob([t], {
                type: "text/css"
            }),
            i = e.href;
        e.href = URL.createObjectURL(o), i && URL.revokeObjectURL(i)
    }
    var p = {},
        d = function(e) {
            var n;
            return function() {
                return void 0 === n && (n = e.apply(this, arguments)), n
            }
        },
        h = d(function() {
            return /msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase())
        }),
        v = d(function() {
            return document.head || document.getElementsByTagName("head")[0]
        }),
        g = null,
        m = 0,
        y = [];
    e.exports = function(e, n) {
        if ("undefined" != typeof DEBUG && DEBUG && "object" != typeof document) throw new Error("The style-loader cannot be used in a non-browser environment");
        n = n || {}, void 0 === n.singleton && (n.singleton = h()), void 0 === n.insertAt && (n.insertAt = "bottom");
        var o = r(e);
        return t(o, n),
            function(e) {
                for (var i = [], a = 0; a < o.length; a++) {
                    var u = o[a],
                        s = p[u.id];
                    s.refs--, i.push(s)
                }
                if (e) {
                    t(r(e), n)
                }
                for (var a = 0; a < i.length; a++) {
                    var s = i[a];
                    if (0 === s.refs) {
                        for (var c = 0; c < s.parts.length; c++) s.parts[c]();
                        delete p[s.id]
                    }
                }
            }
    };
    var b = function() {
        var e = [];
        return function(n, t) {
            return e[n] = t, e.filter(Boolean).join("\n")
        }
    }()
}, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
        value: !0
    });
    var r = t(34),
        o = t(22);
    t(35);
    var i = new o.a;
    new r.a(i).bindEventHandlers()
}]);
