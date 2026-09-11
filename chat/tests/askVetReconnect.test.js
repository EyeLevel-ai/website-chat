const {
  collectAskVetHistoryChunk,
  beginTransferRecovery,
  bufferTransferMessage,
  finishTransferRecovery,
  mergeAskVetHistory,
  prepareTransferRecoveryRetry,
  reconnectTransferredUser,
} = require('../agent');

function interaction(sender, text, rawText, time) {
  return {
    action: 'message',
    payload: JSON.stringify({ sender, text, rawText }),
    sender: sender === 'user' ? 'user' : 'server',
    time: time || 1788906254000,
    typing: false,
  };
}

describe('AskVet reconnect history', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete window.eySocket;
    delete window.eyTransferResumePending;
    delete window.eyTransferRecoveryPending;
    delete window.eyTransferLiveMessages;
    window.user = { isTransfer: true, transferPlatform: 'askvet' };
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
      { index: 0, role: 'user', text: 'First', timestamp: 10 },
      { index: 1, role: 'agent', text: 'Second', timestamp: 20 },
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

    const result = mergeAskVetHistory(existing, recovered, false, 'session-1');

    expect(result.added).toHaveLength(1);
    expect(result.history).toHaveLength(3);
    expect(result.added[0].sender).toBe('server');
    expect(result.added[0].time).toBe(1788906256000);
    expect(result.added[0].seen).toBe(false);
    expect(JSON.parse(result.added[0].payload).text).toBe('While you were away');
    expect(mergeAskVetHistory(result.history, recovered, false, 'session-1').added).toHaveLength(0);
  });

  test('preserves repeated messages by occurrence count', () => {
    const existing = [interaction('agent', 'Still there?', undefined, 10000)];
    const recovered = [
      { role: 'agent', text: 'Still there?', timestamp: 10 },
      { role: 'agent', text: 'Still there?', timestamp: 20 },
    ];

    const result = mergeAskVetHistory(existing, recovered, false, 'session-1');

    expect(result.added).toHaveLength(1);
    expect(result.history).toHaveLength(2);
  });

  test('does not suppress the same text from an earlier AskVet session', () => {
    const existing = [interaction('agent', 'Your veterinarian will reply shortly.', undefined, 1000)];
    const recovered = [
      { role: 'agent', text: 'Your veterinarian will reply shortly.', timestamp: 2 },
    ];

    const result = mergeAskVetHistory(existing, recovered, false, 'session-2', 1);

    expect(result.added).toHaveLength(1);
    expect(result.history).toHaveLength(2);
  });

  test('places recovered messages before newer live messages', () => {
    const existing = [
      interaction('agent', 'A', undefined, 1000),
      interaction('agent', 'C', undefined, 3000),
    ];
    const recovered = [
      { role: 'agent', text: 'A', timestamp: 1 },
      { role: 'agent', text: 'B', timestamp: 2 },
    ];

    const result = mergeAskVetHistory(existing, recovered, false, 'session-1');

    expect(result.history.map((item) => JSON.parse(item.payload).text)).toEqual(['A', 'B', 'C']);
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

  test('does not replace a non-AskVet transfer socket', () => {
    const oldSocket = { close: jest.fn(), onclose: jest.fn() };
    const agent = { initializeWS: jest.fn() };
    window.user.transferPlatform = 'slack';
    window.eySocket = oldSocket;

    expect(reconnectTransferredUser(agent, 'visible')).toBe(false);
    expect(oldSocket.close).not.toHaveBeenCalled();
    expect(agent.initializeWS).not.toHaveBeenCalled();
  });

  test('persists the transfer platform used by foreground reconnect', () => {
    setTransfer(true, 'askvet');

    expect(window.localStorage.getItem('eyelevel.user.transferPlatform')).toBe('askvet');
    expect(window.user.transferPlatform).toBe('askvet');
  });

  test('records the browser history boundary when an AskVet transfer ends', () => {
    window.localStorage.setItem('eyelevel.user.transfer', 'true');
    window.localStorage.setItem('eyelevel.user.transferPlatform', 'askvet');
    window.localStorage.setItem('eyelevel.conversation.history', JSON.stringify([
      interaction('user', 'First'),
      interaction('agent', 'Second'),
    ]));

    setTransfer(false);

    expect(window.localStorage.getItem('eyelevel.conversation.askVetHistoryStart')).toBe('2');
  });

  test('buffers live messages until transfer recovery finishes', () => {
    const handled = [];
    const agent = { handleWSMessage: (event) => handled.push(event.data) };
    beginTransferRecovery();

    expect(bufferTransferMessage('first', { action: 'message' })).toBe(true);
    expect(bufferTransferMessage('history', { action: 'reconnect-transfer' })).toBe(false);
    expect(bufferTransferMessage('second', { action: 'message' })).toBe(true);

    finishTransferRecovery(agent);

    expect(handled).toEqual(['first', 'second']);
    expect(window.eyTransferRecoveryPending).toBe(false);
  });

  test('waits for recovered messages to render before flushing live messages', async () => {
    const handled = [];
    const agent = { handleWSMessage: (event) => handled.push(event.data) };
    let finishRender;
    beginTransferRecovery();
    window.eyAskVetHistoryRender = new Promise((resolve) => { finishRender = resolve; });
    bufferTransferMessage('live', { action: 'message' });

    const finished = finishTransferRecovery(agent);
    expect(handled).toEqual([]);
    expect(window.eyTransferRecoveryPending).toBe(true);

    finishRender();
    await finished;

    expect(handled).toEqual(['live']);
    expect(window.eyTransferRecoveryPending).toBe(false);
  });

  test('retries interrupted recovery without dropping buffered messages', () => {
    const render = Promise.resolve();
    beginTransferRecovery();
    window.eyAskVetHistoryRender = render;
    bufferTransferMessage('live', { action: 'message' });

    expect(prepareTransferRecoveryRetry()).toBe(true);
    expect(window.eyTransferResumePending).toBe(true);

    beginTransferRecovery();
    expect(window.eyTransferLiveMessages).toEqual(['live']);
    expect(window.eyAskVetHistoryRender).toBe(render);

    window.eyTransferRecoveryPending = false;
    window.eyTransferResumePending = false;
    expect(prepareTransferRecoveryRetry()).toBe(false);
    expect(window.eyTransferResumePending).toBe(false);
  });
});
