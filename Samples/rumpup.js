const contentConvertor= (() => {
  const ANCHOR_STORE = Symbol("anchors");
  return {
    [ANCHOR_STORE]: {},
    indexAnchors(target) {
      this[ANCHOR_STORE] = {};
      if(target && target instanceof HTMLElement) {
        const anchorTags = target.querySelectorAll('a');
        if(anchorTags) {
          const idPrefix = target.id ?? target.dataset.id;
          anchorTags.forEach((anchor, index) => {
            const anchorId = anchor.dataset.id ?? `${idPrefix}-anchor-${index}`;
            if(anchor.href.replace(/\/+$/, '') === anchor.textContent) {
              if(!anchor.dataset.id){
                anchor.setAttribute('data-id', anchorId);
              }
              this[ANCHOR_STORE][anchorId] = anchor.href;
            }
          });
        }
      }else {
        throw TypeError("index anchors failed: the node is undefined, null or not a node");
      }
      
    }
  }
})();