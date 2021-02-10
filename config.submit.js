!function(){
  window.addEventListener('message', function(e) {
    if (e && e.data && e.data.indexOf) {
      if (e.data.indexOf('set-event:') === 0) {
        var ev = e.data.replace('set-event:', '');
        var da = JSON.parse(ev);
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          'event': 'formSubmissionSuccess',
          'formId': 'eyelevelChat',
          'email': da.email || '',
          'phoneNumber': da.phone || ''
        });
      }
    }
  });

}();
