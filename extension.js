import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';


const SHORTCUT = 'grayscale-window-shortcut';

export const GrayscaleWindowEffect = GObject.registerClass(
class GrayscaleWindowEffect extends Clutter.ShaderEffect {
	vfunc_get_static_shader_source() {
		return ' \n\
			uniform sampler2D tex; \n\
			void main() { \n\
				vec4 color = texture2D(tex, cogl_tex_coord_in[0].st); \n\
				// unapply pre-multiplied alpha \n\
				if(color.a > 0.0) { \n\
					color.rgb /= color.a; \n\
				} \n\
				// convert to linear gamma space (approx) \n\
				color.rgb = pow(color.rgb, vec3(2.4)); \n\
				// https://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale \n\
				vec3 luminosityCoefs = vec3(.21, .71, .08); \n\
				color.rgb = vec3(dot(color.rgb, luminosityCoefs)); \n\
				// convert back to compressed gamma space (approx) \n\
				color.rgb = pow(color.rgb, vec3(1.0 / 2.4)); \n\
				// restore pre-multiplied alpha \n\
				color.rgb *= color.a; \n\
				cogl_color_out = color * cogl_color_in; \n\
			} \n\
		';
	}

	vfunc_paint_target(...args) {
		this.set_uniform_value("tex", 0);
		super.vfunc_paint_target(...args);
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
					let effect = new GrayscaleWindowEffect();
					actor.add_effect_with_name('grayscale-color', effect);
					meta_window._grayscale_window_tag = true;
				}
			}
		}, this);
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

		global.get_window_actors().forEach(function(actor) {
			let meta_window = actor.get_meta_window();
			if(meta_window.hasOwnProperty('_grayscale_window_tag')) {
				let effect = new GrayscaleWindowEffect();
				actor.add_effect_with_name('grayscale-color', effect);
			}
		}, this);
	}

	disable() {
		Main.wm.removeKeybinding(SHORTCUT);

		global.get_window_actors().forEach(function(actor) {
			actor.remove_effect_by_name('grayscale-color');
		}, this);

		this._settings = null;
	}
};
