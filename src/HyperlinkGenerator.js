const URLRegex = /^(https?:\/\/(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+\.)+(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+))(:\d+)?(\/.*)?(\?.*)?(#.*)?$/;
const URLInTextRegex = /(https?:\/\/(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+\.)+(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+))(:\d+)?(\/.*)?(\?.*)?(#.*)?/;
const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, m => map[m] );
};
const ElementsOfBR = new Set([
  'block',
  'block flex',
  'block flow',
  'block flow-root',
  'block grid',
  'list-item',
]);

const nodeHandler = (() => {
  return {
    handleText: text => {
      let result = '';
      if (typeof text !== 'string') {
        throw new Error("handleText failed: input is not a string");
      }
      // text is a url
      if(URLRegex.test(text)){
        result += `<a href="${escapeHtml(text)}">${escapeHtml(text)}</a>`;
      }else {
        // text contains url
        let textContent = text;
        let match;
        while ((match = URLInTextRegex.exec(textContent)) !== null) {
          const url = match[0];
          const beforeUrl = textContent.slice(0, match.index);
          const afterUrl = textContent.slice(match.index + url.length);

          result += escapeHtml(beforeUrl);
          result += `<a href="${escapeHtml(url)}">${escapeHtml(url)}</a>`;
          textContent = afterUrl;
        }
        result += escapeHtml(textContent); // Append any remaining text
      }
      return result;
    },
    handleAnchor: anchor => {
      if(anchor && anchor instanceof HTMLAnchorElement){
        const text = anchor.textContent;
        if(URLRegex.test(text)){
          return nodeHandler.makePlainAnchor(anchor);
        }else {
          return anchor.textContent;
        }
      }else{
        throw TypeError("handle anchor error: the target is undefined, null or not a anchor");
      }
    },
    makePlainAnchor: target => {
      if(target && target instanceof HTMLAnchorElement){
        if(target.href && target.href.trim() && target.textContent && target.textContent.trim()) {
          const result = document.createElement("a");
          result.href = target.href;
          result.textContent = target.textContent;
          return result;
        }else{
          console.warn(`skip ${target}, this anchor do not have content`);
          return null;
        }
      }
      else{
        throw TypeError("make plain anchor error: the target is undefined, null or not a anchor");
      }
    },
    compensateBR: target => {
      if(target && 
        (target instanceof HTMLBRElement || ElementsOfBR.has(window.getComputedStyle(target).display))){
          return "<br />";
      }
      return "";
    }
  
};})();

 const contentConvertor= (() => {
  return {
    saveSelection: target => {
      if(target) {
        if(window.getSelection) {
          const range = window.getSelection().getRangeAt(0);
          var preSelectionRange = range.cloneRange();
          preSelectionRange.selectNodeContents(target);
          preSelectionRange.setEnd(range.startContainer, range.startOffset);
          var start = preSelectionRange.toString().length;
          
          return {
              start: start,
              end: start + range.toString().length
          }
        }else{
          throw Error("save selection failed: the browser doesn't support getSelection function");
        }
        
      }else{
        throw Error("save selection failed: the target element is null or undefined");
      }
    },
    restoreSelection: (target, position) => {
      if(!target || !(target.nodeType === 1 || target.nodeType === 3)) {
        throw Error("restore selection failed: target must be an html element or text node");
      }
      if (!position || typeof position.start !== 'number' || typeof position.end !== 'number' || position.start > position.end) {
        throw Error("restore selection failed: invalid position provided to restoreSelection.");
      }
      if(document.createRange && window.getSelection) {
        const range = document.createRange();
        range.setStart(target, 0);
        range.collapse(true);
  
        let foundStart = false;
        let stop = false;
        let node;
        let charIndex = 0;
        const nodeStack = [target];
        while (!stop && (node = nodeStack.pop())) {
          switch (node.nodeType) {
            case 1: // element
              for (let i = node.childNodes.length - 1; i >= 0; i--) {
                nodeStack.push(node.childNodes[i]);
              }
              break;
            case 3: // text
              const nextCharIndex = charIndex + node.length;
              if (!foundStart && position.start >= charIndex && position.start <= nextCharIndex) {
                range.setStart(node, position.start - charIndex);
                foundStart = true;
              }
              if (foundStart && position.end >= charIndex && position.end <= nextCharIndex) {
                range.setEnd(node, position.end - charIndex);
                stop = true;
              }
              charIndex = nextCharIndex;
              break;
          }
        }
        
        if(foundStart) {
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }else{
          console.warn("restore selection failed: could not find the start or end position within the target node.");
        }
        
      }else {
        throw Error("restore selection failed: the current context does not support createRange or getSelection function.")
      }
  
    },
    extractTextAndAnchor(node, inclusion, nodeHandler) {
      if(!node || !node.nodeType) {
        throw Error("extract text and anchors failed: the node is undefined, null or not a node");
      }

      if(node.nodeType !== 1 && node.nodeType !== 3){
        throw Error("extract text and anchors failed: the node is not text or element");
      }

      if(!nodeHandler) {
        throw TypeError("extract text and anchors failed: invalid nodeHandler, please check if it is an object with handleText, handleAnchor and makePlainAnchor methods.");
      }

      const checkNodeHandler = ["handleText", "handleAnchor", "makePlainAnchor", "compensateBR"].every(method => typeof nodeHandler[method] === 'function');
      if(!checkNodeHandler) {
        throw TypeError("extract text and anchors failed: invalid nodeHandler, please check if it is an object with handleText, handleAnchor and makePlainAnchor methods.");
      }

      const {handleText, handleAnchor, makePlainAnchor, compensateBR} = nodeHandler;
      let result = node.nodeType === 3 ? node.data : '';
      node.childNodes.forEach(child => {
        if (child.nodeType === 3) { // text
          result += handleText(child.textContent);
        } else if (child.nodeType === 1) { 
          if(child.tagName === 'A') { // anchar element
            const key = child.id === "" ? child.dataset.id : child.id;
            
            if(inclusion && inclusion[key]){
              const disposedAnchor = handleAnchor(child);
              if(disposedAnchor){
                if(disposedAnchor instanceof HTMLAnchorElement) {
                  disposedAnchor.href = disposedAnchor.textContent;
                }
                result += disposedAnchor.outerHTML ?? disposedAnchor;
              }
            }else {
              result += makePlainAnchor(child)?.outerHTML ?? "";
            }
          }else { 
            result += compensateBR(child) + this.extractTextAndAnchor(child, inclusion, nodeHandler);
          }
        } 
      });
  
      return result;
    },
    indexAnchors(target) {
      const inclusion = {};
      if(target && target instanceof HTMLElement) {
        const anchorTags = target.querySelectorAll('a');
        if(anchorTags) {
          const idPrefix = target.id === "" ? target.dataset.id : target.id;
          
          anchorTags.forEach((anchor, index) => {
            const anchorId = anchor.dataset.id ?? `${idPrefix}-anchor-${index}`;
            if(anchor.href.replace(/\/+$/, '').toLowerCase() === anchor.textContent.toLowerCase()) {
              if(!anchor.dataset.id){
                anchor.setAttribute('data-id', anchorId);
              }
              inclusion[[anchorId]] = anchor.href;
            }
          });
        }
        return Object.keys(inclusion).length === 0 ? null : inclusion;
      }else {
        throw TypeError("index anchors failed: the node is undefined, null or not a node");
      }
    }
   };
 })();

export {
  nodeHandler,
  contentConvertor
} ;