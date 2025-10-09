const { escapeAndDecorateString } = require('../agent');

const qTests = [
  {text: 'test text', isStreaming: false, expect: 'test text'},
  {text: 'test text', isStreaming: true, expect: 'test text'},
  {text: 'Hello <world>', isStreaming: false, expect: 'Hello &lt;world&gt;'},
  {text: 'Hello <world>', isStreaming: true, expect: 'Hello <world>'},
  {text: 'Check this link: https://example.com!!ok thanks.', isStreaming: false, expect: 'Check this link: <a href="https://example.com" target="_blank">https://example.com</a>!!ok thanks.'},
  {text: 'Check this link: https://example.com!!ok thanks.', isStreaming: true, expect: 'Check this link: <a href="https://example.com" target="_blank">https://example.com</a>!!ok thanks.'},
  {text: 'This & that', isStreaming: false, expect: 'This &amp that'},
  {text: 'This & that', isStreaming: true, expect: 'This & that'},
  {text: 'Text with <tag> and a URL: https://example.com', isStreaming: false, expect: 'Text with &lt;tag&gt; and a URL: <a href="https://example.com" target="_blank">https://example.com</a>'},
  {text: 'Text with <tag> and a URL: https://example.com', isStreaming: true, expect: 'Text with <tag> and a URL: <a href="https://example.com" target="_blank">https://example.com</a>'},
  {text: 'This is a [link](https://example.com)...', isStreaming: false, expect: 'This is a [link](<a href="https://example.com" target="_blank">https://example.com</a>)...'},
  {text: 'This is a [link](https://example.com)...', isStreaming: true, expect: 'This is a [link](https://example.com)...'},
  {text: 'Check this link: https://example.com/test?ok=url%20okk=ase@? !!!ok thanks.', isStreaming: false, expect: 'Check this link: <a href="https://example.com/test?ok=url%20okk=ase@?" target="_blank">https://example.com/test?ok=url%20okk=ase@?</a> !!!ok thanks.'},
  {text: 'Check this link: https://example.com/test?ok=url%20okk=ase@? !!!ok thanks.', isStreaming: true, expect: 'Check this link: <a href="https://example.com/test?ok=url%20okk=ase@?" target="_blank">https://example.com/test?ok=url%20okk=ase@?</a> !!!ok thanks.'},
  {text: '[BLUE Delectables Tasty Chicken Topper](https://bluebuffalo.com/dog-food-toppers/delectables/tasty-chicken-topper/): This topper includes meaty morsels of real chicken in a savory broth with garden veggies. It’s grain-free and can be used as a topper, mixer, or snack.', isStreaming: true, expect: '[BLUE Delectables Tasty Chicken Topper](https://bluebuffalo.com/dog-food-toppers/delectables/tasty-chicken-topper/): This topper includes meaty morsels of real chicken in a savory broth with garden veggies. It’s grain-free and can be used as a topper, mixer, or snack.'},
];

const queryIdx = [];

let queryTests = qTests;

if (queryIdx.length > 0) {
  if (queryIdx[0] === -1) {
    queryTests = [];
  } else {
    queryTests = qTests.filter((_, index) => queryIdx.includes(index));
  }
}

if (queryTests.length > 0) {
  describe('escapeAndDecorateString', () => {
    test.each(queryTests)('$text ', (dict) => {
      const res = escapeAndDecorateString(dict.text, dict.isStreaming);
      try {
        expect(res).toBe(dict.expect);
      } catch (error) {
        throw new Error(`[${dict.text}] [${dict.isStreaming}] failed: expected ${dict.expect}
got ${res}`);
      }
    });
  });
}