module.exports = {
     eyType: 'un',
     eyConfig: 'ben-test',
     'eyelevel.ai': {
       path: {
         '*': { config: { flowname: 'abc123', alertText: 'test alert', alertTime: 5000 } }
       }
     },
     'resources.eyelevel.ai': {
       path: {
         '*': { config: { flowname: 'ok99', alertText: 'another test', alertTime: 8000 } }
       }
     }
   };