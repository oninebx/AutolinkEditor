const initializer = (() => {
  const timer = Symbol('timer');
  return {
    [timer]: null,
    setup: target => {
      if(target && target.contentEditable){
        if(window.getSelection && document.createRange){
          target.contentEditable = true;
          target.focus();
        }else{
          throw Error("setup failed: the browser doesn't support getSelection or createRange functions");
        }
      }else{
        throw Error("setup failed: the target element does not exist or does not support the contentEditable attribute");
      }
    },
    idle(func, delay = 1000) {
      if (typeof func !== 'function') {
        throw new TypeError('idle failed: expected a function');
      }
      if (typeof delay !== 'number' || delay < 0) {
        throw new TypeError('idle failed: expected a non-negative number for delay');
      }
      const idleHandler = function(...args) {
        if(this[timer]){
          clearTimeout(this[timer]);
          this[timer] = null;
        }
        this[timer] = setTimeout(() => {
          func(...args);
          this[timer] = null;
        }, delay);
        
      };
      return idleHandler.bind(this);
    },
    blur(func) {
      if (typeof func !== 'function') {
        throw new TypeError('Expected a function');
      }
      const blurHandler = function(...args) {
        if(this[timer]) {
          clearTimeout(this[timer]);
          this[timer] = null;
          func(...args);
        }
        
      }
      return blurHandler.bind(this);
    }
}})();


export default initializer;