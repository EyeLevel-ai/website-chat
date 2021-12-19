!function(){
  var config = {
    eyType: 'un',
    eyConfig: 'df2ba431-c508-4d8e-8fcd-27b2c5fd69e2',
    'chat.eyelevel.ai': {
      path: {
        '*': { config: { flowname: '01F0Y5PTJHJSB9WHRF5V1M0B14', alertText: 'Hi there. 👋  Welcome to our QR code chat demo.', alertTime: 5000 } }
      }
    },
    'eyelevel.ai': {
      path: {
        '*': { config: { reset: true, flowname: '01EG132J4563XWPG1X7JZE6V60', alertText: 'Hi! 👋  This is your opening message. Greet and ask a question to confirm they are a lead.', alertTime: 5000 } }
      }
    }
  };
  window.loadBehavior(config);
}();