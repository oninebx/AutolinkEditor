import initializer from '../src/Initializer';
const { JSDOM } = require('jsdom');

// Mock the DOM environment using JSDOM
const { window } = new JSDOM(`<!DOCTYPE html><body><div id="editor"></div></body>`);
global.document = window.document;
global.window = window;

jest.useFakeTimers();

describe('initializer.setup', () => {
  let target;

  beforeEach(() => {
    // Create a new div element before each test
    target = document.createElement('div');
  });

  test('should enable content editing if target supports contentEditable', () => {
    // Simulate a browser that supports getSelection and createRange
    Object.defineProperty(window, 'getSelection', { value: jest.fn(), configurable: true });
    Object.defineProperty(document, 'createRange', { value: jest.fn(), configurable: true });

    target.contentEditable = 'true';
    target.focus = jest.fn();
    initializer.setup(target);
    expect(target.contentEditable).toBe(true);
    expect(target.focus).toHaveBeenCalled();
  });

  test('should throw an error if target does not support contentEditable', () => {
    expect(() => {
      initializer.setup(null);
    }).toThrow('setup failed: the target element does not exist or does not support the contentEditable attribute');

    expect(() => {
      target.contentEditable = '';
      initializer.setup(target);
    }).toThrow('setup failed: the target element does not exist or does not support the contentEditable attribute');
  });

  test('should throw an error if the browser does not support getSelection or createRange', () => {
    // Simulate a browser that does not support getSelection
    Object.defineProperty(window, 'getSelection', { value: undefined, configurable: true });
    target.contentEditable = 'true';
    expect(() => {
      initializer.setup(target);
    }).toThrow("setup failed: the browser doesn't support getSelection or createRange functions");

    // Simulate a browser that does not support createRange
    Object.defineProperty(window, 'getSelection', { value: jest.fn(), configurable: true });
    Object.defineProperty(document, 'createRange', { value: undefined, configurable: true });
    expect(() => {
      initializer.setup(target);
    }).toThrow("setup failed: the browser doesn't support getSelection or createRange functions");
  });

  test('should call the provided function after a delay', () => {
    const mockFunc = jest.fn();
    const handler = initializer.idle(mockFunc);

    handler('arg1', 'arg2');
    jest.runAllTimers();

    expect(mockFunc).toHaveBeenCalledWith('arg1', 'arg2');
    expect(mockFunc).toHaveBeenCalledTimes(1);
  });

  test('should call the provided function after the specified delay', () => {
    const mockFunc = jest.fn();
    const handler = initializer.idle(mockFunc, 2000);

    handler('arg1', 'arg2');
    jest.advanceTimersByTime(1000);
    expect(mockFunc).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(mockFunc).toHaveBeenCalledWith('arg1', 'arg2');
    expect(mockFunc).toHaveBeenCalledTimes(1);
  });

  test('should reset the timer if called again before delay', () => {
    const mockFunc = jest.fn();
    const handler = initializer.idle(mockFunc);

    handler('arg1', 'arg2');
    jest.advanceTimersByTime(500); // Advance time but not enough to trigger the timeout
    handler('arg3', 'arg4');
    jest.runAllTimers();

    // The first call should be debounced, so only the second call should be executed
    expect(mockFunc).toHaveBeenCalledWith('arg3', 'arg4');
    expect(mockFunc).toHaveBeenCalledTimes(1);
  });

  test('should handle multiple quick successive calls', () => {
    const mockFunc = jest.fn();
    const handler = initializer.idle(mockFunc);

    handler('arg1', 'arg2');
    handler('arg3', 'arg4');
    handler('arg5', 'arg6');

    jest.runAllTimers();

    // Only the last call should be executed
    expect(mockFunc).toHaveBeenCalledWith('arg5', 'arg6');
    expect(mockFunc).toHaveBeenCalledTimes(1);
  });

  test('should clear the timer after function execution', () => {
    const mockFunc = jest.fn();
    const handler = initializer.idle(mockFunc);

    handler('arg1', 'arg2');
    jest.runAllTimers();

    // Check if the timer is cleared
    expect(initializer.timer).toBeNull();
  });
});