import initializer from '../src/Initializer';
const { JSDOM } = require('jsdom');

describe('initializer', () => {

  jest.useFakeTimers();
    let mockFunc;

    beforeEach(() => {
        mockFunc = jest.fn();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

  describe('setup', () => {
    let target;
  
    beforeAll(() => {
      // Mock the DOM environment using JSDOM
      const dom = new JSDOM(`<!DOCTYPE html><body><div id="editor"></div></body>`);
      global.document = dom.window.document;
      global.window = dom.window;
    });


    beforeEach(() => {
      // Create a new div element before each test
      target = document.createElement('div');
    });
  
    it('should enable content editing if target supports contentEditable', () => {
      // Simulate a browser that supports getSelection and createRange
      Object.defineProperty(window, 'getSelection', { value: jest.fn(), configurable: true });
      Object.defineProperty(document, 'createRange', { value: jest.fn(), configurable: true });
  
      target.contentEditable = 'true';
      target.focus = jest.fn();
      initializer.setup(target);
      expect(target.contentEditable).toBe("plaintext-only");
      expect(target.focus).toHaveBeenCalled();
    });
  
    it('should throw an error if target does not support contentEditable', () => {
      expect(() => {
        initializer.setup(null);
      }).toThrow('setup failed: the target element does not exist or does not support the contentEditable attribute');
  
      expect(() => {
        target.contentEditable = '';
        initializer.setup(target);
      }).toThrow('setup failed: the target element does not exist or does not support the contentEditable attribute');
    });
  
    it('should throw an error if the browser does not support getSelection or createRange', () => {
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
  });

  describe('idle', () => {

    it(' should call function after specified delay', () => {
      const delay = 2000;
      const idleHandler = initializer.idle(mockFunc, delay);
      const timer = Object.getOwnPropertySymbols(initializer)[0];
      
      idleHandler('arg1', 'arg2');
      expect(initializer[timer]).not.toBeNull();
      jest.advanceTimersByTime(delay - 1);
      expect(mockFunc).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(mockFunc).toHaveBeenCalledWith('arg1', 'arg2');
      expect(initializer[timer]).toBeNull();
    });

    it('should reset timer if called again before delay', () => {
      const delay = 2000;
      const idleHandler = initializer.idle(mockFunc, delay);
      const timer = Object.getOwnPropertySymbols(initializer)[0];

      idleHandler('arg1');
      jest.advanceTimersByTime(delay - 1000);
      idleHandler('arg2');
      jest.advanceTimersByTime(delay - 1);
      expect(mockFunc).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(mockFunc).toHaveBeenCalledWith('arg2');
      expect(initializer[timer]).toBeNull();
    });

    it('should throw error if func is not a function', () => {
      expect(() => initializer.idle(null)).toThrow(TypeError);
      expect(() => initializer.idle(null)).toThrow('idle failed: expected a function');
    });

    it('should throw error if delay is not a non-negative number', () => {
      expect(() => initializer.idle(() => {}, -1)).toThrow(TypeError);
      expect(() => initializer.idle(() => {}, -1)).toThrow('idle failed: expected a non-negative number for delay');
    });
    
  });

  describe('blur', () => {
    it('should call function immediately and clear timer', () => {
      const delay = 2000;
      const idleHandler = initializer.idle(mockFunc, delay);
      const blurHandler = initializer.blur(mockFunc);
      const timer = Object.getOwnPropertySymbols(initializer)[0];

      idleHandler('arg1');
      expect(initializer[timer]).not.toBeNull();
      blurHandler('arg2');
      expect(mockFunc).toHaveBeenCalledWith('arg2');
      expect(initializer[timer]).toBeNull();
    });

    it('should not call function if there is no timer', () => {
      const blurHandler = initializer.blur(mockFunc);

      blurHandler('arg1');
      expect(mockFunc).not.toHaveBeenCalled();
    });

    it('should throw error if func is not a function', () => {
      expect(() => initializer.blur(null)).toThrow(TypeError);
      expect(() => initializer.blur(null)).toThrow('Expected a function');
    });
  });
});
