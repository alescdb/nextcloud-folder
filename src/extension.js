/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const { GObject, St, GLib, Gio } = imports.gi;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const ExtensionUtils = imports.misc.extensionUtils;

const Indicator = GObject.registerClass(
    class Indicator extends PanelMenu.Button {
        _openFolder() {
            const path = this._getPath();
            const uri = GLib.filename_to_uri(path, null);
            const file = Gio.File.new_for_uri(uri);

            if (file.query_exists(null)) {
                Gio.AppInfo.launch_default_for_uri_async(uri, null, null, null);
            } else {
                Main.notify("Can't find : " + path);
            }
        }

        _getIcon() {
            if (this._settings.get_boolean('dark')) {
                return Gio.icon_new_for_string(Me.path + "/nextcloud-dark.svg");
            }
            return Gio.icon_new_for_string(Me.path + "/nextcloud-light.svg");
        }

        _getPath() {
            if (this._settings.get_boolean('custom-path')) {
                const path = this._settings.get_string('path');
                if (path) {
                    return path;
                }
            }
            return GLib.build_filenamev([GLib.get_home_dir(), 'Nextcloud']);
        }

        _init() {
            super._init(0.0, _('Nextcloud Folder'));
            this._settings = ExtensionUtils.getSettings();

            const button = new St.Bin({
                reactive: true,
            });
            const icon = new St.Icon({
                gicon: this._getIcon(),
                style_class: 'nextcloud-icon'
            });

            this._settings.connect('changed::dark', () => {
                icon.gicon = this._getIcon();
            });

            button.set_child(icon);
            this.add_child(button);

            button.connect('button-press-event', () => {
                this._openFolder()
            });
        }
    });

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
