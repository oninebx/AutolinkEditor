const URLRegex = /^(https?:\/\/(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+\.)+(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+))(:\d+)?(\/.*)?(\?.*)?(#.*)?$/;
const URLInTextRegex = /(https?:\/\/(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+\.)+(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+))(:\d+)?(\/.*)?(\?.*)?(#.*)?/;

const nodeHandler = (() => {
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
  return {
    handleText: text => {
      if (typeof text !== 'string') {
        throw new Error("handleText failed: input is not a string");
      }
      let textContent = text;
      let match;
      let result = '';
      while ((match = URLInTextRegex.exec(textContent)) !== null) {
        const url = match[0];
        const beforeUrl = textContent.slice(0, match.index);
        const afterUrl = textContent.slice(match.index + url.length);

        result += escapeHtml(beforeUrl);
        result += `<a href="${escapeHtml(url)}">${escapeHtml(url)}</a>`;
        textContent = afterUrl;
      }
      result += escapeHtml(textContent); // Append any remaining text
      return result;
    },
    handleAnchor: anchor => {
      if(anchor && anchor instanceof HTMLAnchorElement){
        // console.log(anchor);
      }
      
      return anchor.outerHTML;
      // if(anchor) {
      //   const text = anchor.textContent;
      //   if(URLRegex.test(text)){
      //     return anchor.outerHTML;
      //   }else {
      //     return anchor.innerHtml;
      //   }
      // }
      // return "";
    },
    createLink: url => {
      if(typeof url !== "string" || url.trim() === ""){
        throw Error("create hyperlink failed: the url is undefined, null, empty or not a string");
      }
      if(!URLRegex.test(url)) {
        throw Error("create hyperlink failed: the url is invalid");
      }
      let link = document.createElement("a");
      link.href = url;
      link.text = url;
      return link;
    },
  
};})();

 const contentConvertor= (() => {
  const ANCHOR_STORE = Symbol("anchors");
  return {
    [ANCHOR_STORE]: {},
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
    extractTextAndAnchor(node, handleText = text => text, handleAnchor = anchor => anchor.outerHTML) {
      if(!node || !node.nodeType) {
        throw Error("extract text and anchors failed: the node is undefined, null or not a node");
      }
  
      if(node.nodeType !== 1 && node.nodeType !== 3){
        throw Error("extract text and anchors failed: the node is not text or element");
      }
  
      if(handleText && typeof handleText !== "function") {
        throw Error("extract text and anchors failed: handleText function is missing");
      }
  
      let result = node.nodeType === 3 ? node.data : '';
      node.childNodes.forEach(child => {
        if (child.nodeType === 3) { // text
          result += handleText(child.textContent);
        } else if (child.nodeType === 1) { 
          if(child.tagName === 'A') { // anchar element
            // TODO: check the url is illegal
            // result += child.outerHTML;
            console.log(this[ANCHOR_STORE][child.dataset.id]);
            result += handleAnchor(child);
          }else { // other elements
            result += this.extractTextAndAnchor(child);
          }
        } 
      });
  
      return result;
    },
    indexAnchors(target) {
      this[ANCHOR_STORE] = {};
      if(target && target instanceof HTMLElement) {
        const anchorTags = target.querySelectorAll('a');
        if(anchorTags) {
          const idPrefix = target.id ?? target.dataset.id;
          anchorTags.forEach((anchor, index) => {
            const anchorId = anchor.dataset.id ?? `${idPrefix}-anchor-${index}`;
            console.log(anchor.href);
            console.log(anchor.textContent);
            if(anchor.href.replace(/\/+$/, '') === anchor.textContent) {
              if(!anchor.dataset.id){
                anchor.setAttribute('data-id', anchorId);
              }
              this[ANCHOR_STORE][anchorId] = anchor.href;
            }
            console.log(this[ANCHOR_STORE]);
          });
        }
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