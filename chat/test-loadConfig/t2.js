module.exports = {
      eyType: 'un',
      eyConfig: 'ben-test',
      '*': {
        path: {
          'test*': { config: { flowname: 'abc123' }, extras: [ '^ass*' ] },
          '*': { config: { hidden: true } }
        }
      }
    };