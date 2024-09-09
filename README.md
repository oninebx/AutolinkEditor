# AutoLink Editor
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/oninebx/AutolinkEditor/publish.yml)
![GitHub package.json version](https://img.shields.io/github/package-json/v/oninebx/AutolinkEditor?color=green)
![License](https://img.shields.io/badge/license-MIT-green)


## Table of Contents
* [Introduction](#introduction)
* [Features](#features)
* [Usage](#usage)
* [Demo](#demo)
* [Reference](#reference)
* [Release Notes](#releasenotes)

## <a name="introduction">Introduction</a>
AutolinkEditor is a lightweight and simple text editor inspired by a specific requirement in a project. It automatically converts rich text pasted into the editor into plain text with the format of editor, and also automatically detects URLs in both pasted and manually entered text, converting them into anchor tags.

## <a name="usage">Usage</a>

## <a name="features">Features</a>

* **Rich Text Conversion:** Automatically converts rich text pasted into the editor to a simple, clean format based on the editor's default style.
* **URL Detection in Pasted Text:** Automatically identifies URLs within pasted content and transforms them into clickable anchor `(<a>)` tags.
* **URL Detection in Input Text:** As the user types, URLs are detected in real-time and converted into anchor tags.
* **Update or remove anchor:** When the user modifies the text within an anchor tag, it will detect in real-time whether the anchor text is a URL and automatically update the anchor's href attribute, or convert the anchor tag into plain text.

# <a name="reference">Reference</a>
[How to auto convert an url into a hyperlink when it is pasted](https://stackoverflow.com/questions/24162684/how-to-auto-convert-an-url-into-a-hyperlink-when-it-is-pasted?noredirect=1&lq=1)

# <a name="releasenotes">Release Notes</a>

## Release Note v1.0.0
This release introduces a lightweight text editor with automatic link detection and rich text handling, built to streamline user experiences when pasting and editing content.

### Key Features

1. **Rich Text Conversion**

	Automatically converts pasted rich text into the default formatting of the editor. This simplifies pasted content, ensuring consistency in the editor.

2. **Automatic URL Detection in Pasted Text**

	Detects URLs within pasted text and converts them into clickable anchor tags `(<a>)`. No need for manual link insertion.
	
3. **Real-time URL Detection in Typed Text**

	As users type URLs directly into the editor, they are instantly transformed into clickable anchor tags.

4. **Dynamic Anchor Update**

	When editing existing anchor tags, the editor detects changes and updates the anchor’s href attribute if the text is still a valid URL. If not, the anchor tag is automatically converted back into plain text.
-----