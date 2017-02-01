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

    // let messages = new MessagePanelView({
    //   title: 'Results'
    // });
    //
    // messages.attach();

    const bottomMessage = this.caniuseCssView.getElement();

    let editor = atom.workspace.getActiveTextEditor();
    this.subscriptions.add(editor.onDidChangeCursorPosition((event) =>{
      if (event.oldBufferPosition.toArray()[0] !== event.newBufferPosition.toArray()[0]) {
        const line = event.cursor.getCurrentBufferLine();
        const css = this.getCSSAttribute(line);
        const compatibility = this.getCompatibility(css);
        bottomMessage.innerHTML = '';
        const message = document.createElement('div');
        message.textContent = this.toString(compatibility);
        bottomMessage.appendChild(message);
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
  }
};
