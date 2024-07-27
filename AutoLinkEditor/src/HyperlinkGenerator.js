const URLRegex = /^(https?:\/\/(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+\.)+(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+))(:\d+)?(\/.*)?(\?.*)?(#.*)?$/;
const URLInTextRegex = /(https?:\/\/(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+\.)+(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+))(:\d+)?(\/.*)?(\?.*)?(#.*)?/;

const nodeHandler = (() => ({
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
  
}))();

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
  extractTextAndAnchor(node) {
    if(!node || !node.nodeType) {
      throw Error("extract text and anchors failed: the node is undefined, null or not a node");
    } 
    if(node.nodeType !== 1 && node.nodeType !== 3){
      throw Error("extract text and anchors failed: the node is not text or element");
    }

    let result = node.nodeType === 3 ? node.data : '';
    node.childNodes.forEach(child => {
      if (child.nodeType === 3) { // text
        // let textContent = child.textContent;
        // let match;
        // while ((match = URLInTextRegex.exec(textContent)) !== null) {
        //   const url = match[0];
        //   const beforeUrl = textContent.slice(0, match.index);
        //   const afterUrl = textContent.slice(match.index + url.length);

        //   result += beforeUrl;
        //   result += `<a href="${url}">${url}</a>`;
        //   textContent = afterUrl;
        // }

        // result += textContent; // Add remaining text after the last URL
          result += child.textContent;
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