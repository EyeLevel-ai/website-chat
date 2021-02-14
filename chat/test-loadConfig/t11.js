module.exports = {
      eyType: 'un',
      eyConfig: 'ben-test',
      'eyelevel.ai': {
        path: {
          'test*': { config: { flowname: 'ok99', alertText: 'another test', alertTime: 800 }, extras: [ 'test2*' ] },
          '^/test34*': { config: { flowname: 'abc123', alertText: 'test alert', alertTime: 5000 } },
          '*': { config: { hidden: true } }
        }
      },
      'golang.org': {
        path: {
          'test55*': { config: { flowname: 'ok99', alertText: 'another test', alertTime: 5000 }, extras: [ 'test25*' ] },
          '*': { config: { flowname: 'abc123', alertText: 'test alert', alertTime: 800 } }
        }
      }
    };