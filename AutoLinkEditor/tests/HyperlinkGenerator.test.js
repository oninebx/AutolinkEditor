// Import the HyperlinkGenerator module
// const hyperlinkGenerator = require('./HyperlinkGenerator');
import hyperlinkGenerator from '../src/HyperlinkGenerator';

// Mock the DOM environment using JSDOM
const { JSDOM } = require('jsdom');
const { document } = new JSDOM('<!doctype html><html><body></body></html>').window;
global.document = document;

describe('HyperlinkGenerator', () => {
  describe('createLink', () => {

    it('should create a hyperlink with a valid URL', () => {
      const url = "https://example.com";
      const link = hyperlinkGenerator.createLink(url);
      expect(link.tagName).toBe("A");
      expect(link.href).toBe(new URL(url).toString());
      expect(link.textContent).toBe(url);
    });

    it('should create a hyperlink with a valid URL containing query parameters', () => {
      const url = "https://example.com?query=param";
      const link = hyperlinkGenerator.createLink(url);
      expect(link.tagName).toBe("A");
      expect(link.href).toBe(new URL(url).toString());
      expect(link.textContent).toBe(url);
    });

    it('should create a hyperlink with a valid URL containing fragments', () => {
      const url = "https://example.com#section";
      const link = hyperlinkGenerator.createLink(url);
      expect(link.tagName).toBe("A");
      expect(link.href).toBe(new URL(url).toString());
      expect(link.textContent).toBe(url);
    });

    it('should create a hyperlink with a valid URL containing subdomains', () => {
      const url = "https://sub.example.com";
      const link = hyperlinkGenerator.createLink(url);
      expect(link.tagName).toBe("A");
      expect(link.href).toBe(new URL(url).toString());
      expect(link.textContent).toBe(url);
    });

    it('should create a hyperlink with a valid URL containing paths', () => {
      const url = "https://example.com/path/to/resource";
      const link = hyperlinkGenerator.createLink(url);
      expect(link.tagName).toBe("A");
      expect(link.href).toBe(new URL(url).toString());
      expect(link.textContent).toBe(url);
    });

    it('should throw an error if the URL is undefined', () => {
      expect(() => {
        hyperlinkGenerator.createLink(undefined);
      }).toThrow("create hyperlink failed: the url is undefined, null, empty or not a string");
    });

    it('should throw an error if the URL is null', () => {
      expect(() => {
        hyperlinkGenerator.createLink(null);
      }).toThrow("create hyperlink failed: the url is undefined, null, empty or not a string");
    });

    it('should throw an error if the URL is an empty string', () => {
      expect(() => {
        hyperlinkGenerator.createLink("");
      }).toThrow("create hyperlink failed: the url is undefined, null, empty or not a string");
    });

    it('should throw an error if the URL is a string with only spaces', () => {
      expect(() => {
        hyperlinkGenerator.createLink("   ");
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
          hyperlinkGenerator.createLink(url);
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
          hyperlinkGenerator.createLink(url);
        }).toThrow("create hyperlink failed: the url is invalid");
      });
    });

  });

describe('extractTextWithAnchors', () => {

  it('should extract text from a text node', () => {
    const textNode = document.createTextNode('Hello, world!');
    expect(hyperlinkGenerator.extractTextWithAnchors(textNode)).toBe('Hello, world!');
  });

  it('should extract text and preserve <a> tags', () => {
    const div = document.createElement('div');
    div.innerHTML = 'This is a <a href="#">link</a> and some text.';
    expect(hyperlinkGenerator.extractTextWithAnchors(div))
        .toBe('This is a <a href="#">link</a> and some text.');
  });

  it('should handle nested elements with text and <a> tags', () => {
      const div = document.createElement('div');
      div.innerHTML = '<p>This is a <a href="#">link</a> inside a paragraph.</p>';
      expect(hyperlinkGenerator.extractTextWithAnchors(div))
          .toBe('This is a <a href="#">link</a> inside a paragraph.');
  });

  it('should throw an error for null or undefined nodes', () => {
      expect(() => hyperlinkGenerator.extractTextWithAnchors(null)).toThrowError('extract text failed: the node is undefined, null or not a node');
      expect(() => hyperlinkGenerator.extractTextWithAnchors(undefined)).toThrowError('extract text failed: the node is undefined, null or not a node');
  });

  it('should throw an error for non-element and non-text nodes', () => {
      const commentNode = document.createComment('This is a comment');
      expect(() => hyperlinkGenerator.extractTextWithAnchors(commentNode)).toThrowError('extract text failed: the node is not text or element');
  });

  it('should throw an error if the node is not a valid node', () => {
    expect(() => hyperlinkGenerator.extractTextWithAnchors({})).toThrow("extract text failed: the node is undefined, null or not a node");
  });

 
  });
});