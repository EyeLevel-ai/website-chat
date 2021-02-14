module.exports = {
      eyType: 'un',
      eyConfig: 'ben-test',
      '*': {
        path: {
          'test*': { config: { flowname: 'abc123', alertText: 'test alert', alertTime: 8000 }, extras: [ '^ass*' ] },
          'ab*': { config: { flowname: 'ok99' }, extras: [ 'cd*' ] },
          '*': { config: { hidden: true } }
        }
      }
    };