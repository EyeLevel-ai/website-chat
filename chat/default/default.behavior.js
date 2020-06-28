!function(){
  var eyAlertTime = 5000;
  var eyAlertText = 'Welcome! Would you like to see a demo of EyeLevel? It\'s the quickest way to understand what we do.';
  var eyReturnTime = 5000;
  var eyReturnText = 'Welcome back. Is there anything we can help you with?';

  window.addEventListener('load', function() {
    if (!window.isOpen) {
      if (window.isReturn) {
        setTimeout(function() {
          if (!window.isOpen) {
            window.initAlertFrame(eyReturnText);
            window.initBadgeFrame(1);
          }
        }, eyReturnTime);
      } else {
        setTimeout(function() {
          if (!window.isReturn && !window.isOpen && eyAlertText && eyAlertText.length) {
            window.initAlertFrame(eyAlertText);
            window.initBadgeFrame(1);
          }
        }, eyAlertTime);
      }
    }
  }, false);
}();
