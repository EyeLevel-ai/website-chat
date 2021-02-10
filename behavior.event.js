!function(){
  var config = {
    '*': {
		  config: { flowname: '01EJ9SJMHA7KR77YZGA0KH63NR', video: { full: 'https://css.eyelevel.ai/01EJ9SJMHA7KR77YZGA0KH63NR/intro.mp4', thumb: 'https://css.eyelevel.ai/01EJ9SJMHA7KR77YZGA0KH63NR/thumb.mp4', img: 'https://css.eyelevel.ai/01EJ9SJMHA7KR77YZGA0KH63NR/thumb.jpg' } }
		},
		eyType: 'fn',
		eyConfig: '01EJ9SJMHA7KR77YZGA0KH63NR'
  };

  window.isOpen = true;

  window.loadBehavior(config);

  function gtag_report_conversion(ev) {
    var callback = function () {
      if (typeof(url) != 'undefined') {
        window.location = url;
      }
    };
    gtag('event', 'conversion', {
        'send_to': ev,
        'event_callback': callback
    });
    return false;
  }

  window.addEventListener('message', function(e) {
    if (e && e.data) {
      if (e.data === 'chat-opened' && !window.eyIsInit) {
        window.eyIsInit = true;
        gtag_report_conversion('AW-765138786/VKZICK3C7uABEOKu7OwC');
      } else if (e.data.indexOf('set-event:') === 0) {
        var ev = e.data.replace('set-event:', '');
        if (ev === 'submit' && gtag) {
          gtag_report_conversion('AW-765138786/8TgRCPmE7uABEOKu7OwC');
        }
      }
    }
  });

}();
