!function(){
  if (window.GDPRCheck) {
    var consent = { action: "message", payload: JSON.stringify({ attachment: { "payload": {
      buttons:[
        {
          type: "gdpr",
          title: "Yes, I accept",
          value: true
        }, {
          type: "gdpr",
          title: "No, not now",
          value: false
        }
      ],
      text: "Hey there! We would love to talk to you. Under EU General Data Protection Regulation, we need your approval for our use of personal information (e.g. name, email) you may provide us. We will store your info so we can use it in our conversations with you. We may send follow up emails based on our discussions here. We may send you emails about our services and promotions.",
      template_type: "button" }, type: "template" }}), typing: false, sender: "server" };
    window.GDPRCheck(consent);
  }

  var config = {
// domain specific behaviors, if URL does not match, load default "*"
// configurable variables include:
//   hidden = true/false hide the chat, default false
//   flowname = EyeLevel unique ID for flow
//   alertText = default alert text, if not set nothing shows
//   alertTime = time before default alert is triggered, default 5 seconds
//   returnText = alert text for returning users who engaged in chat, if not alertText is shown, if no alertText nothing is shown
//   returnTime = time before alert is triggered, default 5 seconds
//   path = object containing path keys and configuration objects
    'speatly.com': {
      path: {
        '/contact': {
          config: { flowname: '01ED9P3FY1R82HF5RRGHMJRF33', alertText: 'Let\'s talk! How would you prefer to connect?', alertTime: 5000 }
        }
      }
    },
    '*' : {
      config: { alertTime: 5000, alertText: 'Welcome to Get the Gallery! Want some help getting started?', returnTime: 5000, returnText: 'Welcome back. Is there anything we can help you with?' }
    }
  };

  if (window.loadBehavior) {
    window.loadBehavior(config);
  }
}();
