try {
  var wssURL = 'wss://ws.eyelevel.ai';

  if (!window.getUser) {
    window.getUser = function() {
      var userId = window.localStorage.getItem('eyelevel.sales.userId');
      var aid = window.localStorage.getItem('eyelevel.sales.aid');
      var newUser = false;
      if (!userId) {
        newUser = true;
        userId = randomString(32);
        window.localStorage.setItem('eyelevel.sales.userId', userId);
      }
      return { userId: userId, aid: aid, GUID: aid + ":" + userId, newUser: newUser };
    }
  }

  saveSession = function(sess) {
    if (sess.Pos.flowUUID && sess.Pos.turnID && sess.Pos.flowUUID !== "00000000-0000-0000-0000-000000000000" && parseInt(sess.Pos.turnID) !== 0) {
      window.localStorage.setItem('eyelevel.conversation.session', JSON.stringify(sess));
      if (sess.GUID && sess.GUID.refUserId && sess.GUID.aid && parseInt(sess.GUID.aid) > 0) {
        window.localStorage.setItem('eyelevel.sales.aid', parseInt(sess.GUID.aid));
        window.localStorage.setItem('eyelevel.sales.userId', sess.GUID.refUserId);
        window.user = window.getUser();
      }
    }
  }

  saveInteraction = function(interaction) {
    if (interaction && interaction.sender && interaction.sender === 'user') {
      interaction.host = window.location.host;
      interaction.pathname = window.location.pathname;
      interaction.uid = window.getUser().userId;
      interaction.username = window.username;
      interaction.origin = window.origin || 'web';
      if (typeof window.flowname !== 'undefined') {
        interaction.flowname = window.flowname;
      }
      window.parent.postMessage('track:'+JSON.stringify(interaction), "*");
    }
    var h = window.localStorage.getItem('eyelevel.conversation.history');
    if (h && typeof h !== 'undefined') {
      var history = JSON.parse(h);
      if (history) {
        history.push(interaction)
      } else {
        history = [interaction];
      }
      window.localStorage.setItem('eyelevel.conversation.history', JSON.stringify(history));
    } else {
      var history = [interaction];
      window.localStorage.setItem('eyelevel.conversation.history', JSON.stringify(history));
    }
  }

  clearAll = function() {
    window.localStorage.removeItem('eyelevel.conversation.history');
    window.localStorage.removeItem('eyelevel.conversation.session');
  }

  getSession = function() {
    var s = window.localStorage.getItem('eyelevel.conversation.session');
    if (s && typeof s !== 'undefined') {
      var sess = JSON.parse(s);
      if (sess) {
        if (sess.position) {
          sess.Pos = sess.position;
        }
      }
      return sess;
    }
  }

  retrieveInteractions = function() {
    var h = window.localStorage.getItem('eyelevel.conversation.history');
    if (h && typeof h !== 'undefined') {
      return JSON.parse(h);
    }
  }

  var eIDs = {
    queryInput:         'query',
    queryResult:        'result',
    queryResultWrapper: 'resultWrapper',
    sendBtn:            'ey-send',
    window:             'eyChat'
  };

  var eyc = {
    body:               document.body,
    elements:           {},
    workplace:          document,

    attnElm:            null,
    connectAttempts:    0,
    isChatting:         false,
    socket:             null,
    user:               null,

    getInputValue:      function() {
      return eyc.elements.queryInput.value;
    },
    mapElements:        function() {
      return eyc.elements = {
        chatWindow:         eyc.workplace.getElementById(eIDs.window),
        queryInput:         eyc.workplace.getElementById(eIDs.queryInput),
        queryResult:        eyc.workplace.getElementById(eIDs.queryResult),
        queryResultWrapper: eyc.workplace.getElementById(eIDs.queryResultWrapper),
        sendBtn:            eyc.workplace.getElementById(eIDs.sendBtn)
      };
    },

    addUserRequestNode: function(n) {
      var t = eyc.workplace.createElement("div");
      if (n.text) {
        return t.className = 'user-request-container', t.innerHTML = '<div class="user-request">' + n.text + '</div>', eyc.elements.queryResult.appendChild(t);
      } else if (n.input_value && n.id) {
        var input = eyc.workplace.getElementById(n.id + '-input');
        var cnt = eyc.workplace.getElementById(n.id);
        if (input) {
          input.value = n.input_value;
        }
        if (cnt) {
          cnt.classList.remove('icon-send');
          cnt.classList.add('icon-success');
        }
      }
    },
    buildPayLoad:       function(e, ty, dt, pos) {
      var ben = {
        type: ty || 'text',
        data: e,
        username: 'f95ae20b-6988-407e-95d3-0d1c4620e2de',
        path: window.location.pathname,
        uid: window.getUser().userId,
        guid: window.eyid && window.eyid,
        origin: 'web',
        position: pos && pos,
        ref: window.location.href
      };
      if (typeof window.flowname !== 'undefined') {
        ben.flowname = window.flowname;
      }
      if (dt) {
        ben.value.passthrough.request = dt;
      }
      return ben;
    },
    chat: {
      text:             function(data) {
        return  eyc.escapeString(data);
      },
      image:            function(data) {
        var img = eyc.workplace.createElement('img');
        img.src = data;
        img.classList.add('chat-image');
        img.addEventListener('load', function() {
          eyc.scrollToBottom();
        });
        return img;
      },
      video:            function(data) {
        if (data.indexOf('https://youtu.be/') === 0) {
          var cnt = eyc.workplace.createElement('div');
          cnt.classList.add('youtube-container');
          cnt.innerHTML = '<iframe class="youtube-video" src="https://www.youtube.com/embed/' + data.replace('https://youtu.be/', '') + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
          return cnt;
        }
        return;
      },
      card:             function(t, ttt, data) {
        if (data.length && data.length === 1) {
          var sc = ttt.getElementsByClassName('server-response');
          if (sc && sc.length && sc.length === 1) {
            while (sc[0].firstChild) {
              sc[0].removeChild(sc[0].firstChild);
            }
          }
          sc[0].parentElement.classList.add('chat-card');
          var cd = data[0];
          var isEmpty = true;
          if (cd.title) {
            var title = eyc.workplace.createElement('div');
            title.classList.add('card-title');
            title.innerHTML = cd.title;
            sc[0].appendChild(title);
            isEmpty = false;
            if (cd.subtitle) {
              var subtitle = eyc.workplace.createElement('div');
              subtitle.classList.add('card-subtitle');
              subtitle.innerHTML = cd.subtitle;
              sc[0].appendChild(subtitle);
            }
          }
          if (cd.buttons && cd.buttons.length) {
            var bt = eyc.chat.buttons(cd.buttons);
            if (bt && bt.length) {
              var buttons = eyc.workplace.createElement('div');
              buttons.classList.add('card-buttons');
              buttons.classList.add('chat-buttons');
              for (var i in bt) {
                buttons.appendChild(bt[i]);
              }
              sc[0].appendChild(buttons);
            } else if (isEmpty) {
              eyc.removeEmpty(ttt);
            }
          }
        } else {
          eyc.removeEmpty(ttt);
        }
      },
      button: function(data) {
        var button = eyc.workplace.createElement('button');
        button.classList.add('chat-button');
        var objData = data;
        if (objData.type === 'phone_number') {
          button.classList.add('click-to-call');
        } else if (objData.type === 'web_url') {
          button.classList.add('web-url');
          button.value = objData.url;
        } else if (objData.type === 'gdpr') {
          button.classList.add('gdpr-button');
          button.value = objData.value;
          objData.payload = objData.title;
        } else {
          try {
            var jsonPay = JSON.parse(objData.payload);
            if (jsonPay && jsonPay.title && jsonPay.action && jsonPay.position) {
              button.setAttribute('data-flow-uuid', jsonPay.position.flowUUID);
              button.setAttribute('data-turn-id', jsonPay.position.turnID);
            }
            objData.payload = objData.title;
          } catch (e) {}
        }
        button.setAttribute('id', objData.payload);
        button.innerHTML = objData.title;
        button.onclick = eyc.sendButton.bind(eyc);
        return button;
      },
      buttons: function(data) {
        var html = [];
        for (var i in data) {
          html.push(eyc.chat.button(data[i]));
        }
        return html;
      },
      user_input: function(msg) {
        var payload = JSON.parse(msg.payload);
        var data;
        for (var i in payload.quick_replies) {
          if (payload.quick_replies[i].content_type && (payload.quick_replies[i].content_type === 'user_email' || payload.quick_replies[i].content_type === 'user_phone_number')) {
            data = payload.quick_replies[i];
            break;
          }
        }
        if (!data) {
          if (payload.text === 'Name') {
            data = { content_type: 'user_name' };
          } else {
            return;
          }
        }
        var idPrefix;
        if (msg.id) {
          idPrefix = msg.id;
        } else {
          idPrefix = 'in-' + Date.now();
          msg.id = idPrefix;
        }
        var cnt = eyc.workplace.createElement('div');
        cnt.classList.add('user-input-container');
        var holder = eyc.workplace.createElement('div');
        holder.classList.add('user-input-holder');
        var input = eyc.workplace.createElement('input');
        input.classList.add('user-input');
        input.id = idPrefix + '-input';
        input.required = true;
        holder.appendChild(input);
        var status = eyc.workplace.createElement('div');
        status.classList.add('user-input-status');
        status.id = idPrefix + '-status';
        status.innerHTML = '&nbsp;';
        var inBtn = eyc.workplace.createElement('div');
        inBtn.classList.add('user-input-button');
        inBtn.classList.add('icon-send');
        inBtn.id = idPrefix;
        inBtn.onclick = eyc.inputButton.bind(eyc);
        var label = eyc.workplace.createElement('label');
        label.classList.add('user-input-label');
        label.innerHTML = payload.text;
        switch (data.content_type) {
          case 'user_email':
            eyc.socket.turnID = idPrefix;
            eyc.socket.turnType = 'email';
            inBtn.type = 'email';
            input.type = 'email';
            input.autocomplete = 'email';
            input.name = 'email';
            holder.appendChild(inBtn);
            cnt.appendChild(label);
            cnt.appendChild(holder);
            break;
          case 'user_phone_number':
            eyc.socket.turnID = idPrefix;
            eyc.socket.turnType = 'tel';
            inBtn.type = 'tel';
            input.type = 'tel';
            input.autocomplete = 'tel';
            input.name = 'tel';
            holder.appendChild(inBtn);
            cnt.appendChild(label);
            cnt.appendChild(holder);
            break;
          case 'user_name':
            eyc.socket.turnID = idPrefix;
            eyc.socket.turnType = 'name';
            inBtn.type = 'name';
            input.type = 'text';
            input.autocomplete = 'name';
            input.name = 'name';
            holder.appendChild(inBtn);
            cnt.appendChild(label);
            cnt.appendChild(holder);
            break;
          default:
            return;
        }
        cnt.appendChild(status);
        return cnt;
      },
      quick_reply: function(data) {
        var objData = data;
        if (objData.content_type === 'text') {
          try {
            var jsonPay = JSON.parse(objData.payload);
            if (jsonPay && jsonPay.title && jsonPay.action && jsonPay.position) {
              return eyc.chat.button({ title: jsonPay.title, type: "postback", payload: objData.payload });
            }
          } catch (e) {}
        }
        var button = eyc.workplace.createElement('button');
        button.classList.add('chat-button');
        button.setAttribute('id', objData.payload);
        button.innerHTML = objData.payload;
        button.onclick = eyc.sendButton.bind(t);
        return button;
      },
      is_input: function(msg) {
        var data = JSON.parse(msg.payload);
        if (data.quick_replies) {
          for (var i in data.quick_replies) {
            if (data.quick_replies[i].content_type && (data.quick_replies[i].content_type === 'user_email' || data.quick_replies[i].content_type === 'user_phone_number')) {
              return true;
            }
          }
        }
        if (data.text === 'Name') {
          return true;
        }
        return false;
      },
      quick_replies: function(msg, data) {
        var html = [];
        for (var i in data) {
          if (data[i].content_type) {
            if (data[i].content_type === 'text') {
              html.push(eyc	.chat.quick_reply(data[i]));
            }
          }
        }
        return html;
      }
    },
    checkWS:            function() {
      if (!eyc.socket || eyc.socket.readyState !== 1) {
        eyc.initializeWS(eyc.socket ? true : false);
      } else {
        eyc.handleInput();
      }
    },
    createMessage:      function(msg, obj) {
      return new Promise(function(resolve, reject) {
        delete eyc.socket.turnType;
        delete eyc.socket.turnID;
        var ttt;
        if (obj) {
          ttt = obj;
        } else {
          ttt = eyc.empty();
        }
        var data = JSON.parse(msg.payload);
        var html = '';
        var needsReset = false;
        if (eyc.chat.is_input(msg)) {
          html = eyc.chat.user_input(msg);
          if (html) {
            eyc.setButtons([html], ttt);
          } else {
            eyc.setText("Unsupported user input type", ttt);
          }
        } else {
          if (data.text) {
            html = eyc.chat.text(data.text);
            eyc.setText(html, ttt);
            needsReset = true;
          }
          if (data.attachment && data.attachment.payload) {
            if (data.attachment.payload.text) {
              if (needsReset) {
                ttt = eyc.empty();
              }
              eyc.setText(eyc.chat.text(data.attachment.payload.text), ttt);
              needsReset = true;
            }
            if (data.attachment.type && data.attachment.type === 'video' && data.attachment.payload.url) {
              if (needsReset) {
                ttt = eyc.empty();
              }
              html = eyc.chat.video(data.attachment.payload.url);
              if (html) {
                ttt.classList.add('chat-video');
                eyc.setMultimedia(html, ttt);
              } else {
                var btn = eyc.chat.button({ title: "Watch Video", url: data.attachment.payload.url, type: "web_url" });
                eyc.setButtons([btn], ttt);
              }
              needsReset = true;
            }
            if (data.attachment.type && data.attachment.type === 'image' && data.attachment.payload.url) {
              if (needsReset) {
                ttt = eyc.empty();
              }
              html = eyc.chat.image(data.attachment.payload.url);
              eyc.setMultimedia(html, ttt);
              needsReset = true;
            }
            if (data.attachment.payload.buttons) {
              if (needsReset) {
                ttt = eyc.empty();
              }
              html = eyc.chat.buttons(data.attachment.payload.buttons);
              if (html && html.length) {
                eyc.setButtons(html, ttt);
              } else {
                eyc.removeEmpty(ttt);
              }
            }
            if (data.attachment.payload.template_type === 'generic') {
              html = eyc.chat.card(eyc, ttt, data.attachment.payload.elements);
            }
          }
          if (data.quick_replies) {
            if (needsReset) {
              ttt = eyc.empty();
            }
            html = eyc.chat.quick_replies(msg, data.quick_replies);
            if (html && html.length) {
              eyc.setButtons(html, ttt);
            } else {
              eyc.removeEmpty(ttt);
            }
          }
        }
        eyc.updateResponses();
        if (msg.typing) {
          eyc.socket.typingElement = eyc.empty();
          resolve();
        } else {
          eyc.socket.typingElement = null;
          resolve();
        }
      });
    },
    escapeString:       function(txt) {
      return txt && txt.toString() ? txt.toString().replace(/&/g, "&amp").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;") : txt
    },
    empty:              function() {
      var na = eyc.workplace.createElement('div');
      na.className = 'server-response-container';
      na.innerHTML = '<div class="server-icon"><div class="server-icon-img"></div></div><div class="server-response">...</div>';
      var aa = eyc.workplace.getElementById('result');
      aa.appendChild(na);
      eyc.scrollToBottom();
      return na;
    },
    handleEvent:        function(evt, type, dt, pos) {
      eyc.isChatting = true;
      var txt = evt || eyc.getInputValue();
      var shouldSend = true;
      if (txt !== 'startWelcome' && txt !== 'reconnect' && type !== 'user_input') {
        if (eyc.socket.turnType && eyc.socket.turnID && (eyc.socket.turnType === 'email' || eyc.socket.turnType === 'tel' || eyc.socket.turnType === 'name')) {
          shouldSend = false;
          var inBtn = eyc.workplace.getElementById(eyc.socket.turnId);
          var input = eyc.workplace.getElementById(window.eySocket.turnId + '-input');
          input.value = n;
          inBtn.click();
        } else {
          if (txt.indexOf('tel:') < 0) {
            if (txt.indexOf('web}') < 0) {
              eyc.addUserRequestNode({text: txt});
              eyc.socket.lastInteraction = { action: "message", payload: JSON.stringify({ text: txt }), typing: false, sender: "user" };
              saveInteraction({ action: "message", payload: JSON.stringify({ text: txt }), typing: false, sender: "user" });
            } else {
              shouldSend = false;
            }
          } else {
            shouldSend = false;
          }
        }
      } else if (type === 'user_input') {
        saveInteraction({ action: "input_value", payload: JSON.stringify({ input_value: txt, id: dt }), typing: false, sender: "user" });
        dt = null;
      }
      if (shouldSend) {
        eyc.socket.typingElement = eyc.empty();
        if (txt === 'reconnect' && eyc.socket.lastInteraction && eyc.chat.is_input(eyc.socket.lastInteraction)) {
        } else {
          delete eyc.socket.turnType;
          delete eyc.socket.turnID;
        }
        eyc.socket.send(JSON.stringify(eyc.buildPayLoad(evt || eyc.getInputValue(), type || 'event', dt, pos)));
      }
      eyc.isChatting = false;
      eyc.scrollToBottom();
    },
    handleInput:        function(type) {
      var n = eyc.getInputValue();
      if ("" !== n.replace(/\s/g, "") && !eyc.isChatting) {
        if (n === 'clear all' || n === 'reset chat') {
          clearAll();
          eyc.addUserRequestNode({text: 'cleared'});
          setTimeout(function() {
            eyc.socket.send(JSON.stringify(eyc.buildPayLoad("", "clear all")));
            eyc.setInputValue("");
            eyc.handleStopSend();
            window.location.href = window.location.pathname + window.location.search + window.location.hash;
          }, 500);
        } else if (eyc.socket.turnType && eyc.socket.turnID && (eyc.socket.turnType === 'email' || eyc.socket.turnType === 'tel' || eyc.socket.turnType === 'name')) {
          var inBtn = eyc.workplace.getElementById(eyc.socket.turnID);
          var input = eyc.workplace.getElementById(eyc.socket.turnID + '-input');
          input.value = n;
          inBtn.click();
          eyc.setInputValue("");
        } else {
          eyc.addUserRequestNode({text: eyc.escapeString(n)});
          eyc.isChatting = true;
          if (n !== 'startWelcome' && n !== 'reconnect') {
            eyc.socket.lastInteraction = { action: "message", payload: JSON.stringify({ text: eyc.escapeString(n) }), typing: false, sender: "user" };
            saveInteraction({ action: "message", payload: JSON.stringify({ text: eyc.escapeString(n) }), typing: false, sender: "user" });
          }
          delete eyc.turnType;
          delete eyc.turnID;
          eyc.socket.send(JSON.stringify(eyc.buildPayLoad(eyc.getInputValue())));
          eyc.setInputValue("");
          eyc.handleStopSend();
        }
        eyc.isChatting = false;
        eyc.scrollToBottom();
      }
    },
    handleInputChange:  function(n) {
      if (n.target.value && n.target.value.length) {
        eyc.handleStartSend();
      } else {
        eyc.handleStopSend();
      }
    },
    handleInputFocus:   function(n) {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
    },
    handleInputKeyDown: function(n) {
      n.keyCode === 13 && (n.preventDefault(), n.stopPropagation(), eyc.checkWS());
    },
    handleSendClick:    function(n) {
      n.preventDefault(), n.stopPropagation(), eyc.checkWS();
    },
    handleStartSend:    function() {
      return eyc.elements.sendBtn.className += " active";
    },
    handleStopSend:     function() {
      var n = new RegExp("(?:^|\\s)active(?!\\S)", "gi");
      return eyc.elements.sendBtn.className = eyc.elements.sendBtn.className.replace(n, "");
    },
    handleWSClose:      function(n) {
      var now = Date.now();
      console.log('ws closed', eyc.connectAttempts);
      if (eyc.socket && eyc.socket.connectTime && (eyc.socket.connectTime + 5000 > now || eyc.connectAttempts < 4)) {
        console.log('reconnecting');
        setTimeout(function() {
          eyc.initializeWS(true);
        }, 1000);
      }
    },
    handleWSError:      function(n) {
      console.error(n, eyc.socket);
      throw 'WS error';
    },
    handleWSMessage:    function(n) {
      eyc.isChatting = false;
      if (n && n.data) {
        var wsRes = JSON.parse(n.data);
        saveSession(wsRes.session);
        if (!eyc.socket.isStarted) {
          eyc.socket.isStarted = true;
          eyc.heartbeat();
        }
        if (wsRes) {
          switch (wsRes.action) {
            case 'reconnect-empty':
              if (eyc.socket.typingElement) {
                eyc.removeEmpty(eyc.socket.typingElement);
                delete eyc.socket.typingElement;
              }
            case 'heartbeat':
              return;
            default:
              wsRes.sender = "server";
              if (wsRes.action !== 'reconnect') {
                eyc.socket.lastInteraction = wsRes;
              }
              if (!eyc.socket.queuedMessages.length) {
                eyc.socket.queuedMessages.push(wsRes);
                eyc.processQueue();
              } else {
                eyc.socket.queuedMessages.push(wsRes);
              }
              if (wsRes.action !== 'reconnect') {
                saveInteraction(wsRes);
              }
              return;
          }
        } else {
          throw "Invalid WS response payload";
        }
      } else {
        throw "Invalid WS response";
      }
    },
    handleWSOpen:       function(n) {
      if (!eyc.socket || !eyc.socket.isStarted) {
        eyc.loadTranscript();
      } else {
        eyc.handleInput();
      }
    },
    heartbeat:          function() {
      if (!eyc.socket) return;
      if (eyc.socket.readyState !== 1) return;
      eyc.socket.send(JSON.stringify(eyc.buildPayLoad("", "heartbeat")));
      setTimeout(eyc.heartbeat, 300000);
    },
    initializeWS:       function(isRestart) {
      eyc.socket = new WebSocket(wssURL+'?uid='+window.getUser().userId+'&username=f95ae20b-6988-407e-95d3-0d1c4620e2de&origin=web');
      eyc.socket.connectTime = Date.now();
      eyc.socket.queuedMessages = [];
      if (isRestart) {
        eyc.socket.isStarted = true;
      } else {
        eyc.socket.isStarted = false;
      }
      eyc.connectAttempts += 1;
      eyc.socket.onerror = eyc.handleWSError;
      eyc.socket.onopen = eyc.handleWSOpen;
      eyc.socket.onmessage = eyc.handleWSMessage;
      eyc.socket.onclose = eyc.handleWSClose;
    },
    inputButton:        function(ee) {
      if (!ee.target.classList.contains('icon-success')) {
        var input = eyc.workplace.getElementById(ee.target.id + '-input');
        var status = eyc.workplace.getElementById(ee.target.id + '-status');
        status.innerHTML = '&nbsp;';
        switch (ee.target.type) {
          case 'email':
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(input.value)) {
              ee.target.classList.remove('icon-send');
              ee.target.classList.add('icon-success');
              var ae = this;
              setTimeout(function() {
                ae.handleEvent(input.value, 'user_input', ee.target.id);
              }, 250);
            } else {
              status.innerHTML = 'Invalid Email';
            }
            break;
          case 'tel':
            var testNum = input.value.replace(/\D+/gm, '');
            if (testNum && testNum.length > 6) {
              ee.target.classList.remove('icon-send');
              ee.target.classList.add('icon-success');
              var ae = this;
              setTimeout(function() {
                ae.handleEvent(input.value, 'user_input', ee.target.id);
              }, 250);
            } else {
              status.innerHTML = 'Invalid Phone Number';
            }
            break;
          case 'name':
            if (/^[a-zA-Z ]+$/.test(input.value) && input.value.length > 2) {
              ee.target.classList.remove('icon-send');
              ee.target.classList.add('icon-success');
              var ae = this;
              setTimeout(function() {
                ae.handleEvent(input.value, 'user_input', ee.target.id);
              }, 250);
            } else {
              status.innerHTML = 'Invalid Name';
            }
            break;
          default:
            break;
        }
      }
    },
    loadTranscript:     function() {
      return eyc.handleEvent('startWelcome', 'startWelcome');
    },
    processQueue:       function() {
      if (eyc.socket.queuedMessages.length) {
        var wsRes = eyc.socket.queuedMessages.shift();
        return eyc.createMessage(wsRes, eyc.socket.typingElement)
          .then(function(r) {
            return eyc.processQueue();
          });
      }
    },
    removeEmpty:        function(nn) {
      nn.classList.add('remove-item');
      setTimeout(function() {
        nn.parentNode.removeChild(nn);
      }, 200);
    },
    scrollToBottom:     function() {
      var q = eyc.elements.queryResultWrapper;
      return q.scrollTop = q.scrollHeight;
    },
    sendButton:         function(ee) {
      if (ee.target.classList.contains('click-to-call')) {
        var aa = eyc.workplace.createElement('a');
        aa.href = 'tel:'+ee.target.id;
        aa.click();
        eyc.handleEvent('tel:'+ee.target.id);
        eyc.scrollToBottom();
      } else if (ee.target.classList.contains('web-url')) {
        var aa = eyc.workplace.createElement('a');
        aa.href = ee.target.value;
        aa.target = '_blank';
        aa.click();
        eyc.handleEvent('web}'+ee.target.value);
        eyc.scrollToBottom();
      } else {
        delete eyc.socket.turnType;
        delete eyc.socket.turnID;
        var flowUUID = ee.target.getAttribute('data-flow-uuid');
        var turnID = parseInt(ee.target.getAttribute('data-turn-id'));
        var pos;
        if (flowUUID && turnID && !isNaN(turnID)) {
          pos = { flowUUID: flowUUID, turnID: turnID };
        }
        eyc.handleEvent(ee.target.id, null, null, pos);
      }
    },
    setButtons:         function(ee, nn) {
      var sc = nn.getElementsByClassName('server-response');
      if (sc && sc.length && sc.length === 1) {
        while (sc[0].firstChild) {
          sc[0].removeChild(sc[0].firstChild);
        }
        var isInput = false;
        for (var i in ee) {
          if (i == 0 && ee.length === 1 && ee[i].classList.contains('user-input-container')) {
            isInput = true;
          }
          sc[0].appendChild(ee[i]);
        }
        if (isInput) {
          sc[0].classList.add('user-input-wrapper');
        } else {
          sc[0].classList.add('chat-buttons');
        }
        return nn;
      } else {
        console.warn('unexpected response', nn);
      }
    },
    setInputValue:      function(e) {
      return eyc.elements.queryInput.value = e;
    },
    setMultimedia:      function(ee, nn) {
      var sc = nn.getElementsByClassName('server-response');
      if (sc && sc.length && sc.length === 1) {
        while (sc[0].firstChild) {
          sc[0].removeChild(sc[0].firstChild);
        }
        sc[0].classList.add('chat-multimedia');
        sc[0].appendChild(ee);
        return nn;
      } else {
        console.warn('unexpected response', nn);
      }
    },
    setText:            function(ee, nn) {
      var sc = nn.getElementsByClassName('server-response');
      if (sc && sc.length && sc.length === 1) {
        sc[0].innerHTML = ee;
        return nn;
      } else {
        console.warn('unexpected response', nn);
      }
    },
    startChat:          function() {
      eyc.mapElements();
      eyc.user = window.getUser();
      eyc.elements.queryInput.addEventListener("keydown", eyc.handleInputKeyDown, !1);
      window.addEventListener("message", eyc.handleChatWindow, !1);
      eyc.elements.queryInput.addEventListener("input", eyc.handleInputChange, !1);
      eyc.elements.sendBtn.addEventListener("click", eyc.handleSendClick, !1);
      eyc.elements.sendBtn.addEventListener("touchstart", eyc.handleSendClick, !1);
      eyc.elements.queryInput.addEventListener("focus", eyc.handleInputFocus, !1);
      if (!eyc.socket) {
        eyc.initializeWS();
      }
      eyc.scrollToBottom();
console.log('test', eyc.socket);
    },
    updateResponses:    function() {
      var tc = [];
      var aa = eyc.workplace.getElementById('result');
      for (var j = aa.childNodes.length - 1; j >= 0; j--) {
        if (aa.childNodes[j].classList.contains('user-request-container') || aa.childNodes[j].classList.contains('remove-item')) {
          break;
        } else {
          var cn = aa.childNodes[j].getElementsByClassName('server-response');
          if (!cn || !cn.length || cn.length !== 1) {
            console.warn('unexpected element', cn);
            break;
          } else if (!cn[0].classList.contains('chat-buttons') && !cn[0].classList.contains('user-input-wrapper')) {
            tc.push(j);
          } else {
            var icon = aa.childNodes[j].getElementsByClassName('server-icon');
            if (!icon || !icon.length || icon.length !== 1) {
              console.warn('unexpected element', icon);
              break;
            }
            icon[0].innerHTML = '';
          }
        }
      }
      for (var k = 0; k < tc.length; k++) {
        var idx = tc[k];
        var icon = aa.childNodes[idx].getElementsByClassName('server-icon');
        if (!icon || !icon.length || icon.length !== 1) {
          console.warn('unexpected element', icon);
          break;
        }
        if (k > 0) {
          icon[0].innerHTML = '';
        } else {
          icon[0].innerHTML = '<div class="server-icon-img"></div>';
        }
      }
      eyc.scrollToBottom();
    }
  };
  window.eyc = eyc;

} catch(e) {
  console.error(e);
  if (typeof gtag !== 'undefined') {
    gtag('event', window.location.hostname, { event_category: 'chat_client_error', event_label: (e && e.stack) ? e.stack : e });
  }
}
