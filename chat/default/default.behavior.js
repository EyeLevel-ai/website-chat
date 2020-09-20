!function(){
/*
  if (window.ConsentCheck) {
    var consent = { type: "general|gdpr", action: "message", payload: JSON.stringify({ attachment: { "payload": {
      buttons:[
        {
          type: "consent",
          title: "Yes, I accept",
          value: true
        }, {
          type: "consent",
          title: "No, not now",
          value: false
        }
      ],
      text: "Hey there! We would love to talk to you. Under EU General Data Protection Regulation, we need your approval for our use of personal information (e.g. name, email) you may provide us. We will store your info so we can use it in our conversations with you. We may send follow up emails based on our discussions here. We may send you emails about our services and promotions.",
      template_type: "button" }, type: "template" }}), typing: false, sender: "server" };
    window.ConsentCheck(consent);
  }
*/

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
/*
    'speatly.com': {
      path: {
        '/contact*': {
          config: { flowname: '01EDWB8BZAXRWS35F5ENPMPW95', alertText: 'Let\'s talk! How would you prefer to connect?', alertTime: 2500 }
        },
        '/' : {
          config: { flowname: '01EFD0MNGDG1MTGJ2AW1EFB90A', alertText: 'Welcome! We\'re happy to answer any questions you may have.', alertTime: 5000 }
        },
        '/map*' : {
          config: { flowname: '01EF5ATHTN6WQ7YY2AXJV8PZ7W', alertText: 'Want to receive automated updates related to your search? Or help with doing a more specific search?', alertTime: 2500 }
        }
      }
		},
		'*' : {
		  path: {
        '/contact*': {
          config: { flowname: '01EDWB8BZAXRWS35F5ENPMPW95', alertText: 'Let\'s talk! How would you prefer to connect?', alertTime: 2500 }
        },
        '/' : {
          config: { flowname: '01EFD0MNGDG1MTGJ2AW1EFB90A', alertText: 'Welcome! We\'re happy to answer any questions you may have.', alertTime: 5000 }
        },
        '/map*' : {
          config: { flowname: '01EF5ATHTN6WQ7YY2AXJV8PZ7W', alertText: 'Want to receive automated updates related to your search? Or help with doing a more specific search?', alertTime: 2500 }
        }
      },
      config: { flowname: '01EFD0MNGDG1MTGJ2AW1EFB90A', alertText: 'Welcome! We\'re happy to answer any questions you may have.', alertTime: 5000 }
		},
		config: { hidden: true },
		eyType: 'un',
		eyConfig: '80b18ccc-8f1a-472d-a542-e1381e86a513'
*/
  };

  window.loadBehavior(config);
}();
