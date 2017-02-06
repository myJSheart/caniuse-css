'use babel';

import CaniuseCssView from './caniuse-css-view';
import { CompositeDisposable } from 'atom';
import { getSupport } from 'caniuse-api';
import FuzzySet from 'fuzzyset.js';

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

    const bottomMessage = this.caniuseCssView.getElement();

    ///////////////////Getting Data//////////////////
    const jsonObject = this.readJsonFile();
    const supportJson = this.getSupportInfo(jsonObject);
    const attributeNames = this.getAttributeNames(supportJson);
    const fuzzySet = new FuzzySet(attributeNames);
    bottomMessage.innerHTML = 'Ready to Go! Please move cursor or type an attribute';
    ////////////////Getting Data End/////////////////


    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    let editor = atom.workspace.getActiveTextEditor();
    this.subscriptions.add(editor.onDidChangeCursorPosition((event) => {
      const line = event.cursor.getCurrentBufferLine();
      const css = this.getCSSAttribute(line);
      const compatibility = this.getCompatibility(css);
      bottomMessage.innerHTML = this.compatibilityToHTML(css, compatibility, fuzzySet);
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
   * @input: text: string,
   * @output: result: string,
   */
  getCSSAttribute(text) {
    // split the text with ':' and return the first element
    return text.split(':')[0].trim();
  },

  /**
   * Get compatibility result from http://caniuse.com/
   * @input: CSSAttribute: string
   * @output: result: Object
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
   * @input: originalObject: object
   * @output: a string.
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
  * @input: compatibility: object; CSSAttribute: string
  * @output: htmlString: string
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
  compatibilityToHTML(CSSAttribute, compatibility, fuzzySet) {
    let htmlString = '';
    let matchArray = '';
    if (Object.keys(compatibility).length === 0) {
      if (CSSAttribute.trim() !== '') {
        matchArray = this.getMatch(CSSAttribute, fuzzySet);
        if(matchArray.length === 0) {
          return `<div><div class="jr-studio-attribute">${CSSAttribute}</div><div class="jr-studio-not-found">Not Found. No Match</div><div>`;
        }
        return `<div><div class="jr-studio-attribute">${CSSAttribute}</div><div class="jr-studio-not-found">Not Found</div></br><div class="jr-studio-tips"><div style={ color: 'white' }>Do you mean: </div><b>${matchArray.toString()}</b></div></div>`;
      } else {
        return `<div><div class="jr-studio-attribute">NULL input</div></div>`;
      }
    }
    Object.keys(compatibility).forEach((key) => {
      switch (key) {
        case "and_chr":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="jr-studio-not-support">Android Chrome Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="jr-studio-support">Android Chrome ${compatibility[key]}+</div>`;
          }
          break;
        case "android":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="jr-studio-not-support">Android Native Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="jr-studio-support">Android Native ${compatibility[key]}+</div>`;
          }
          break;
        case "chrome":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="jr-studio-not-support">Chrome Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="jr-studio-support">Chrome ${compatibility[key]}+</div>`;
          }
          break;
        case "firefox":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="jr-studio-not-support">Firefox Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="jr-studio-support">Firefox ${compatibility[key]}+</div>`;
          }
          break;
        case "edge":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="jr-studio-not-support">Microsoft Edge Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="jr-studio-support">Microsoft Edge ${compatibility[key]}+</div>`;
          }
          break;
        case "ie":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="jr-studio-not-support">IE Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="jr-studio-support">IE ${compatibility[key]}+</div>`;
          }
          break;
        case "ie_mob":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="jr-studio-not-support">IE Mobile Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="jr-studio-support">IE Mobile ${compatibility[key]}+</div>`;
          }
          break;
        case "safari":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="jr-studio-not-support">Safari Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="jr-studio-support">Safari ${compatibility[key]}+</div>`;
          }
          break;
        case "ios_saf":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="jr-studio-not-support">IOS Safari Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="jr-studio-support">IOS Safari ${compatibility[key]}+</div>`;
          }
          break;
        case "opera":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="jr-studio-not-support">Opera Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="jr-studio-support">Opera ${compatibility[key]}+</div>`;
          }
          break;
        case "op_mini":
          if (compatibility[key] === -1) {
            htmlString = `${htmlString}<div class="jr-studio-not-support">Opera Mini Not Support</div>`;
          } else {
            htmlString = `${htmlString}<div class="jr-studio-support">Opera Mini ${compatibility[key]}+</div>`;
          }
          break;
        default:
          break;
      }
    });
    htmlString = `<div><div class="jr-studio-attribute">${CSSAttribute}</div>${htmlString}</div>`;

    return htmlString;
  },


  /**
   * Read caniuse-data.jso file and return an object
   */
  readJsonFile() {
    const { app } = require('electron');
    const fs = require('fs');
    const path = require('path');
    const jsonObject = JSON.parse(fs.readFileSync(path.join(__dirname, 'caniuse-data.json'), 'utf8'));
    return jsonObject;
  },

  /**
   * get support information from an json object
   * @input: jsonObject: a json object
   * @output: supportJson: a json object
   */
  getSupportInfo(jsonObject) {
    const supportJson = jsonObject['data'];
    return supportJson;
  },

  /**
   * get all attributes name from a json object
   * @input: supportJson: a json object
   * @output: attributes: an array of strings
   */
  getAttributeNames(supportJson) {
    let attributesName = [];
    Object.keys(supportJson).forEach((key) => {
      attributesName.push(key);
    });
    return attributesName;
  },

  /**
   * get support information of an input attribute
   * @input: attribute: String
   * @output: supportObject: Object
   */
  getSupport(attribute, supportJson) {
    let supportObject = {};
    try {
      const stats = supportJson[attribute]['stats'];
      Object.keys(stats).forEach((explorer) => {
        Object.keys(stats[explorer]).forEach((version) => {
          if (Object.keys(supportObject).includes(stats[explorer][version]) === false) {
            supportObject[stats[explorer][version]] = version;
          }
        });
      });
    } catch (e) {
      console.log(`${e} does not exist`);
      supportObject = {
        notexist: 'notexist'
      };
    }
    return supportObject;
  },

  /**
   * approximate string match
   * @input: userInput: a string input by user
   *        attributeArray: an array that contains all attribute's name
   * @output: matchArray: an array that match user input string in dec
   */
  getMatch(userInput, fuzzySet) {
    let matchArray = [];
    matchArray = fuzzySet.get(userInput);
    if (matchArray === null || matchArray.length === 0) {
      return [];
    }
    return this.bubbleSort(matchArray);
  },

  /**
  * An implement of bubble sort.
  * @input: matchArray: an array of array, whose child array is a score(pair[0]) with a string(pair[1])
  * @output: resultArray: a (DEC) sorted array, contains only strings
  */
  bubbleSort(matchArray) {
     const len = matchArray.length;
     let resultArray = [];
     for (let i = len-1; i >= 0; i--){
       for(let j = 1; j <= i; j++){
         if(matchArray[j - 1][0] < matchArray[j][0]){
             let temp = matchArray[j-1];
             matchArray[j - 1] = matchArray[j];
             matchArray[j] = temp;
          }
       }
     }
     matchArray.forEach((pair) => {
       resultArray.push(pair[1]);
     });

     return resultArray;
  }

};
