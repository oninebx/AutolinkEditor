// Import the HyperlinkGenerator module
// const hyperlinkGenerator = require('./HyperlinkGenerator');
import {nodeHandler, contentConvertor} from '../src/HyperlinkGenerator';
const { JSDOM } = require('jsdom');

describe('NodeHandler', () => {
  describe('createLink', () => {
    beforeAll(() => {
      // Mock the DOM environment using JSDOM
      
      const { document } = new JSDOM('<!doctype html><html><body></body></html>').window;
      global.document = document;
    });

    it('should create a hyperlink with a valid URL', () => {
      const url = "https://example.com";
      const link = nodeHandler.createLink(url);
      expect(link.tagName).toBe("A");
      expect(link.href).toBe(new URL(url).toString());
      expect(link.textContent).toBe(url);
    });

    it('should create a hyperlink with a valid URL containing query parameters', () => {
      const url = "https://example.com?query=param";
      const link = nodeHandler.createLink(url);
      expect(link.tagName).toBe("A");
      expect(link.href).toBe(new URL(url).toString());
      expect(link.textContent).toBe(url);
    });

    it('should create a hyperlink with a valid URL containing fragments', () => {
      const url = "https://example.com#section";
      const link = nodeHandler.createLink(url);
      expect(link.tagName).toBe("A");
      expect(link.href).toBe(new URL(url).toString());
      expect(link.textContent).toBe(url);
    });

    it('should create a hyperlink with a valid URL containing subdomains', () => {
      const url = "https://sub.example.com";
      const link = nodeHandler.createLink(url);
      expect(link.tagName).toBe("A");
      expect(link.href).toBe(new URL(url).toString());
      expect(link.textContent).toBe(url);
    });

    it('should create a hyperlink with a valid URL containing paths', () => {
      const url = "https://example.com/path/to/resource";
      const link = nodeHandler.createLink(url);
      expect(link.tagName).toBe("A");
      expect(link.href).toBe(new URL(url).toString());
      expect(link.textContent).toBe(url);
    });

    it('should throw an error if the URL is undefined', () => {
      expect(() => {
        nodeHandler.createLink(undefined);
      }).toThrow("create hyperlink failed: the url is undefined, null, empty or not a string");
    });

    it('should throw an error if the URL is null', () => {
      expect(() => {
        nodeHandler.createLink(null);
      }).toThrow("create hyperlink failed: the url is undefined, null, empty or not a string");
    });

    it('should throw an error if the URL is an empty string', () => {
      expect(() => {
        nodeHandler.createLink("");
      }).toThrow("create hyperlink failed: the url is undefined, null, empty or not a string");
    });

    it('should throw an error if the URL is a string with only spaces', () => {
      expect(() => {
        nodeHandler.createLink("   ");
      }).toThrow("create hyperlink failed: the url is undefined, null, empty or not a string");
    });

    
    const invalidObjs = [
      undefined,
      null,
      "",
      "   ",
      12345,
      {},
      [],
      true
    ];

    invalidObjs.forEach(url => {
      it(`should throw an error for invalid URL: ${JSON.stringify(url)}`, () => {
        expect(() => {
          nodeHandler.createLink(url);
        }).toThrow("create hyperlink failed: the url is undefined, null, empty or not a string");
      });
    });

    const invalidUrls = [
      "www.example.com",
      "example.com",
      "http://",
      "http://example",
      "http:///example.com",
      "ftp://example.com",
      "https:/example.com",
      "http:// example .com",
      "http://example.com:port",
      "http://.com",
      "http://-example.com",
      "http://example..com"
    ]
    
    invalidUrls.forEach(url => {
      it(`should throw an error for invalid URL: ${JSON.stringify(url)}`, () => {
        expect(() => {
          nodeHandler.createLink(url);
        }).toThrow("create hyperlink failed: the url is invalid");
      });
    });

  });
});

describe('ContentConvertor', () => {
  describe('extractTextAndAnchor', () => {

    it('should extract text from a text node', () => {
      const textNode = document.createTextNode('Hello, world!');
      expect(contentConvertor.extractTextAndAnchor(textNode)).toBe('Hello, world!');
    });
  
    it('should extract text and preserve <a> tags', () => {
      const div = document.createElement('div');
      div.innerHTML = 'This is a <a href="#">link</a> and some text.';
      expect(contentConvertor.extractTextAndAnchor(div))
          .toBe('This is a <a href="#">link</a> and some text.');
    });
  
    it('should handle nested elements with text and <a> tags', () => {
        const div = document.createElement('div');
        div.innerHTML = '<p>This is a <a href="#">link</a> inside a paragraph.</p>';
        expect(contentConvertor.extractTextAndAnchor(div))
            .toBe('This is a <a href="#">link</a> inside a paragraph.');
    });
  
    it('should throw an error for null or undefined nodes', () => {
        expect(() => contentConvertor.extractTextAndAnchor(null)).toThrowError('extract text and anchors failed: the node is undefined, null or not a node');
        expect(() => contentConvertor.extractTextAndAnchor(undefined)).toThrowError('extract text and anchors failed: the node is undefined, null or not a node');
    });
  
    it('should throw an error for non-element and non-text nodes', () => {
        const commentNode = document.createComment('This is a comment');
        expect(() => contentConvertor.extractTextAndAnchor(commentNode)).toThrowError('extract text and anchors failed: the node is not text or element');
    });
  
    it('should throw an error if the node is not a valid node', () => {
      expect(() => contentConvertor.extractTextAndAnchor({})).toThrow("extract text and anchors failed: the node is undefined, null or not a node");
    });
  
   
    });
  
    describe('saveSelection', () => {
      beforeAll(() => {
        // Setup DOM environment
        const dom = new JSDOM(`<!DOCTYPE html>
          <body>
            <div id="editable" contenteditable="true">Hello, this is a <b>test</b> with <i>mixed</i> content.</div>
          </body>`);
        global.document = dom.window.document;
        global.window = dom.window;
        global.getSelection = dom.window.getSelection;
      });
  
      it('saves selection range within single text node', () => {
        const editableDiv = document.getElementById('editable');
        const range = document.createRange();
        const selection = window.getSelection();
    
        range.setStart(editableDiv.firstChild, 7);
        range.setEnd(editableDiv.firstChild, 11);
        selection.removeAllRanges();
        selection.addRange(range);
    
        const result = contentConvertor.saveSelection(editableDiv);
        expect(result).toEqual({ start: 7, end: 11 });
      });
  
      it('saves selection range across multiple nodes', () => {
        const editableDiv = document.getElementById('editable');
        const range = document.createRange();
        const selection = window.getSelection();
    
        range.setStart(editableDiv.firstChild, 7);
        range.setEnd(editableDiv.querySelector('i').firstChild, 4);
        selection.removeAllRanges();
        selection.addRange(range);
    
        const result = contentConvertor.saveSelection(editableDiv);
        expect(result).toEqual({ start: 7, end: 31 }); // " this is a test with mixed"
      });
  
      it('throws error when target is null', () => {
        expect(() => {
          contentConvertor.saveSelection(null);
        }).toThrow("save selection failed: the target element is null or undefined");
      });
  
      it('throws error when getSelection is not supported', () => {
        const originalGetSelection = window.getSelection;
        delete window.getSelection;
  
        expect(() => {
            const editableDiv = document.getElementById('editable');
            contentConvertor.saveSelection(editableDiv);
        }).toThrow("save selection failed: the browser doesn't support getSelection function");
  
        window.getSelection = originalGetSelection; // Restore original function
      });
  
    });
});