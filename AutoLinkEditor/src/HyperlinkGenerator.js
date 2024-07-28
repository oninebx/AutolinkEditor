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

 const contentConvertor= (() => ({
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

  },
  extractTextAndAnchor(node, handleText = text => text) {
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
          result += child.outerHTML;
        }else { // other elements
          result += this.extractTextAndAnchor(child);
        }
      } 
    });

    return result;
  }
 }))();

export {
  nodeHandler,
  contentConvertor
} ;