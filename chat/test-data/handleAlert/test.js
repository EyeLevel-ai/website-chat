var window = {
  activeAlert: null,
  initAlertFrame: function(rt, cb, ty, cfg) {
    if (cb.correctAlert !== cb.currentTest) {
      console.log('[' + cb.currentTest + ']', "FAILED");
      console.log("EXPECTED", '[' + cb.correctAlert + ']');
      console.log(cb);
    } else {
      console.log('[' + cb.currentTest + ']', 'OK');
    }
  },
  initBadgeFrame: function(n) {
  },
  removeChat: function() {
    console.log('removeChat');
  }
};

  window.loadAlert = function(chatBehavior, config, override) {
    if (window.alerts && window.alerts === 'manual' && !override) {
      return;
    }

    if (window.activeAlert && !override) {
      if (window.activeAlert.type) {
        if (window.activeAlert.type === 'fn') {
          return;
        }
      }
    }
    window.activeAlert = chatBehavior;
    window.activeAlert.type = config.eyType;
    if (chatBehavior && !window.isOpen) {
      if (window.isReturn && chatBehavior.returnText) {
        setTimeout(function() {
          if (!window.isOpen) {
            if (config.eyType === window.activeAlert.type
              && chatBehavior.alertTime === window.activeAlert.alertTime
              && chatBehavior.returnText === window.activeAlert.returnText
            ) {
              window.initAlertFrame(chatBehavior.returnText, chatBehavior, config.eyType, config.eyConfig);
              window.initBadgeFrame(1);
            }
          }
        }, chatBehavior.returnTime || 5000);
      } else if (chatBehavior.alertText) {
        var alertTime = chatBehavior.alertTime || 5000;
        if (alertTime > 0) {
          setTimeout(function() {
            if (!window.isOpen && chatBehavior.alertText) {
              if (config.eyType === window.activeAlert.type
                && chatBehavior.alertTime === window.activeAlert.alertTime
                && chatBehavior.alertText === window.activeAlert.alertText
              ) {
                window.initAlertFrame(chatBehavior.alertText, chatBehavior, config.eyType, config.eyConfig);
                window.initBadgeFrame(1);
              }
            }
          }, alertTime);
        }
      }
    } else if (window.hideChat) {
      window.removeChat();
    }
  }

var tests = require('./tests');

doTest = async function(idx, test) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      window.activeAlert = null;
      if (test.alerts) {
        window.alerts = test.alerts;
      }
      for (var jdx in test.tests) {
        var cs = test.tests[jdx];
        cs.a.currentTest = idx + ':' + jdx;
        cs.a.correctAlert = idx + ':' + test.answer;
        window.loadAlert(cs.a, cs.b, cs.c);
      }
      if (test.alerts) {
        console.log('alerts test loaded', test.alerts);
      }
      resolve();
    }, 3500);
  });
}

doTests = async function() {
  for (var idx in tests) {
    var test = tests[idx];
    await doTest(idx, test);
  }
}

doTests();