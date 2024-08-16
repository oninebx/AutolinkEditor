import { JSDOM } from 'jsdom';
import { fireEvent } from '@testing-library/dom';

// Mock the dependencies
jest.mock('../src/initializer', () => ({
      setup: jest.fn(),
      idle: jest.fn((fn, delay) => fn),
      blur: jest.fn(fn => fn),
}));

jest.mock('../src/HyperlinkGenerator', () => ({
  contentConvertor: {
      saveSelection: jest.fn(),
      extractTextAndAnchor: jest.fn(),
      restoreSelection: jest.fn(),
      indexAnchors: jest.fn(),
  },
  nodeHandler: {
    handleText: jest.fn(),
    handleAnchor: jest.fn()
  }
}));


// Import the mocked modules
import initializer from '../src/Initializer';
import { contentConvertor } from '../src/HyperlinkGenerator';

// Create a JSDOM environment
const dom = new JSDOM('<!DOCTYPE html><body><div id="target" contenteditable="true"></div></body>');
global.document = dom.window.document;
global.window = dom.window;
global.KeyboardEvent = dom.window.KeyboardEvent;
global.Event = dom.window.Event;

class ClipboardData {
  getData;
  setData;

  constructor() {
      this.getData = jest.fn();
      this.setData = jest.fn();
  }
}

global.ClipboardEvent = class ClipboardEvent extends Event {
  clipboardData;

  constructor(type, options) {
      super(type, options);
      this.clipboardData = new ClipboardData();
  }
}

require('../src/index');

const AutoLinkEditor = window.AutoLinkEditor;

describe('AutoLinkEditor', () => {
  let target;
  
  beforeEach(() => {
    target = document.getElementById('target');
    jest.clearAllMocks();
  });

  it('should initialize the target element with event handlers', () => {
    // Arrange

    // Action
    AutoLinkEditor.init('target');

    // Assert
    expect(initializer.setup).toHaveBeenCalledWith(target);
    expect(target.onpaste).toBeDefined();
    expect(target.onkeyup).toBeDefined();
    expect(target.onblur).toBeDefined();
    expect(target.onfocus).toBeDefined();
  });

  it('should prevent default action for Enter key on keyup', () => {
    // Arrange
    const event = new KeyboardEvent('keyup', { key: 'Enter' });
    jest.spyOn(event, 'preventDefault');
    AutoLinkEditor.init('target');
    
    // Act
    fireEvent(target, event);

    // Assert
    expect(event.preventDefault).toHaveBeenCalled();
  });
  
  const INVALID_IDS = [
    undefined,
    null,
    '',
    '    '
  ];

  INVALID_IDS.forEach(id => {
    it('should log warning if id is undefined, null, empty or white space', () => {
      // Arrange
      console.warn = jest.fn();
      
      // Act
      AutoLinkEditor.init(id);
      // Assert
      expect(console.warn).toHaveBeenCalledWith("init failed: id cannot be undefined, null, empty or white space");
    });
  });
  
  it('should handle paste shortcut key in onpaste, rather than in onkeyup', () => {
    // Arrange
    const clipboardData = {
      getData: jest.fn().mockReturnValue('Mocked clipboard content'),
    };
    const pasteShortcutKeyEvent = new KeyboardEvent('keyup', {
      key: 'v',       // The key pressed
      metaKey: true,  // Simulate the Command key on macOS
      bubbles: true,
      cancelable: true,
    });
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData,
      bubbles: true,
      cancelable: true,
    });
    pasteEvent.metaKey = true;
    pasteEvent.key = 'v';

    
    contentConvertor.extractTextAndAnchor.mockReturnValue('Processed content');
    AutoLinkEditor.init('target');

    // Act
    fireEvent(target, pasteEvent);
    fireEvent(target, pasteShortcutKeyEvent);

    // Assert
    expect(contentConvertor.extractTextAndAnchor).toHaveBeenCalledTimes(1);
    expect(contentConvertor.indexAnchors).toHaveBeenCalledTimes(1);
    expect(target.innerHTML).toBe('Processed content');
  });

});