import {nodeHandler, contentConvertor} from '../src/HyperlinkGenerator';
const { JSDOM } = require('jsdom');

describe('NodeHandler', () => {

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
  });

  describe('HandleAnchor', () => {
    beforeAll(() => {
      const { window } = new JSDOM('<!doctype html><html><body></body></html>');
      global.document = window.document;
      global.HTMLAnchorElement = window.HTMLAnchorElement;
      
    });

    it('should make a plain anchor if anchor has text is a valid URL', () => {
      // Arrange
      const anchor = document.createElement('a');
      const validURL = 'https://www.example.com';
      anchor.textContent = validURL;
      anchor.href = validURL;
      anchor.classList.add("class1");

      // Act
      const result = nodeHandler.handleAnchor(anchor);

      // Assert
      expect(result).toBe("<a href=\"https://www.example.com/\">https://www.example.com</a>");
    });

    it('should return text content if anchor text is not a valid URL', () => {
      // Arrange
      const anchor = document.createElement('a');
      anchor.textContent = 'Not a URL';
      anchor.innerHTML = '<span>Not a URL</span>';

      // Act
      const result = nodeHandler.handleAnchor(anchor);

      // Assert
      expect(result).toBe(anchor.textContent);
    });

    it('should throw TypeError if the argument is not an anchor element', () => {
      expect(() => nodeHandler.handleAnchor(null)).toThrow(TypeError);
      expect(() => nodeHandler.handleAnchor({})).toThrow(TypeError);
      expect(() => nodeHandler.handleAnchor(document.createElement('div'))).toThrow(TypeError);
    });
  });
});

describe('ContentConvertor', () => {
  describe('extractTextAndAnchor', () => {

    beforeAll(() => {
      // Mock the DOM environment using JSDOM
      const { window } = new JSDOM('<!doctype html><html><body></body></html>');
      global.document = window.document;
      global.HTMLElement = window.HTMLElement;
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
  
    it('should throw error if nodeHandler is not a object or do not have handleText, handleAnchor and makePlainAnchor method.', () => {
      // Arrange
      const div = document.createElement('div');
      const inclusion = {};
      const invalidNodeHandler = [
        "not a object",
        undefined,
        null,
        0,
        {},
        { handleText: jest.fn()}
      ];

      // Act
      const extractTextAndAnchors = invalidNodeHandler.map(n => () => contentConvertor.extractTextAndAnchor(div, inclusion, n));

      // Assert
      extractTextAndAnchors.forEach(e => expect(e).toThrow("extract text and anchors failed: invalid nodeHandler, please check if it is an object with handleText, handleAnchor and makePlainAnchor methods."));
    });
      
    it('should call handleText function for every text node in target', () => {
      // Arrange
      const target = document.createElement('div');
      const text1 = document.createTextNode('text1');
      const text2 = document.createTextNode('text2');
      const span1 = document.createElement('span');
      span1.textContent = "span text";
      target.append(text1, span1, text2);
      const mockNodeHandler = {
        handleText: jest.fn(),
        handleAnchor: jest.fn(),
        makePlainAnchor: jest.fn()
      }

      // Act
      const result = contentConvertor.extractTextAndAnchor(target, {}, mockNodeHandler);

      // Assert
      expect(mockNodeHandler.handleText).toHaveBeenCalledTimes(3);
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

  describe('restoreSelection', () => {
    beforeEach(() => {
      const { window } = new JSDOM(`<!DOCTYPE html><body><div id="content"><p id="para1">Hello, world!</p><p id="para2">More content <span>here</span> and <b>there</b>.</p></div> </body>`);
      global.document = window.document;
      global.window = window;
    });
    
    it('should restore selection correctly within a single text node', () => {
      const target = document.getElementById('para1').firstChild; // Text node inside <p>
      const position = { start: 7, end: 12 };
  
      contentConvertor.restoreSelection(target, position);
  
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
  
      expect(range.startContainer).toBe(target);
      expect(range.startOffset).toBe(7);
      expect(range.endContainer).toBe(target);
      expect(range.endOffset).toBe(12);
    });

    it('should restore selection correctly spanning multiple text nodes', () => {
      const target = document.getElementById('para2'); // <p> element with mixed content
      const position = { start: 12, end: 23 }; // Across "More content here and th"
  
      contentConvertor.restoreSelection(target, position);
  
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
  
      expect(range.startContainer.nodeType).toBe(3);
      expect(range.startContainer.nodeValue).toBe("More content ");
      expect(range.startOffset).toBe(12);
  
      expect(range.endContainer.nodeType).toBe(3);
      expect(range.endContainer.nodeValue).toBe("there");
      expect(range.endOffset).toBe(1);
    });

    it('should throw error for non-element, non-text node target', () => {
      const target = document.createComment('comment'); // Comment node, not Element or Text
      const position = { start: 0, end: 4 };
  
      expect(() => {
        contentConvertor.restoreSelection(target, position);
      }).toThrow("restore selection failed: target must be an html element or text node");
    });

    it('should throw error for invalid position', () => {
      const target = document.getElementById('para1').firstChild; // Text node
      const position = { start: 'invalid', end: 'invalid' };
  
      expect(() => {
        contentConvertor.restoreSelection(target, position);
      }).toThrow("restore selection failed: invalid position provided to restoreSelection.");
    });

    it('should throw error for position without start, end or both', () => {
      const target = document.getElementById('para1').firstChild; // Text node
      const positions = [
        { wrongStart: 5, wrongEnd: 6 },
        { start: 5, wrongEnd: 6 },
        { wrongStart: 5, end: 6 }
      ];
      positions.forEach(position => {
        expect(() => {
          contentConvertor.restoreSelection(target, position);
        }).toThrow("restore selection failed: invalid position provided to restoreSelection.");
      });
      
    })

    it('should throw error for start position greater than end position', () => {
      const target = document.getElementById('para1').firstChild; // Text node
      const position = { start: 10, end: 5 };
  
      expect(() => {
        contentConvertor.restoreSelection(target, position);
      }).toThrow("restore selection failed: invalid position provided to restoreSelection.");
    });

    it('should throw error if createRange or getSelection not supported', () => {
      const target = document.getElementById('para1').firstChild; // Text node
      const position = { start: 0, end: 5 };
  
      // Temporarily override createRange and getSelection
      const originalCreateRange = document.createRange;
      const originalGetSelection = window.getSelection;
      document.createRange = null;
      window.getSelection = null;
  
      expect(() => {
        contentConvertor.restoreSelection(target, position);
      }).toThrow("restore selection failed: the current context does not support createRange or getSelection function.");
  
      // Restore original functions
      document.createRange = originalCreateRange;
      window.getSelection = originalGetSelection;
    });

    it('should handle out of range position', () => {
      const target = document.getElementById('content').firstChild; // Text node
      const position = { start: 100, end: 200 };
      console.warn = jest.fn();

      contentConvertor.restoreSelection(target, position);
      expect(console.warn).toHaveBeenCalledWith("restore selection failed: could not find the start or end position within the target node.");
      
    });

  });

  describe('indexAnchors', () => {
    let container;
    let anchorSame1, anchorSame2, anchorSame3;
    let anchorDiff1, anchorDiff2;

    beforeAll(() => {
      const {window} = new JSDOM(`<!DOCTYPE html>
        <body>
        </body>`);
      global.window = window;
      global.document = window.document;
      global.HTMLElement = window.HTMLElement;
    });

    beforeEach(() => {
      // Set up a basic HTML structure for testing
      container = document.createElement('div');
      container.id = 'test-container';

      // Create anchor tags
      anchorSame1 = document.createElement('a');
      anchorSame1.href = 'https://example.com/page';
      anchorSame1.textContent = 'https://example.com/page';

      anchorSame2 = document.createElement('a');
      anchorSame2.href = 'https://example.com/page/2';
      anchorSame2.textContent = 'https://example.com/page/2';
      anchorSame2.dataset.id = 'custom-id';

      anchorSame3 = document.createElement('a');
      anchorSame3.href = 'url3';
      anchorSame3.textContent = 'URL3';
      anchorSame3.dataset.id = 'custom-id-3';

      anchorDiff1 = document.createElement('a');
      anchorDiff1.href = 'https://example.com/page/3';
      anchorDiff1.textContent = 'page3';
      anchorDiff1.dataset.id = 'custom-id';

      anchorDiff2 = document.createElement('a');
      anchorDiff2.href = 'https://example.com/page/4';
      anchorDiff2.textContent = 'page4';
      anchorDiff2.dataset.id = 'custom-id';

      document.body.appendChild(container);
    });

    afterEach(() => {
      container.innerHTML = '';
      document.body.removeChild(container);
    });

    it('should use the data-id to index anchor with data-id, whose href is same as text', () => {
      // Arrange
      container.appendChild(anchorSame2);

      // Action
      const anchorStore = contentConvertor.indexAnchors(container);

      // Assert
      expect(anchorStore).toHaveProperty(anchorSame2.dataset.id, anchorSame2.href);
 
    });

    it('should use the generated id to index anchor without data-id, whose href is same as text ', () => {
      // Arrange
      container.appendChild(anchorSame1);

      // Action
      const anchorStore = contentConvertor.indexAnchors(container);

      // Assert
      expect(anchorStore).toHaveProperty(anchorSame1.dataset.id, anchorSame1.href);
    });

    it('should index anchor whose href is same as text, case-insensitive', () => {
      // Arrange
      container.appendChild(anchorSame3);
      
      // Action
      const anchorStore = contentConvertor.indexAnchors(container);

      // Assert
      expect(anchorStore).toHaveProperty(anchorSame3.dataset.id, anchorSame3.href.toLowerCase());
    });

    it('should not index anchor whose href is different from text', () => {
      // Arrange
      container.appendChild(anchorDiff1);
      container.appendChild(anchorDiff2);
      
      // Action
      const anchorStore = contentConvertor.indexAnchors(container);
      // Assert
      expect(anchorStore).toBeNull();
    });

    it('should throw TypeError if target is not an HTMLElement', () => {
      expect(() => contentConvertor.indexAnchors(null)).toThrow(TypeError);
      expect(() => contentConvertor.indexAnchors({})).toThrow(TypeError);
    });

  });
});