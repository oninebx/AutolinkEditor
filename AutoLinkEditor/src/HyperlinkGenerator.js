const URLRegex = /^(https?:\/\/(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+\.)+(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+))(:\d+)?(\/.*)?(\?.*)?(#.*)?$/;

const hyperlinkGenerator = (() => ({
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
  extractTextWithAnchors: function(node) {
    if(!node || !node.nodeType) {
      throw Error("extract text failed: the node is undefined, null or not a node");
    } 
    if(node.nodeType !== 1 && node.nodeType !== 3){
      throw Error("extract text failed: the node is not text or element");
    }

    let result = node.nodeType === 3 ? node.data : '';
    node.childNodes.forEach(child => {
        if (child.nodeType === 3) { // text
            result += child.textContent;
        } else if (child.nodeType === 1 && child.tagName === 'A') { // anchar element
            result += child.outerHTML;
        } else if (child.nodeType === 1) { // other elements
            result += this.extractTextWithAnchors(child);
        }
    });

    return result;
  }
  // convertDivToTextWithBr: (divNode) => {
  //   const fragment = document.createDocumentFragment();
  //   const text = document.createTextNode(divNode.innerText);
  //   const br = document.createElement('br');
  //   fragment.append(br, text);
  //   return fragment;
  // }
}))();

export default hyperlinkGenerator;