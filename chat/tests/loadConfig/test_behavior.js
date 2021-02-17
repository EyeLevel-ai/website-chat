var window = {};
var document = {};

checkExtras = function(config, isExtra) {
  if (isExtra) {
    return true;
  }
  if (config.extras) {
    for (var i in config.extras) {
      var check = validatePath(config.extras[i], config, true);
      if (!check) {
        return false;
      }
    }
  }
  return true;
}

validatePath = function(path, config, isExtra) {
  var isExact = path.indexOf('*') > -1 ? false : true;
  var isNot = path[0] && path[0] === '^' ? true : false;
  path = isNot ? path.replace('^', '') : path;
  var testPath = window.location.pathname + (window.location.search || '');

  if (isExact) {
    if ((isNot && testPath !== path) || (!isNot && testPath === path)) {
      if (checkExtras(config, isExtra)) {
        return config.config;
      }
    }
    if (config.config && config.config.isIframe) {
      if (document.referrer && document.referrer.indexOf('/') > -1) {
        var qq = document.referrer.substring(document.referrer.indexOf('/'));
        qq = qq.substring(1);
        qq = qq.split('?')[0];
        if ((isNot && qq !== path) || (!isNot && qq === path)) {
          if (checkExtras(config, isExtra)) {
            return config.config;
          }
        }
      }
    }
  } else {
    if ((isNot && testPath.indexOf(path.replace('*','')) < 0) || (!isNot && testPath.indexOf(path.replace('*','')) > -1)) {
      if (checkExtras(config, isExtra)) {
        return config.config;
      }
    }
    if (config.config && config.config.isIframe) {
      if (document.referrer && document.referrer.indexOf('/') > -1) {
        var qq = document.referrer.substring(document.referrer.indexOf('/'));
        qq = qq.substring(1);
        qq = qq.split('?')[0];
        if ((isNot && qq.indexOf(path.replace('*','')) < 0) || (!isNot && qq.indexOf(path.replace('*','')) > -1)) {
          if (checkExtras(config, isExtra)) {
            return config.config;
          }
        }
      }
    }
  }
}

loadBehavior = function(config) {
    var chatBehavior;

    var host = window.location.hostname;
    host = host.indexOf('www.') === 0 ? host.replace('www.', '') : host;
    for (var k in config) {
      if (host === k) {
        chatBehavior = config[k].config;
        for (var j in config[k].path) {
          var bj = validatePath(j, config[k].path[j]);
          if (bj) {
            chatBehavior = bj;
            break;
          }
        }
        break;
      }
    }
    if (!chatBehavior && config['*']) {
      chatBehavior = config['*'].config;
      for (var j in config['*'].path) {
        var bj = validatePath(j, config['*'].path[j]);
        if (bj) {
          chatBehavior = bj;
          break;
        }
      }
    }


    return chatBehavior;
}


var tests = require('./test_behavior_tests');
var cases = require('./test_behavior_cases');

var ti = 0;
for (var k in tests) {
  var ts = require('./' + k);
  for (var i in cases) {
    window.location = cases[i];
    document.referrer = window.location.hostname+window.location.pathname+(window.location.search || '');
    var res = loadBehavior(ts);
    if (!tests[k][i] && tests[k][i] !== '') {
      throw 'Missing test case: ' + k + ':' + i;
    }
    var resJson= JSON.stringify(res);
    if (typeof resJson === 'undefined') {
      resJson = '';
    }
    if (resJson !== tests[k][i]) {
      ti += 1;
      console.log(`[${k}:${i}] TEST FAIL`);
      console.log(window.location.hostname+window.location.pathname+(window.location.search || ''));
      console.log('Expected', tests[k][i]);
      console.log('Got', JSON.stringify(res), "\n");
    }
  }
}

if (ti === 0) {
  console.log('SUCCESS');
} else {
  console.log('TESTS FAILED: ', ti);
}