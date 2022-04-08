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
const Image = Gio.icon_new_for_string(Me.path + "/nextcloud.svg");
const NextcloudPath = GLib.build_filenamev([GLib.get_home_dir(), 'Nextcloud']);
const NextcloudUri = GLib.filename_to_uri(NextcloudPath, null);
const file = Gio.File.new_for_uri(NextcloudUri)


const Indicator = GObject.registerClass(
    class Indicator extends PanelMenu.Button {
        _openFolder() {
            if (file.query_exists(null)) {
                Gio.AppInfo.launch_default_for_uri_async(NextcloudUri, null, null, null);
            } else {
                Main.notify("Can't find : " + NextcloudPath);
            }
        }

        _init() {
            super._init(0.0, _('Nextcloud Folder'));
            let button = new St.Bin({
                reactive: true,
            });
            let icon = new St.Icon({
                gicon: Image,
                style_class: 'nextcloud-icon'
            });
            button.set_child(icon);
            this.add_child(button);

            button.connect('button-press-event', this._openFolder);
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
