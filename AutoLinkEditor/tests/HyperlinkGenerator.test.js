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

  describe('HandleText', () => {
    it('should convert URLs in text to anchor tags', () => {
      const input = 'Check this out: http://example.com and also https://example.org.';
      const expected = 'Check this out: <a href="http://example.com">http://example.com</a> and also <a href="https://example.org">https://example.org</a>.';
      expect(nodeHandler.handleText(input)).toBe(expected);
    });

    const invalidStrings = [
      null,
      undefined,
      123,
      true,
      {},
      [],
      () => {},
      Symbol('text')
    ];

    invalidStrings.forEach(text => {
      it(`should throw error if ${JSON.stringify(text)} is not a string`, () => {
        expect(() => {
          nodeHandler.handleText(text);
        }).toThrow("handleText failed: input is not a string");
      });
    });
  
    it('should escape HTML entities in text', () => {
      const input = 'This is a test with special characters: & < > " \'';
      const expected = 'This is a test with special characters: &amp; &lt; &gt; &quot; &#39;';
      expect(nodeHandler.handleText(input)).toBe(expected);
    });
  
    it('should handle text with no URLs correctly', () => {
      const input = 'This is a test with no URLs.';
      const expected = 'This is a test with no URLs.';
      expect(nodeHandler.handleText(input)).toBe(expected);
    });
  
    it('should handle text with multiple URLs correctly', () => {
      const input = 'First URL: http://example.com. Second URL: https://example.org.';
      const expected = 'First URL: <a href="http://example.com">http://example.com</a>. Second URL: <a href="https://example.org">https://example.org</a>.';
      expect(nodeHandler.handleText(input)).toBe(expected);
    });
  })
});

describe('ContentConvertor', () => {
  describe('extractTextAndAnchor', () => {

    beforeAll(() => {
      // Mock the DOM environment using JSDOM
      const { document } = new JSDOM('<!doctype html><html><body></body></html>').window;
      global.document = document;
    });
    const mockHandleText = text => text.toUpperCase();

    it('should throw error if node is undefined', () => {
      expect(() => contentConvertor.extractTextAndAnchor(undefined)).toThrow("extract text and anchors failed: the node is undefined, null or not a node");
    });

    it('should throw error if node is null', () => {
      expect(() => contentConvertor.extractTextAndAnchor(null)).toThrow("extract text and anchors failed: the node is undefined, null or not a node");
    });
  
    it('should throw error if node is not text or element node', () => {
      const commentNode = document.createComment("This is a comment");
      expect(() => contentConvertor.extractTextAndAnchor(commentNode)).toThrow("extract text and anchors failed: the node is not text or element");
    });
  
    it('should throw error if handleText is not a function', () => {
      const div = document.createElement('div');
      expect(() => contentConvertor.extractTextAndAnchor(div, "not a function")).toThrow("extract text and anchors failed: handleText function is missing");
    });

    it('should extract text from a text node', () => {
      const textNode = document.createTextNode('Hello, world!');
      expect(contentConvertor.extractTextAndAnchor(textNode)).toBe('Hello, world!');
    });

    it('should handle anchor elements correctly', () => {
      const div = document.createElement('div');
      div.innerHTML = '<a href="https://example.com">Example</a>';
      expect(contentConvertor.extractTextAndAnchor(div)).toBe('<a href="https://example.com">Example</a>');
    });

    it('should handle nested elements correctly', () => {
      const div = document.createElement('div');
      div.innerHTML = 'Text before <a href="https://example.com">Example</a> text after';
      expect(contentConvertor.extractTextAndAnchor(div)).toBe('Text before <a href="https://example.com">Example</a> text after');
    });

    test('should handle text transformation with handleText function', () => {
      const div = document.createElement('div');
      div.innerHTML = 'Text before <a href="https://example.com">Example</a> text after';
      expect(contentConvertor.extractTextAndAnchor(div, mockHandleText)).toBe('TEXT BEFORE <a href="https://example.com">Example</a> TEXT AFTER');
    });
  
    it('should throw an error if the node is not a valid node', () => {
      expect(() => contentConvertor.extractTextAndAnchor({})).toThrow("extract text and anchors failed: the node is undefined, null or not a node");
    });
  
    test('should handle deeply nested structures', () => {
      const div = document.createElement('div');
      div.innerHTML = '<div>Level 1<div>Level 2<a href="https://example.com">Example</a>Level 2 end</div>Level 1 end</div>';
      expect(contentConvertor.extractTextAndAnchor(div)).toBe('Level 1Level 2<a href="https://example.com">Example</a>Level 2 endLevel 1 end');
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