import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

const SHORTCUT = 'grayscale-window-shortcut';
const GLOBAL_SHORTCUT = 'grayscale-global-shortcut';

export const GrayscaleEffect = GObject.registerClass(
class DesaturateEffect extends Clutter.DesaturateEffect {
    constructor() {
		super();
        this.factor = 1.0;
    }
});

export default class GrayscaleWindow extends Extension {
	toggle_effect() {
		global.get_window_actors().forEach(function(actor) {
			let meta_window = actor.get_meta_window();
			if(meta_window.has_focus()) {
				if(actor.get_effect('grayscale-color')) {
					actor.remove_effect_by_name('grayscale-color');
					delete meta_window._grayscale_window_tag;
				}
				else {
					let effect = new GrayscaleEffect();
					actor.add_effect_with_name('grayscale-color', effect);
					meta_window._grayscale_window_tag = true;
				}
			}
		}, this);
	}

	toggle_global_effect() {
		if(Main.uiGroup.get_effect('grayscale-color')) {
			Main.uiGroup.remove_effect_by_name('grayscale-color');
		}
		else {
			let effect = new GrayscaleEffect();
			Main.uiGroup.add_effect_with_name('grayscale-color', effect);
		}
	}

	enable() {
		this._settings = this.getSettings();

		Main.wm.addKeybinding(
			SHORTCUT,
			this._settings,
			Meta.KeyBindingFlags.NONE,
			Shell.ActionMode.NORMAL,
			() => { this.toggle_effect(); }
		);

		Main.wm.addKeybinding(
			GLOBAL_SHORTCUT,
			this._settings,
			Meta.KeyBindingFlags.NONE,
			Shell.ActionMode.NORMAL,
			() => { this.toggle_global_effect(); }
		);

		global.get_window_actors().forEach(function(actor) {
			let meta_window = actor.get_meta_window();
			if(meta_window.hasOwnProperty('_grayscale_window_tag')) {
				let effect = new GrayscaleEffect();
				actor.add_effect_with_name('grayscale-color', effect);
			}
		}, this);
	}

	disable() {
		Main.wm.removeKeybinding(SHORTCUT);
		Main.wm.removeKeybinding(GLOBAL_SHORTCUT);

		global.get_window_actors().forEach(function(actor) {
			actor.remove_effect_by_name('grayscale-color');
		}, this);

		this._settings = null;
	}
};
