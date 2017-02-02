'use babel';

import CaniuseCssView from './caniuse-css-view';
import { CompositeDisposable } from 'atom';
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
      const line = event.cursor.getCurrentBufferLine();
      const css = this.getCSSAttribute(line);
      const compatibility = this.getCompatibility(css);
      bottomMessage.innerHTML = this.compatibilityToHTML(css, compatibility);
    }));

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'caniuse-css:toggle': () => this.toggle()
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
      return `<div class="not-found"><div class="attribute">${CSSAttribute}</div><div class="not-found">Not Found</div></div>`;
    }
    Object.keys(compatibility).forEach((key) => {
      switch (key) {
        case "and_chr":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="not-support">Android Chrome Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="support">Android Chrome ${compatibility[key]}+</div>`;
          }
          break;
        case "android":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="not-support">Android Native Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="support">Android Native ${compatibility[key]}+</div>`;
          }
          break;
        case "chrome":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="not-support">Chrome Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="support">Chrome ${compatibility[key]}+</div>`;
          }
          break;
        case "firefox":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="not-support">Firefox Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="support">Firefox ${compatibility[key]}+</div>`;
          }
          break;
        case "edge":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="not-support">Microsoft Edge Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="support">Microsoft Edge ${compatibility[key]}+</div>`;
          }
          break;
        case "ie":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="not-support">IE Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="support">IE ${compatibility[key]}+</div>`;
          }
          break;
        case "ie_mob":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="not-support">IE Mobile Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="support">IE Mobile ${compatibility[key]}+</div>`;
          }
          break;
        case "safari":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="not-support">Safari Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="support">Safari ${compatibility[key]}+</div>`;
          }
          break;
        case "ios_saf":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="not-support">IOS Safari Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="support">IOS Safari ${compatibility[key]}+</div>`;
          }
          break;
        case "opera":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="not-support">Opera Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="support">Opera ${compatibility[key]}+</div>`;
          }
          break;
        case "op_mini":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="not-support">Opera Mini Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="support">Opera Mini ${compatibility[key]}+</div>`;
          }
          break;
        default:
          break;
      }
    });
    htmlString = `<div><div class="attribute">${CSSAttribute}</div>${htmlString}</div>`;

    return htmlString;
  }
};
