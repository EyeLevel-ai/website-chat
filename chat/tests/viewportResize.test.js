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

  test('captures viewport values that settle after the first resize event', () => {
    const section = getVisibleSection();
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

    window.initChatFrame('customer', 'flow', true, 'web', false);

    const section = document.querySelector('.ey-section-visible');
    expect(section.style.top).toBe('48px');
    expect(section.style.height).toBe('420px');
  });
});
