module.exports = {
      eyType: 'un',
      eyConfig: 'ben-test',
      '*': {
        path: {
          'test*': { config: { flowname: 'abc123', alertText: 'test alert', alertTime: 8000 }, extras: [ '^/ass*' ] },
          '*': { config: { hidden: true } }
        }
      }
    };