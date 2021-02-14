module.exports = {
      eyType: 'un',
      eyConfig: 'ben-test',
      '*': {
        path: {
          'test55*': { config: { flowname: 'third flow', alertText: 'third alert', alertTime: 5000 }, extras: [ '/playground*' ] },
          '/?test=ok*': { config: { flowname: 'abc123', alertText: 'test alert', alertTime: 5000 } },
          '?another=one*': { config: { flowname: 'ok99', alertText: 'another test', alertTime: 8000 } },
          '/playground*': { config: { flowname: 'ok99', alertText: 'another test', alertTime: 5000 } },
          '*': { config: { hidden: true } }
        }
      }
    };