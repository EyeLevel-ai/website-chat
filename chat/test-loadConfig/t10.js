module.exports = {
      eyType: 'un',
      eyConfig: 'ben-test',
      'eyelevel.ai': {
        path: {
          'test*': { config: { flowname: 'ok99', alertText: 'another test', alertTime: 8000 }, extras: [ 'test2*' ] },
          '*': { config: { flowname: 'abc123', alertText: 'test alert', alertTime: 5000 } }
        }
      },
      'golang.org': {
        path: {
          '*': { config: { flowname: 'abc123', alertText: 'test alert2', alertTime: 5000 } }
        }
      }
    };