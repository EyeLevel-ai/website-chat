module.exports = {
      eyType: 'un',
      eyConfig: 'ben-test',
      '*': {
        path: {
          'test*': { config: { flowname: 'abc123', alertText: 'test alert', alertTime: 8000 } },
          '*': { config: { flowname: 'ok99', alertText: 'another test', alertTime: 5000 } }
        }
      }
    };