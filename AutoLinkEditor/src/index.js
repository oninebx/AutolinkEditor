import initializer from './Initializer';
import hyperlinkGenerator from './HyperlinkGenerator';


window.AutoLinkEditor = (() => {
  return {
    divBox: document.createElement("div"),
    init: function(id) {
      if(id){
        const target = document.getElementById(id);
        try{
          initializer.setup(target);
          const handleKeyup = initializer.idle(e => {
            let targetText = hyperlinkGenerator.extractTextWithAnchors(target);
            this.divBox.innerHTML = targetText;
            console.log(this.divBox.childNodes);
            target.innerHTML = targetText;
          });
          
          target.onkeyup = handleKeyup;
        }catch(e){
          console.error(e);
        }
      }
    }
  }
})();



// window.AutoLinkEditor = (() => {
//   const URLRegex = /(https?:\/\/(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+\.)+(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+))(:\d+)?(\/.*)?(\?.*)?(#.*)?/g;
//   const debounce = (func, wait) => {
//     let timeout;
//     return (...args) => {
//         const context = this;
//         clearTimeout(timeout);
//         timeout = setTimeout(() => func.apply(context, args), wait);
//     };
//   };

//   const wrapDiv = node => {
//     let div = document.createElement("div");
//     div.appendChild(node);
//     return div;
//   }
//   const deleteUrlText = (selection, url, compensation) => {
//     let range = selection.getRangeAt(0);
//     console.log(`range.endOffset = ${range.endOffset}`)
//     const endPos = range.endOffset - compensation;
//     const startPos = endPos - url.length;
//     const targetRange = document.createRange();
//     targetRange.setStart(selection.focusNode, startPos);
//     targetRange.setEnd(selection.focusNode, endPos);
//     targetRange.deleteContents();
//     console.log(`Delete ${url} from text`);
//     return targetRange;
//   }

//   const wrapRange = node => {
//     let range = document.createRange();
//     range.setStart(node, 0);
//     range.setEnd(node, node.data.length);
//     return range;
//   }

//   let converting = false;
//   return {
//     init: (id) => {
//       if(window.getSelection && document.createRange) {
//         document.addEventListener('DOMContentLoaded', () => {
//           let editorDiv = document.getElementById(id);
//           if(editorDiv){
//             editorDiv.contentEditable = true;
            
//             editorDiv.onkeyup = debounce((e)=> {
//               let selection = window.getSelection();
//               let targetNode = selection.focusNode;
//               let positionCompensation = 0;
//               switch(e.keyCode){
//                 case 8:  // delete
//                   break;
//                 case 13: // enter
//                   e.preventDefault();
//                   let nodes = editorDiv.childNodes;
//                   targetNode = nodes[nodes.length - 2];
//                   if(targetNode.nodeType === 1) { // div element
//                     targetNode.remove();
//                     const text = hyperlinkGenerator.convertDivToTextWithBr(targetNode);
//                     // let text = document.createTextNode(targetNode.innerText);
//                     // let br = document.createElement('br');
//                     // editorDiv.insertBefore(text, nodes[nodes.length - 1]);
//                     // editorDiv.insertBefore(br, text);
//                     targetNode = text;
//                     editorDiv.insertBefore(text, nodes[nodes.length - 1]);
//                   }
//                   // if(targetNode.nodeType === 3){ // text
//                   //   editorDiv.removeChild(targetNode);
//                   //   targetNode = wrapDiv(targetNode);
//                   //   editorDiv.insertBefore(targetNode, nodes[nodes.length - 1]);
//                   // }
//                   break;
//                 case 32: // whitespace
//                   positionCompensation = 1;
//                   break;
//                 default:
//                   return;
//               }
//                 console.log(`Target node is ${targetNode.nodeName}(${targetNode.data??targetNode.innerText})`);
//                 selection.removeAllRanges();
//                 let targetRange = wrapRange(targetNode);
//                 selection.addRange(targetRange);
//                 converting = true;
//                 while((match = URLRegex.exec(targetNode.data)) && converting){
//                   let url = match[0];
                  
//                   if(selection.rangeCount) {
//                     let range = deleteUrlText(selection, url, positionCompensation);
//                     let linkNode = hyperlinkGenerator.createLink(url);
//                     range.insertNode(linkNode);
//                     selection.collapseToEnd();
//                   console.log(`Convert '${url}' to hyperlink`);
//                   }
//                   converting = false;
//                 }
//             }, 500);
//           }
//         });
//       }else {
//         console.error('Functions \'getSelection\' and \`createRange\` don\'t exist');
//       }
      
//     }
//   }
// })();