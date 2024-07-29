const contentConvertor= (() => ({
  restoreSelection: (target, position) => {
    if(!target || !(target instanceof HTMLElement)) {
      throw Error("restore selection failed: target must be an html element");
    }
    if (!position || typeof position.start !== 'number' || typeof position.end !== 'number' || start > end) {
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
      if (!foundStart || !range.collapsed) {
        throw Error("estore selection failed: could not find the start or end position within the target node.");
      }
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }else {
      throw Error("restore selection failed: the current context does not support createRange or getSelection function.")
    }
  }}))();