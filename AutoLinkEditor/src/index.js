import initializer from './Initializer';
import { contentConvertor, nodeHandler} from './HyperlinkGenerator';

window.AutoLinkEditor = (() => {
  let pasting = false;
  let inclusion;
  return {
    init: function(id) {
      if(id && id.trim()){
        const target = document.getElementById(id);
        try{
          initializer.setup(target);
          target.onpaste = initializer.idle(e => {
            pasting = true;
            console.log('create anchors in onpaste');
            target.innerHTML= contentConvertor.extractTextAndAnchor(target, inclusion, nodeHandler);
            inclusion = contentConvertor.indexAnchors(target);
          }, 0);
          
          const handleKeyup = initializer.idle(e => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }else if(!pasting){
              console.log('create anchors in keyup');
              const position = contentConvertor.saveSelection(target);
              target.innerHTML= contentConvertor.extractTextAndAnchor(target, inclusion, nodeHandler);
              contentConvertor.restoreSelection(target, position);
            }else {
              pasting = false;
            }
          }, 1000);
          
          target.onkeyup = handleKeyup;
          target.onblur = initializer.blur(e => {
            target.innerHTML= contentConvertor.extractTextAndAnchor(target, inclusion, nodeHandler);
          });
          target.onfocus = e => {
            contentConvertor.indexAnchors(target);
          }
        }catch(e){
          console.error(e);
        }
      }else{
        console.warn('init failed: id cannot be undefined, null, empty or white space');
      }
    }
  }
})();