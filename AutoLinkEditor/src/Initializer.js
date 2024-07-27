const initializer = (() => ({
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
  timer: null,
  idle(func, delay) {
    const idleHandler = function() {
      if(this.timer){
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.timer = setTimeout(() => {
        func(...arguments);
        this.timer = null;
      }, delay??1000);
      
    };
    return idleHandler.bind(this);
  }
}))();

export default initializer;