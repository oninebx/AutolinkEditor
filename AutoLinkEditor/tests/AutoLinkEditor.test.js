const { JSDOM } = require('jsdom');

// Mocking the document and window objects
const { window } = new JSDOM(`<!DOCTYPE html><body><div id="editor"></div></body>`);
global.document = window.document;
global.window = window;

// Import the AutoLinkEditor code
import  '../src/index';

describe('AutoLinkEditor', () => {
  beforeEach(() => {
    // Clear the content of the editor div before each test
    document.getElementById('editor').innerHTML = '';
  });
  test('should initialize contentEditable div', () => {
    window.AutoLinkEditor.init('editor');

    // Simulate DOMContentLoaded event

    // var DOMContentLoaded_event = document.createEvent("Event");
    // DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true);
    // window.document.dispatchEvent(DOMContentLoaded_event);

    // const event = new Event("DOMContentLoaded");
    // window.dispatchEvent(event);
    
    const editorDiv = document.getElementById('editor');
    expect(editorDiv.contentEditable).toBe(true);
  });
})