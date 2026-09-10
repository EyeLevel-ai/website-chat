const {
  collectAskVetHistoryChunk,
  mergeAskVetHistory,
  reconnectTransferredUser,
} = require('../agent');

function interaction(sender, text, rawText) {
  return {
    action: 'message',
    payload: JSON.stringify({ sender, text, rawText }),
    sender: sender === 'user' ? 'user' : 'server',
    time: 1788906254000,
    typing: false,
  };
}

describe('AskVet reconnect history', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete window.eySocket;
    delete window.eyTransferResumePending;
    window.user = { isTransfer: true };
  });

  test('collects chunked history in provider order and ignores retries', () => {
    let state;
    let result = collectAskVetHistoryChunk(state, {
      sessionId: 'session-1', index: 1, total: 2,
      role: 'agent', message: { text: 'Second', timestamp: 20 },
    });
    state = result.state;
    expect(result.history).toBeNull();

    result = collectAskVetHistoryChunk(state, {
      sessionId: 'session-1', index: 1, total: 2,
      role: 'agent', message: { text: 'Second', timestamp: 20 },
    });
    state = result.state;
    expect(result.history).toBeNull();

    result = collectAskVetHistoryChunk(state, {
      sessionId: 'session-1', index: 0, total: 2,
      role: 'user', message: { text: 'First', timestamp: 10 },
    });

    expect(result.history).toEqual([
      { role: 'user', text: 'First', timestamp: 10 },
      { role: 'agent', text: 'Second', timestamp: 20 },
    ]);
  });

  test('adds only messages missing from local browser history', () => {
    const existing = [
      interaction('user', 'Hi', 'Hi'),
      interaction('agent', 'Hello'),
    ];
    const recovered = [
      { role: 'user', text: 'Hi', timestamp: 1788906254 },
      { role: 'agent', text: 'Hello', timestamp: 1788906255 },
      { role: 'agent', text: 'While you were away', timestamp: 1788906256 },
    ];

    const result = mergeAskVetHistory(existing, recovered, false);

    expect(result.added).toHaveLength(1);
    expect(result.history).toHaveLength(3);
    expect(result.added[0].sender).toBe('server');
    expect(result.added[0].time).toBe(1788906256000);
    expect(result.added[0].seen).toBe(false);
    expect(JSON.parse(result.added[0].payload).text).toBe('While you were away');
    expect(mergeAskVetHistory(result.history, recovered).added).toHaveLength(0);
  });

  test('preserves repeated messages by occurrence count', () => {
    const existing = [interaction('agent', 'Still there?')];
    const recovered = [
      { role: 'agent', text: 'Still there?', timestamp: 10 },
      { role: 'agent', text: 'Still there?', timestamp: 20 },
    ];

    const result = mergeAskVetHistory(existing, recovered);

    expect(result.added).toHaveLength(1);
    expect(result.history).toHaveLength(2);
  });

  test('keeps recovered user text safe for browser rendering', () => {
    const result = mergeAskVetHistory([], [
      { role: 'user', text: '<script>alert(1)</script>', timestamp: 10 },
    ]);

    const payload = JSON.parse(result.added[0].payload);
    expect(payload.rawText).toBe('<script>alert(1)</script>');
    expect(payload.text).not.toContain('<script>');
    expect(result.added[0].seen).toBeUndefined();
  });

  test('replaces the socket only for a transferred user returning visible', () => {
    const oldSocket = { close: jest.fn(), onclose: jest.fn() };
    const agent = { initializeWS: jest.fn() };
    window.eySocket = oldSocket;
    window.isChatting = true;

    expect(reconnectTransferredUser(agent, 'hidden')).toBe(false);
    expect(reconnectTransferredUser(agent, 'visible')).toBe(true);
    expect(oldSocket.close).toHaveBeenCalledTimes(1);
    expect(agent.initializeWS).toHaveBeenCalledWith(true);
    expect(window.eyTransferResumePending).toBe(true);
    expect(window.isChatting).toBe(false);

    expect(reconnectTransferredUser(agent, 'visible')).toBe(false);
    window.user.isTransfer = false;
    window.eyTransferResumePending = false;
    expect(reconnectTransferredUser(agent, 'visible')).toBe(false);
  });
});
