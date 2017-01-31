'use babel';

import CaniuseCssView from './caniuse-css-view';
import { CompositeDisposable } from 'atom';

export default {

  caniuseCssView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.caniuseCssView = new CaniuseCssView(state.caniuseCssViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.caniuseCssView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

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
  }

};
