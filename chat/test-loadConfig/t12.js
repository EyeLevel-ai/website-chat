module.exports = {
      eyType: 'un',
      eyConfig: 'ben-test',
      'eyelevel.ai': {
        path: {
          '*': { config: { flowname: 'abc123', alertText: 'test alert', alertTime: 5000 } }
        }
      },
      'golang.org': {
        path: {
          'test55*': { config: { flowname: 'ok99', alertText: 'another test', alertTime: 5000 }, extras: [ 'test25*' ] },
          '*': { config: { hidden: true } }
        }
      }
    };