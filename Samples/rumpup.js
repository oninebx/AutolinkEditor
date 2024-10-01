const nodeHandler = (() => {
  return {
    compensateBR: target => {
      if(target && 
        (target instanceof HTMLBRElement || ElementsOfBR.has(window.getComputedStyle(target).display))){
          return "<br />";
      }
      return "";
    }
  };
})();