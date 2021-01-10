!function(){
  function isInViewPort(el) {
    var top = el.offsetTop;
    var left = el.offsetLeft;
    var width = el.offsetWidth;
    var height = el.offsetHeight;
  
    while(el.offsetParent) {
      el = el.offsetParent;
      top += el.offsetTop;
      left += el.offsetLeft;
    }
  
    return (
      top < (window.pageYOffset + window.innerHeight) &&
      left < (window.pageXOffset + window.innerWidth) &&
      (top + height) > window.pageYOffset &&
      (left + width) > window.pageXOffset
    );
  }

  var config = {
    eyType: 'un',
    eyConfig: 'd869abec-071b-4a96-a80c-e6c386dd1bc5',
    '*': {
      path: {
        '/products*': { config: { flowname: '01ETN2SBCBR10Z13VQY9BEWPVD', alertText: 'Hi there. 👋  Any questions we can answer for you?', alertTime: -1, alwaysShow: true } },
        '*': { config: { hidden: true } }
      }
    }
  };

  var chatBehavior = window.loadBehavior(config);
  if (!window.isOpen && chatBehavior && chatBehavior.alertText) {
    var faq;
    var alertFired = false;
    var checkingElement = false;
    window.addEventListener('load', function () {
      if (!alertFired) {
        if (!faq) {
          var faqCnt = document.getElementsByClassName('custom-faq');
          if (faqCnt.length === 1) {
            faq = faqCnt[0];
          }
        }
        if (!checkingElement) {
          checkingElement = true;
          if (isInViewPort(faq)) {
            window.initAlertFrame(chatBehavior.alertText, config.eyType, config.eyConfig);
            window.initBadgeFrame(1);
            alertFired = true;
          }
          checkingElement = false;
        }
      }
      document.addEventListener('scroll', function() {
        if (!alertFired) {
          if (!faq) {
            var faqCnt = document.getElementsByClassName('custom-faq');
            if (faqCnt.length === 1) {
              faq = faqCnt[0];
            }
          }
          if (!checkingElement) {
            checkingElement = true;
            setTimeout(function() {
              if (isInViewPort(faq)) {
                window.initAlertFrame(chatBehavior.alertText, config.eyType, config.eyConfig);
                window.initBadgeFrame(1);
                alertFired = true;
              }
              checkingElement = false;
            }, 500);
          }
        }
      });
    });
  }

}();