jest.useFakeTimers();

Object.defineProperty(window, 'innerWidth', {
  configurable: true,
  writable: true,
  value: 390,
});

Object.defineProperty(window, 'innerHeight', {
  configurable: true,
  writable: true,
  value: 844,
});

window.visualViewport = new EventTarget();
window.visualViewport.height = 844;
window.visualViewport.offsetTop = 0;
window.visualViewport.pageTop = 0;

require('../eyelevel');

function getVisibleSection() {
  document.body.innerHTML = '<section class="ey-section ey-section-visible"></section>';
  return document.querySelector('.ey-section-visible');
}

function mockViewportPan(section) {
  section.getBoundingClientRect = () => {
    const inlineTop = parseFloat(section.style.top) || 0;
    const renderedTop = inlineTop - window.visualViewport.offsetTop;
    return {
      top: renderedTop,
      right: 390,
      bottom: renderedTop + window.visualViewport.height,
      left: 0,
      width: 390,
      height: window.visualViewport.height,
      x: 0,
      y: renderedTop,
      toJSON: () => ({}),
    };
  };
}

describe('mobile visual viewport sizing', () => {
  beforeEach(() => {
    jest.advanceTimersByTime(700);
    jest.clearAllTimers();
    window.innerWidth = 390;
    window.innerHeight = 844;
    window.visualViewport.height = 844;
    window.visualViewport.offsetTop = 0;
    window.visualViewport.pageTop = 0;
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('positions the chat from the visual viewport instead of the page scroll position', () => {
    const section = getVisibleSection();
    mockViewportPan(section);
    window.visualViewport.height = 420;
    window.visualViewport.offsetTop = 48;
    window.visualViewport.pageTop = 190;

    window.visualViewport.dispatchEvent(new Event('resize'));

    expect(section.style.top).toBe('48px');
    expect(section.style.height).toBe('420px');
  });

  test('keeps zero as the valid top position when the keyboard only reduces height', () => {
    const section = getVisibleSection();
    window.visualViewport.height = 420;
    window.visualViewport.offsetTop = 0;
    window.visualViewport.pageTop = 0;

    window.visualViewport.dispatchEvent(new Event('resize'));

    expect(section.style.top).toBe('0px');
    expect(section.style.height).toBe('420px');
  });

  test('keeps an already aligned panel at the rendered top when offsetTop is nonzero', () => {
    const section = getVisibleSection();
    section.getBoundingClientRect = () => ({
      top: 0,
      right: 390,
      bottom: 420,
      left: 0,
      width: 390,
      height: 420,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    window.visualViewport.height = 420;
    window.visualViewport.offsetTop = 48;
    window.visualViewport.pageTop = 190;

    window.visualViewport.dispatchEvent(new Event('resize'));

    expect(section.style.top).toBe('0px');
    expect(section.style.height).toBe('420px');
  });

  test('captures viewport values that settle after the first resize event', () => {
    const section = getVisibleSection();
    mockViewportPan(section);
    window.visualViewport.height = 420;
    window.visualViewport.offsetTop = 48;
    window.visualViewport.pageTop = 190;

    window.visualViewport.dispatchEvent(new Event('resize'));

    window.visualViewport.height = 844;
    window.visualViewport.offsetTop = 0;
    window.visualViewport.pageTop = 0;
    jest.advanceTimersByTime(650);

    expect(section.style.top).toBe('0px');
    expect(section.style.height).toBe('844px');
  });

  test('resynchronizes when the visual viewport scrolls without resizing', () => {
    const section = getVisibleSection();
    mockViewportPan(section);
    window.visualViewport.height = 420;
    window.visualViewport.offsetTop = 48;
    window.visualViewport.pageTop = 190;
    window.visualViewport.dispatchEvent(new Event('resize'));

    window.visualViewport.offsetTop = 12;
    window.visualViewport.pageTop = 154;
    window.visualViewport.dispatchEvent(new Event('scroll'));

    expect(section.style.top).toBe('12px');
  });

  test('sizes a chat that is configured to start open', () => {
    document.body.innerHTML = '';
    window.visualViewport.height = 420;
    window.visualViewport.offsetTop = 48;
    window.visualViewport.pageTop = 190;
    const rectSpy = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function() {
        const inlineTop = parseFloat(this.style.top) || 0;
        return {
          top: inlineTop - window.visualViewport.offsetTop,
          right: 390,
          bottom: inlineTop - window.visualViewport.offsetTop + window.visualViewport.height,
          left: 0,
          width: 390,
          height: window.visualViewport.height,
          x: 0,
          y: inlineTop - window.visualViewport.offsetTop,
          toJSON: () => ({}),
        };
      });

    window.initChatFrame('customer', 'flow', true, 'web', false);

    const section = document.querySelector('.ey-section-visible');
    expect(section.style.top).toBe('48px');
    expect(section.style.height).toBe('420px');
    rectSpy.mockRestore();
  });

  test('does not animate viewport-controlled position and size', () => {
    document.body.innerHTML = '';

    window.initChatStyle('web');

    const css = document.querySelector('style').textContent;
    for (const className of ['ey-section-invisible', 'ey-section-visible', 'ey-section-open']) {
      const rule = css.match(new RegExp(`\\.${className}\\s*\\{([^}]*)\\}`));
      expect(rule).not.toBeNull();
      expect(rule[1]).toContain('transition:opacity');
      expect(rule[1]).not.toContain('transition:all');
    }
  });
});
