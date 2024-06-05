module.exports = {
      eyType: 'un',
      eyConfig: 'ben-test',
      '*': {
        path: {
          'ab*': { config: { flowname: 'ok99', alertText: 'another test', alertTime: 5000 }, extras: [ 'cd*' ] },
          'test*': { config: { flowname: 'abc123', alertText: 'test alert', alertTime: 5000 } },
          '*': { config: { hidden: true } }
        }
      }
    };