const URLRegex = /^(https?:\/\/(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+\.)+(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+))(:\d+)?(\/.*)?(\?.*)?(#.*)?$/;
const URLInTextRegex = /(https?:\/\/(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+\.)+(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+))(:\d+)?(\/.*)?(\?.*)?(#.*)?/;

const nodeHandler = (() => {
  const escapeHtml = (text) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, m => map[m] );
  };
  return {
    handleAnchor: anchor => {
      if(anchor && anchor instanceof HTMLAnchorElement){
        const text = anchor.textContent;
        if(URLRegex.test(text)){
          anchor.href = text;
          return anchor.outerHTML;
        }else {
          return anchor.innerHTML;
        }
      }else{
        throw TypeError("handle anchor error: the target is undefined, null or not a anchor");
      }
    }
};})();