const URLRegex = /^(https?:\/\/(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+\.)+(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+))(:\d+)?(\/.*)?(\?.*)?(#.*)?$/;

const HyperlinkGenerator = (() => ({
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
  convertDivToTextWithBr: (divNode) => {
    const fragment = document.createDocumentFragment();
    const text = document.createTextNode(divNode.innerText);
    const br = document.createElement('br');
    fragment.append(br, text);
    return fragment;
  }
}))();

export default HyperlinkGenerator;