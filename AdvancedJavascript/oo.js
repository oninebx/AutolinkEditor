window.AutoLinkEditor = (() => {
  const URLRegex = /(https?:\/\/(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+\.)+(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+))(:\d+)?(\/.*)?(\?.*)?(#.*)?/g;
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
  };
  const createLink = url => {
    let link = document.createElement("a");
    link.href = url;
    link.text = url;
    return link;
  }
  
  const deleteUrlText = (selection, url, compensation) => {
    let range = selection.getRangeAt(0);
    console.log(`range.endOffset = ${range.endOffset}`)
    const endPos = range.endOffset - compensation;
    const startPos = endPos - url.length;
    const targetRange = document.createRange();
    targetRange.setStart(selection.focusNode, startPos);
    targetRange.setEnd(selection.focusNode, endPos);
    targetRange.deleteContents();
    console.log(`Delete ${url} from text`);
    return targetRange;
  }

  const wrapRange = node => {
    let range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, node.data.length);
    return range;
  }

  let converting = false;
  return {
    init: (id) => {
      if(window.getSelection && document.createRange) {
        document.addEventListener('DOMContentLoaded', () => {
          let editorDiv = document.getElementById(id);
          if(editorDiv){
            editorDiv.contentEditable = true;
            
            editorDiv.onkeyup = debounce((e)=> {
              let selection = window.getSelection();
              let targetNode = selection.focusNode;
              let positionCompensation = 0;
              
                console.log(`Target node is ${targetNode.nodeName}(${targetNode.data??targetNode.innerText})`);
                selection.removeAllRanges();
                let targetRange = wrapRange(targetNode);
                selection.addRange(targetRange);
                converting = true;
                while((match = URLRegex.exec(targetNode.data)) && converting){
                  let url = match[0];
                  
                  if(selection.rangeCount) {
                    let range = deleteUrlText(selection, url, positionCompensation);
                    let linkNode = createLink(url);
                    range.insertNode(linkNode);
                    selection.collapseToEnd();
                  console.log(`Convert '${url}' to hyperlink`);
                  }
                  converting = false;
                }
            }, 500);
          }
        });
      }else {
        console.error('Functions \'getSelection\' and \`createRange\` don\'t exist');
      }
      
    }
  }
})();