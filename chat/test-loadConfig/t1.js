module.exports = {
     eyType: 'un',
     eyConfig: 'ben-test',
     '*': {
       path: {
         'test*': { config: { flowname: 'abc123', alertText: 'test alert', alertTime: 5000 }, extras: [ '^ass*' ] },
         '*': { config: { hidden: true } }
       }
     }
   };