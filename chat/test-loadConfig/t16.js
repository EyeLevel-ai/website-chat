module.exports = {
      eyType: 'un',
      eyConfig: 'ben-test',
      '*': {
        path: {
          '/?test=ok*': { config: { flowname: 'abc123', alertText: 'test alert', alertTime: 5000 } },
          '?another=one*': { config: { flowname: 'ok99', alertText: 'another test', alertTime: 8000 } },
          '/playground?another=one*': { config: { flowname: 'ok99', alertText: 'another test', alertTime: 8000 } },
          '/playground*': { config: { flowname: 'third flow', alertText: 'third alert', alertTime: 5000 } },
          '*': { config: { hidden: true } }
        }
      }
    };