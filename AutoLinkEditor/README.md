# AutoLink Editor
![Javascript](https://img.shields.io/badge/JavaScript-passing-forestgreen)
![License](https://img.shields.io/badge/license-MIT-green)

## Table of Contents
* [Introduction](#introduction)
* [Features](*features)

## <a name="introduction">Introduction</a>

### Terminologies
* **Plain anchor** only includes the href attribute and the text.
* **Diff-Anchor** stands for the plain anchor whose href is different from its text.
```
<a href="https://www.example.com">Example</a>
```
* **Same-Anchor** stands for the plain anchor whose href is same to its text.
```
<a href="https://www.example.com">https://www.example.com</a>
```

## <a name="features">Features</a>

### Handling URLs and Anchors in Pasted HyperText
* Only retain the anchors and text
* The anchors, and valid URLs within the text will be converted into plain anchors.

### Handling input text
* It can process the input text and dynamically convert valid URLs within the text into plain anchors.

* When deleting text within an anchor
	* If it is a diff-anchor, it will not take any action until all the text within the anchor is deleted, at which point the anchor itself will be removed.
	* For a same-anchor, if the remaining anchor text is still a valid URL after deletion, the href will be updated to match the text. Otherwise, the anchor will be converted into plain text.

* When converting between text and anchors, it must maintain the cursor position.


# Reference
https://stackoverflow.com/questions/24162684/how-to-auto-convert-an-url-into-a-hyperlink-when-it-is-pasted?noredirect=1&lq=1

https://juejin.cn/post/7300924126457462836

https://zh.javascript.info/selection-range

Welcome to My WebsiteHomeAboutContactArticle TitleThis is a sample article with some text. Visit our blog for more articles.Related https://zh.javascript.info/selection-range  LinksResource 1Resource 2Resource 3© 2024 My Website. All rights reserved. Privacy Policy