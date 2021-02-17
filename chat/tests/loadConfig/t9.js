module.exports = {
      eyType: 'un',
      eyConfig: 'ben-test',
      '*': {
        path: {
          'test*': { config: { flowname: 'ok99', alertText: 'another test', alertTime: 8000 }, extras: [ 'test2*' ] },
          '*': { config: { flowname: 'abc123', alertText: 'test alert', alertTime: 5000 } }
        }
      }
    };