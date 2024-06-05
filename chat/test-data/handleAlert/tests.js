var t1a = require('./t1a');
var t1b = require('./t1b');
var t1c = require('./t1c');
var t1d = require('./t1d');

module.exports=[
  {
    answer: 1,
    tests: [
      { a: t1a.behavior, b: t1a.config, c: false },
      { a: t1b.behavior, b: t1b.config, c: false },
    ],
  },
  {
    answer: 0,
    tests: [
      { a: t1b.behavior, b: t1b.config, c: false },
      { a: t1a.behavior, b: t1a.config, c: false },
    ],
  },
  {
    answer: 1,
    tests: [
      { a: t1a.behavior, b: t1a.config, c: false },
      { a: t1d.behavior, b: t1d.config, c: false },
      { a: t1c.behavior, b: t1c.config, c: false },
    ],
  },
  {
    answer: 1,
    tests: [
      { a: t1a.behavior, b: t1a.config, c: false },
      { a: t1d.behavior, b: t1d.config, c: false },
      { a: t1b.behavior, b: t1b.config, c: false },
    ],
  },
  {
    answer: 1,
    tests: [
      { a: t1a.behavior, b: t1a.config, c: false },
      { a: t1d.behavior, b: t1d.config, c: false },
      { a: t1b.behavior, b: t1b.config, c: false },
      { a: t1c.behavior, b: t1c.config, c: false },
    ],
  },
  {
    answer: 0,
    tests: [
      { a: t1d.behavior, b: t1d.config, c: false },
      { a: t1a.behavior, b: t1a.config, c: false },
      { a: t1b.behavior, b: t1b.config, c: false },
      { a: t1c.behavior, b: t1c.config, c: false },
    ],
  },
  {
    answer: 1,
    tests: [
      { a: t1a.behavior, b: t1a.config, c: false },
      { a: t1c.behavior, b: t1c.config, c: false },
    ],
  },
  {
    answer: 1,
    tests: [
      { a: t1c.behavior, b: t1c.config, c: false },
      { a: t1a.behavior, b: t1a.config, c: false },
    ],
  },
  {
    answer: 3,
    tests: [
      { a: t1a.behavior, b: t1a.config, c: false },
      { a: t1d.behavior, b: t1d.config, c: false },
      { a: t1b.behavior, b: t1b.config, c: false },
      { a: t1c.behavior, b: t1c.config, c: true },
    ],
  },
  {
    answer: 4,
    tests: [
      { a: t1a.behavior, b: t1a.config, c: false },
      { a: t1d.behavior, b: t1d.config, c: false },
      { a: t1b.behavior, b: t1b.config, c: false },
      { a: t1c.behavior, b: t1c.config, c: true },
      { a: { alertText: 'Hi from Reactful', alertTime: 200, returnText: 'Hi again from Reactful' }, b: { eyType: 'fn', eyConfig: 'reactful-test-1' }, c: true }
    ],
  },
  {
    alerts: 'manual',
    tests: [
      { a: t1a.behavior, b: t1a.config, c: false },
      { a: t1d.behavior, b: t1d.config, c: false },
      { a: t1b.behavior, b: t1b.config, c: false },
      { a: t1c.behavior, b: t1c.config, c: false },
      { a: { alertText: 'Hi from Reactful', alertTime: 200, returnText: 'Hi again from Reactful' }, b: { eyType: 'fn', eyConfig: 'reactful-test-1' }, c: false }
    ],
  },
  {
    answer: 4,
    alerts: 'manual',
    tests: [
      { a: t1a.behavior, b: t1a.config, c: false },
      { a: t1d.behavior, b: t1d.config, c: false },
      { a: t1b.behavior, b: t1b.config, c: false },
      { a: t1c.behavior, b: t1c.config, c: false },
      { a: { alertText: 'Hi from Reactful', alertTime: 200, returnText: 'Hi again from Reactful' }, b: { eyType: 'fn', eyConfig: 'reactful-test-1' }, c: true }
    ],
  },
];