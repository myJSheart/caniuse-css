'use babel';

import CaniuseCssView from './caniuse-css-view';
import { CompositeDisposable } from 'atom';
import { MessagePanelView, PlainMessageView } from 'atom-message-panel';
import { getSupport } from 'caniuse-api';

export default {

  caniuseCssView: null,
  modalPanel: null,
  subscriptions: null,


  activate(state) {
    this.caniuseCssView = new CaniuseCssView(state.caniuseCssViewState);
    this.modalPanel = atom.workspace.addBottomPanel({
      item: this.caniuseCssView.getElement(),
      priority: 100
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    const bottomMessage = this.caniuseCssView.getElement();
    let editor = atom.workspace.getActiveTextEditor();
    this.subscriptions.add(editor.onDidChangeCursorPosition((event) =>{
      if (event.oldBufferPosition.toArray()[0] !== event.newBufferPosition.toArray()[0]) {
        const line = event.cursor.getCurrentBufferLine();
        const css = this.getCSSAttribute(line);
        const compatibility = this.getCompatibility(css);
        console.log(css);
        console.log(compatibility);
        console.log(this.compatibilityToHTML(css, compatibility));
        bottomMessage.innerHTML = this.compatibilityToHTML(css, compatibility);
      }
    }));

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'caniuse-css:toggle': (event) => {

      }
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.caniuseCssView.destroy();
  },

  serialize() {
    return {
      caniuseCssViewState: this.caniuseCssView.serialize()
    };
  },

  toggle() {
    console.log('CaniuseCss was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  },

  /**
  * Get CSS Attribute from a string
  * Input: text: string,
  * Output: result: string,
  */
  getCSSAttribute(text) {
    // split the text with ':' and return the first element
    return text.split(':')[0].trim();
  },

  /**
  * Get compatibility result from http://caniuse.com/
  * Input: CSSAttribute: string
  * Output: result: Object
  * Compatibility is an important object which record the object from getSupport() directly
  */
  getCompatibility(CSSAttribute) {
    let explorerList = {
      and_chr: { y: -1 },
      and_uc: { y: -1 },
      android: { y: -1 },
      chrome: { y: -1 },
      edge: { y: -1 },
      firefox: { y: -1 },
      ie: { y: -1 },
      ie_mob: { y: -1 },
      ios_saf: { y: -1 },
      op_mini: { y: -1 },
      opera: { y: -1 },
      safari: { y: -1 },
      samsung: { y: -1 },
    };

    try {
      let result = explorerList;
      const compatList = getSupport(CSSAttribute, true);
      Object.keys(explorerList).forEach((explorer) => {
        if (compatList[explorer] !== undefined) {
          result[explorer] = compatList[explorer]['y'];
        }
      });
      Object.keys(result).forEach((key) => {
        if (result[key] === undefined) {
          result[key] = -1;
        }
      });
      return result;
    } catch (e) {
      console.log(e);
      return {};
    }
  },
  /**
  * Convert an object to a string.
  * Input: originalObject: object
  * Output: a string.
  */
  toString(originalObject) {
    if (Object.keys(originalObject).length === 0) {
      return 'Not Found';
    }
    let result = '';
    Object.keys(originalObject).forEach((key) => {
      result = result + key + ' : ' + originalObject[key] + ','
    });
    result = result.substring(0, result.length - 1);
    return result;
  },
  /**
  * Convert a compatibility list into a html string
  * Input: compatibility: object; CSSAttribute: string
  * Output: htmlString: string
  *     and_chr: { y: -1 },
        and_uc: { y: -1 },
        android: { y: -1 },
        chrome: { y: -1 },
        edge: { y: -1 },
        firefox: { y: -1 },
        ie: { y: -1 },
        ie_mob: { y: -1 },
        ios_saf: { y: -1 },
        op_mini: { y: -1 },
        opera: { y: -1 },
        safari: { y: -1 },
        samsung: { y: -1 },
  */
  compatibilityToHTML(CSSAttribute, compatibility) {
    let htmlString = '';
    if (Object.keys(compatibility).length === 0) {
      return `<div class="not-found">${CSSAttribute}: Not Found</div>`;
    }
    Object.keys(compatibility).forEach((key) => {
      // console.log(key);
      switch (key) {
        case "and_chr":
          console.log(compatibility[key]);
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="not-support">Android Chrome<i class="android icon"></i>Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="support">Android Chrome<i class="android icon"></i>${compatibility[key]}+</div>`;
          }
          break;
        case "android":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="not-support">Android Native<i class="android icon"></i>Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="support">Android Native<i class="android icon"></i>${compatibility[key]}+</div>`;
          }
          break;
        case "chrome":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="not-support">Chrome<i class="chrome icon"></i>Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="support">Chrome<i class="chrome icon"></i>${compatibility[key]}+</div>`;
          }
          break;
        case "firefox":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="not-support">Firefox<i class="firefox icon"></i>Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="support">Firefox<i class="firefox icon"></i>${compatibility[key]}+</div>`;
          }
          break;
        case "edge":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="not-support">Microsoft Edge<i class="microsoft edge icon"></i>Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="support">Microsoft Edge<i class="microsoft edge icon"></i>${compatibility[key]}+</div>`;
          }
          break;
        case "ie":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="not-support">IE<i class="internet explorer icon"></i>Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="support">IE<i class="internet explorer icon"></i>${compatibility[key]}+</div>`;
          }
          break;
        case "ie_mob":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="not-support">IE Mobile<i class="internet explorer icon"></i>Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="support">IE Mobile<i class="internet explorer icon"></i>${compatibility[key]}+</div>`;
          }
          break;
        case "safari":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="not-support">Safari<i class="safari icon"></i>Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="support">Safari<i class="safari icon"></i>${compatibility[key]}+</div>`;
          }
          break;
        case "ios_saf":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="not-support">IOS Safari<i class="safari icon"></i>Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="support">IOS Safari<i class="safari icon"></i>${compatibility[key]}+</div>`;
          }
          break;
        case "opera":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="not-support">Opera<i class="opera icon"></i>Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="support">Opera<i class="opera icon"></i>${compatibility[key]}+</div>`;
          }
          break;
        case "op_mini":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="not-support">Opera Mini<i class="opera icon"></i>Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="support">Opera Mini<i class="opera icon"></i>${compatibility[key]}+</div>`;
          }
          break;
        default:
          break;
      }
    });
    htmlString = `<div>${htmlString}</div>`;

    return htmlString;
  }
};
